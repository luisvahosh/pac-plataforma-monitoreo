import { accionDesdeMetodo, entidadTipoDesdeRuta, esRutaSensible } from './auditoria.util';

describe('auditoria.util', () => {
  it('mapea el método HTTP a la acción', () => {
    expect(accionDesdeMetodo('POST')).toBe('crear');
    expect(accionDesdeMetodo('patch')).toBe('editar');
    expect(accionDesdeMetodo('PUT')).toBe('editar');
    expect(accionDesdeMetodo('DELETE')).toBe('eliminar');
    expect(accionDesdeMetodo('GET')).toBeNull();
  });

  it('deriva la entidad del primer segmento tras /api', () => {
    expect(entidadTipoDesdeRuta('/api/actividades/123/avances')).toBe('actividades');
    expect(entidadTipoDesdeRuta('/api/proyectos')).toBe('proyectos');
    expect(entidadTipoDesdeRuta('/api/linea-base/cambios')).toBe('linea-base');
  });

  it('marca las rutas de autenticación como sensibles', () => {
    expect(esRutaSensible('/api/auth/login')).toBe(true);
    expect(esRutaSensible('/api/proyectos')).toBe(false);
  });
});
