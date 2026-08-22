import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../tipos';

// Exige un access token válido cuyo scope sea 'session' (es decir, que ya superó
// el segundo factor). Un token con scope '2fa_pendiente' NO da acceso (RN-15).
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string>; usuario?: JwtPayload }>();
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token de acceso');
    }
    const token = auth.slice('Bearer '.length);
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(token, { secret: process.env.JWT_ACCESS_SECRET });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    if (payload.scope !== 'session') {
      throw new UnauthorizedException('Se requiere completar el segundo factor (2FA)');
    }
    req.usuario = payload;
    return true;
  }
}
