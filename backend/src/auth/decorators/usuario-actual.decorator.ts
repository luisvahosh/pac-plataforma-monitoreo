import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../tipos';

/** Inyecta el usuario autenticado (payload del token) en un parámetro del handler. */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const req = ctx.switchToHttp().getRequest<{ usuario: JwtPayload }>();
    return req.usuario;
  },
);
