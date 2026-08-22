import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

// Pruebas de control de acceso por rol (incluye casos negativos).
function contexto(rol: string | undefined, rolesRequeridos: string[] | undefined) {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(rolesRequeridos);
  const guard = new RolesGuard(reflector);
  const ctx = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ usuario: rol ? { rol } : undefined }),
    }),
  } as unknown as ExecutionContext;
  return { guard, ctx };
}

describe('RolesGuard', () => {
  it('permite cuando el endpoint no exige rol', () => {
    const { guard, ctx } = contexto('colaborador', undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite cuando el rol coincide', () => {
    const { guard, ctx } = contexto('administrador', ['administrador']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('deniega cuando el rol no coincide (colaborador → endpoint de admin)', () => {
    const { guard, ctx } = contexto('colaborador', ['administrador']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('deniega cuando no hay usuario autenticado', () => {
    const { guard, ctx } = contexto(undefined, ['administrador']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
