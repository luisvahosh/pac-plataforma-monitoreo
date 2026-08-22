export type ScopeToken = 'session' | '2fa_pendiente';

export interface JwtPayload {
  sub: string; // id de usuario
  email: string;
  rol: string; // 'administrador' | 'colaborador'
  scope: ScopeToken;
}
