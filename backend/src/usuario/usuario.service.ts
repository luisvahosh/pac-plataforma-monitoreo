import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CorreoService } from '../correo/correo.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

// Campos seguros: NUNCA se exponen password_hash ni totp_secret_cifrado.
const SELECT_SEGURO = {
  id: true,
  nombre: true,
  email: true,
  celular: true,
  estado: true,
  creadoEn: true,
  rol: { select: { nombre: true } },
} satisfies Prisma.UsuarioSelect;

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly correo: CorreoService,
  ) {}

  private async rolId(nombre: string): Promise<string> {
    const rol = await this.prisma.rol.findUnique({ where: { nombre } });
    if (!rol) throw new BadRequestException(`Rol inexistente: ${nombre}`);
    return rol.id;
  }

  async crear(dto: CrearUsuarioDto) {
    const rolId = await this.rolId(dto.rol);
    const existe = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existe) throw new ConflictException('El correo ya está registrado');

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        celular: dto.celular,
        rolId,
        estado: 'pendiente_activacion',
      },
      select: SELECT_SEGURO,
    });

    // Token de activación: se guarda su hash; el token en claro solo va por correo.
    const token = randomBytes(32).toString('hex');
    await this.prisma.tokenCuenta.create({
      data: {
        usuarioId: usuario.id,
        tipo: 'activacion',
        tokenHash: createHash('sha256').update(token).digest('hex'),
        expiraEn: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });

    // El envío de correo no debe hacer fallar la creación del usuario (ya quedó
    // guardado en la base de datos): si el SMTP falla, se deja constancia en el
    // log y se imprime el enlace para que un administrador con acceso al
    // servidor pueda entregarlo manualmente.
    try {
      await this.correo.enviarActivacion(usuario.email, usuario.nombre, token);
    } catch (error) {
      const enlace = `${process.env.APP_URL ?? 'http://localhost'}/activar?token=${token}`;
      this.logger.error(
        `No se pudo enviar el correo de activación a ${usuario.email}: ${(error as Error).message}. ` +
          `Enlace de activación (válido 48 h): ${enlace}`,
      );
    }

    return usuario;
  }

  listar() {
    return this.prisma.usuario.findMany({ select: SELECT_SEGURO, orderBy: { creadoEn: 'asc' } });
  }

  async obtener(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id }, select: SELECT_SEGURO });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async actualizar(id: string, dto: ActualizarUsuarioDto) {
    await this.obtener(id);
    const rolId = dto.rol ? await this.rolId(dto.rol) : undefined;
    if (dto.email) {
      const otro = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
      if (otro && otro.id !== id) throw new ConflictException('El correo ya está registrado');
    }
    return this.prisma.usuario.update({
      where: { id },
      data: { nombre: dto.nombre, email: dto.email, rolId, celular: dto.celular },
      select: SELECT_SEGURO,
    });
  }

  /** Desactiva la cuenta conservando los datos (RN-14): no se elimina. */
  async desactivar(id: string) {
    await this.obtener(id);
    // Revoca sesiones activas al desactivar.
    await this.prisma.refreshToken.updateMany({ where: { usuarioId: id }, data: { revocado: true } });
    return this.prisma.usuario.update({
      where: { id },
      data: { estado: 'inactivo' },
      select: SELECT_SEGURO,
    });
  }

  /**
   * Elimina definitivamente la cuenta, SOLO si nunca tuvo actividad
   * trazable (avances, evidencias o cambios de línea base). Si ya la tuvo,
   * se rechaza para no perder la trazabilidad (RN-14): en ese caso se debe
   * usar `desactivar`, que conserva el histórico.
   */
  async eliminar(id: string) {
    await this.obtener(id);

    const [avances, evidencias, cambiosLineaBase] = await Promise.all([
      this.prisma.avance.count({ where: { usuarioId: id } }),
      this.prisma.evidencia.count({ where: { autorId: id } }),
      this.prisma.cambioLineaBase.count({ where: { usuarioId: id } }),
    ]);
    if (avances > 0 || evidencias > 0 || cambiosLineaBase > 0) {
      throw new ConflictException(
        'No se puede eliminar: el usuario tiene avances, evidencias o cambios de línea base ' +
          'registrados. Usa "desactivar" para conservar la trazabilidad (RN-14).',
      );
    }

    await this.prisma.usuario.delete({ where: { id } });
    return { mensaje: 'Usuario eliminado' };
  }
}
