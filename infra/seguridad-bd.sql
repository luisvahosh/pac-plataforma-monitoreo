-- Endurecimiento de la base de datos en producción (Fase 12/13).
-- Ejecutar UNA vez, como superusuario/propietario, DESPUÉS de aplicar las
-- migraciones. Crea un rol de aplicación de menor privilegio e impide alterar el
-- histórico de auditoría y de línea base (RN-18, RN-07).
--
--   docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f - < infra/seguridad-bd.sql
--
-- Luego actualiza DATABASE_URL para que la app use el rol pac_app.

-- 1) Rol de aplicación (cambia la contraseña por un secreto fuerte).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'pac_app') THEN
    CREATE ROLE pac_app LOGIN PASSWORD 'CAMBIA_ESTE_SECRETO';
  END IF;
END
$$;

-- 2) Permisos base sobre el esquema y las tablas existentes.
GRANT CONNECT ON DATABASE CURRENT_CATALOG TO pac_app;
GRANT USAGE ON SCHEMA public TO pac_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pac_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pac_app;

-- Para tablas futuras (si se añaden migraciones): privilegios por defecto.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO pac_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO pac_app;

-- 3) Inmutabilidad: la app puede INSERTAR y LEER, pero NO modificar ni borrar
--    el histórico de auditoría ni el de cambios de línea base.
REVOKE UPDATE, DELETE ON evento_auditoria FROM pac_app;
REVOKE UPDATE, DELETE ON cambio_linea_base FROM pac_app;

-- Nota: el rol pac_app NO debe ser propietario de las tablas ni superusuario,
-- de lo contrario los REVOKE anteriores no tienen efecto.
