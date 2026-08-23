import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';

// Directorio de almacenamiento de archivos de Evidencia (volumen Docker, ADR-0005).
// NUNCA está bajo una ruta servida estáticamente por el proxy.
export const EVIDENCIAS_DIR = process.env.EVIDENCIAS_DIR ?? '/app/evidencias';

// Lista blanca de extensiones permitidas (ajustable, PA-05).
const EXTENSIONES_PERMITIDAS = (
  process.env.EVIDENCIAS_EXT ?? 'pdf,png,jpg,jpeg,gif,webp,docx,xlsx,pptx,txt,csv'
)
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function extensionPermitida(nombreArchivo: string): boolean {
  const ext = extname(nombreArchivo).replace('.', '').toLowerCase();
  return EXTENSIONES_PERMITIDAS.includes(ext);
}

function asegurarDirectorio(): void {
  if (!existsSync(EVIDENCIAS_DIR)) mkdirSync(EVIDENCIAS_DIR, { recursive: true });
}

// Opciones de multer para la subida: nombre aleatorio (evita path traversal),
// límite de tamaño y filtro por extensión.
export function opcionesMulter() {
  asegurarDirectorio();
  const maxMb = Number(process.env.EVIDENCIAS_MAX_MB ?? 25);
  return {
    storage: diskStorage({
      destination: (_req: Request, _file: Express.Multer.File, cb: (e: Error | null, dir: string) => void) =>
        cb(null, EVIDENCIAS_DIR),
      filename: (_req: Request, file: Express.Multer.File, cb: (e: Error | null, name: string) => void) =>
        cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: maxMb * 1024 * 1024 },
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: (e: Error | null, acepta: boolean) => void,
    ) => {
      if (!extensionPermitida(file.originalname)) {
        cb(new BadRequestException('Tipo de archivo no permitido'), false);
        return;
      }
      cb(null, true);
    },
  };
}
