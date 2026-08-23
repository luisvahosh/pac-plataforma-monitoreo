import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditoriaService } from './auditoria.service';
import { accionDesdeMetodo, entidadTipoDesdeRuta, esRutaSensible } from './auditoria.util';
import { JwtPayload } from '../auth/tipos';

interface PeticionAuditable {
  method: string;
  originalUrl?: string;
  url: string;
  params?: { id?: string };
  ip?: string;
  usuario?: JwtPayload;
}

// Interceptor global: registra automáticamente toda mutación exitosa (POST/PUT/
// PATCH/DELETE) como evento de auditoría (RN-17). No guarda el cuerpo de la
// petición (evita capturar datos sensibles); las rutas de /auth se omiten.
@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(private readonly auditoria: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<PeticionAuditable>();
    const accion = accionDesdeMetodo(req.method);
    const ruta = req.originalUrl ?? req.url;

    return next.handle().pipe(
      tap(() => {
        if (!accion || esRutaSensible(ruta)) return;
        void this.auditoria
          .registrar({
            usuarioId: req.usuario?.sub,
            accion,
            entidadTipo: entidadTipoDesdeRuta(ruta),
            entidadId: req.params?.id,
            detalle: { metodo: req.method, ruta },
            ip: req.ip,
          })
          .catch(() => undefined);
      }),
    );
  }
}
