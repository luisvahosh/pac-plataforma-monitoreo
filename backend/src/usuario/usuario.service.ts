import {
  BadRequestException,
  ConflictException,
  Injectable,
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
  estado: true,
  creadoEn: true,
  rol: { select: { nombre: true } },
} satisfies Prisma.UsuarioSelect;

@Injectable()
export class UsuarioService {
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
      data: { nombre: dto.nombre, email: dto.email, rolId, estado: 'pendiente_activacion' },
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
    await this.correo.enviarActivacion(usuario.email, usuario.nombre, token);

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
    return this.prisma.usuario.update({
      where: { id },
      data: { nombre: dto.nombre, rolId },
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
}
