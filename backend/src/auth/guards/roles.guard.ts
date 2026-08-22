import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../tipos';

// Verifica el rol del usuario autenticado (debe usarse después de JwtAuthGuard).
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ usuario?: JwtPayload }>();
    const usuario = req.usuario;
    if (!usuario || !roles.includes(usuario.rol)) {
      throw new ForbiddenException('No tienes permiso para esta operación');
    }
    return true;
  }
}
