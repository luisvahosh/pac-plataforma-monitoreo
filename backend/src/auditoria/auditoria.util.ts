// Utilidades puras para derivar el evento de auditoría a partir de la petición.

export function accionDesdeMetodo(metodo: string): string | null {
  switch (metodo.toUpperCase()) {
    case 'POST':
      return 'crear';
    case 'PUT':
    case 'PATCH':
      return 'editar';
    case 'DELETE':
      return 'eliminar';
    default:
      return null; // GET y otros no generan evento de auditoría
  }
}

/** Deriva el tipo de entidad del primer segmento tras /api (p. ej. 'actividades'). */
export function entidadTipoDesdeRuta(ruta: string): string | null {
  const partes = ruta.split('?')[0].split('/').filter(Boolean);
  const idx = partes.indexOf('api');
  const seg = idx >= 0 ? partes[idx + 1] : partes[0];
  return seg ?? null;
}

/** No se auditan rutas de autenticación (evita capturar credenciales/tokens). */
export function esRutaSensible(ruta: string): boolean {
  return ruta.includes('/auth/');
}
