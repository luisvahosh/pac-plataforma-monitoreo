import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../seguridad/hash.service';
import { CifradoService } from '../seguridad/cifrado.service';
import { TotpService } from '../seguridad/totp.service';
import { CorreoService } from '../correo/correo.service';
import { JwtPayload } from './tipos';
import { ActivarCuentaDto } from './dto/activar-cuenta.dto';
import { LoginDto } from './dto/login.dto';
import { Verificar2faDto } from './dto/verificar-2fa.dto';
import { RestablecerPasswordDto, SolicitarRecuperacionDto } from './dto/recuperacion.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
    private readonly cifrado: CifradoService,
    private readonly totp: TotpService,
    private readonly correo: CorreoService,
    private readonly jwt: JwtService,
  ) {}

  // ─── Utilidades ────────────────────────────────────────────────
  private tokenAleatorio(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private validarPoliticaPassword(password: string): void {
    const min = Number(process.env.PASSWORD_MIN_LONGITUD ?? 10);
    if (password.length < min) {
      throw new BadRequestException(`La contraseña debe tener al menos ${min} caracteres.`);
    }
  }

  private async emitirSesion(usuario: {
    id: string;
    email: string;
    rol: { nombre: string };
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol.nombre,
      scope: 'session',
    };
    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_TTL ?? '15m',
    });

    const refreshToken = this.tokenAleatorio();
    const dias = Number(process.env.REFRESH_TOKEN_TTL_DIAS ?? 7);
    await this.prisma.refreshToken.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: this.hashToken(refreshToken),
        expiraEn: new Date(Date.now() + dias * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  // ─── Activación de cuenta ─────────────────────────────────────
  async activarCuenta(dto: ActivarCuentaDto) {
    this.validarPoliticaPassword(dto.password);

    const registro = await this.prisma.tokenCuenta.findFirst({
      where: { tipo: 'activacion', tokenHash: this.hashToken(dto.token), usado: false },
    });
    if (!registro || registro.expiraEn < new Date()) {
      throw new UnauthorizedException('Token de activación inválido o expirado');
    }

    const passwordHash = await this.hash.hashPassword(dto.password);
    const secreto = this.totp.generarSecreto();
    const usuario = await this.prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: {
        passwordHash,
        totpSecretCifrado: this.cifrado.cifrar(secreto),
        totpHabilitado: true,
        estado: 'activo',
      },
    });
    await this.prisma.tokenCuenta.update({ where: { id: registro.id }, data: { usado: true } });

    // El secreto/URI se entregan UNA sola vez para el enrolamiento en Microsoft Authenticator.
    return {
      mensaje: 'Cuenta activada. Escanea el código en Microsoft Authenticator.',
      otpauthUri: this.totp.uriOtpauth(usuario.email, secreto),
    };
  }

  // ─── Login paso 1: contraseña ─────────────────────────────────
  async loginPaso1(dto: LoginDto): Promise<{ retoToken: string }> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      include: { rol: true },
    });
    const credencialInvalida = new UnauthorizedException('Credenciales inválidas');

    if (!usuario || usuario.estado !== 'activo' || !usuario.passwordHash) {
      throw credencialInvalida;
    }
    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      throw new UnauthorizedException('Cuenta bloqueada temporalmente por intentos fallidos');
    }

    const ok = await this.hash.verificarPassword(usuario.passwordHash, dto.password);
    if (!ok) {
      await this.registrarIntentoFallido(usuario.id, usuario.intentosFallidos);
      throw credencialInvalida;
    }

    // Contraseña correcta: se reinicia el contador y se emite un reto de 2FA.
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { intentosFallidos: 0, bloqueadoHasta: null },
    });

    const retoToken = this.jwt.sign(
      { sub: usuario.id, email: usuario.email, rol: usuario.rol.nombre, scope: '2fa_pendiente' },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.RETO_2FA_TTL ?? '5m' },
    );
    return { retoToken };
  }

  private async registrarIntentoFallido(usuarioId: string, intentosPrevios: number): Promise<void> {
    const max = Number(process.env.LOGIN_MAX_INTENTOS ?? 5);
    const minutos = Number(process.env.LOGIN_BLOQUEO_MINUTOS ?? 15);
    const intentos = intentosPrevios + 1;
    const bloqueado = intentos >= max;
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        intentosFallidos: bloqueado ? 0 : intentos,
        bloqueadoHasta: bloqueado ? new Date(Date.now() + minutos * 60 * 1000) : undefined,
      },
    });
  }

  // ─── Login paso 2: 2FA ────────────────────────────────────────
  async loginPaso2(dto: Verificar2faDto) {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(dto.retoToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Reto de 2FA inválido o expirado');
    }
    if (payload.scope !== '2fa_pendiente') {
      throw new UnauthorizedException('Token de reto inválido');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { rol: true },
    });
    if (!usuario || !usuario.totpSecretCifrado || usuario.estado !== 'activo') {
      throw new UnauthorizedException('Usuario no válido para 2FA');
    }

    const secreto = this.cifrado.descifrar(usuario.totpSecretCifrado);
    if (!this.totp.verificar(dto.codigo, secreto)) {
      throw new UnauthorizedException('Código de 2FA incorrecto');
    }

    return this.emitirSesion(usuario);
  }

  // ─── Refresh / logout ─────────────────────────────────────────
  async refrescar(refreshToken: string) {
    const registro = await this.prisma.refreshToken.findFirst({
      where: { tokenHash: this.hashToken(refreshToken), revocado: false },
    });
    if (!registro || registro.expiraEn < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: registro.usuarioId },
      include: { rol: true },
    });
    if (!usuario || usuario.estado !== 'activo') {
      throw new UnauthorizedException('Usuario no válido');
    }
    // Rotación: se revoca el token usado y se emite uno nuevo.
    await this.prisma.refreshToken.update({ where: { id: registro.id }, data: { revocado: true } });
    return this.emitirSesion(usuario);
  }

  async logout(refreshToken: string): Promise<{ mensaje: string }> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(refreshToken) },
      data: { revocado: true },
    });
    return { mensaje: 'Sesión cerrada' };
  }

  // ─── Recuperación de contraseña ───────────────────────────────
  async solicitarRecuperacion(dto: SolicitarRecuperacionDto): Promise<{ mensaje: string }> {
    const neutro = {
      mensaje: 'Si el correo corresponde a una cuenta, se enviaron instrucciones.',
    };
    const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (!usuario || usuario.estado !== 'activo') return neutro;

    const token = this.tokenAleatorio();
    await this.prisma.tokenCuenta.create({
      data: {
        usuarioId: usuario.id,
        tipo: 'recuperacion',
        tokenHash: this.hashToken(token),
        expiraEn: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      },
    });
    await this.correo.enviarRecuperacion(usuario.email, token);
    return neutro;
  }

  async restablecerPassword(dto: RestablecerPasswordDto): Promise<{ mensaje: string }> {
    this.validarPoliticaPassword(dto.password);
    const registro = await this.prisma.tokenCuenta.findFirst({
      where: { tipo: 'recuperacion', tokenHash: this.hashToken(dto.token), usado: false },
    });
    if (!registro || registro.expiraEn < new Date()) {
      throw new UnauthorizedException('Token de recuperación inválido o expirado');
    }
    const passwordHash = await this.hash.hashPassword(dto.password);
    await this.prisma.$transaction([
      this.prisma.usuario.update({ where: { id: registro.usuarioId }, data: { passwordHash } }),
      this.prisma.tokenCuenta.update({ where: { id: registro.id }, data: { usado: true } }),
      // Revoca todas las sesiones activas por seguridad.
      this.prisma.refreshToken.updateMany({
        where: { usuarioId: registro.usuarioId },
        data: { revocado: true },
      }),
    ]);
    return { mensaje: 'Contraseña actualizada' };
  }
}
