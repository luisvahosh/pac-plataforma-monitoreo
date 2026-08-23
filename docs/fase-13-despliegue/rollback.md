# Procedimiento de Rollback (Fase 13)

Cómo revertir un despliegue si algo falla en producción.

## Antes de actualizar (para poder revertir)

- Anota la versión actual desplegada:
  ```bash
  git rev-parse HEAD
  ```
- Asegura un **respaldo reciente** de la base de datos (ver Fase 14). Un rollback
  de código con un esquema ya migrado puede requerir restaurar datos.

## Rollback de código (sin cambios de esquema)

Si la nueva versión no aplicó migraciones destructivas:

```bash
git checkout <commit_o_tag_anterior>
./infra/desplegar.sh
```

## Rollback con cambios de esquema

Prisma `migrate deploy` aplica migraciones hacia adelante; **no** revierte
automáticamente. Si una migración causó el problema:

1. Detén el tráfico (o pon la app en mantenimiento).
2. **Restaura la base de datos** desde el respaldo previo al despliegue
   (procedimiento en la Fase 14).
3. Vuelve al commit/tag anterior y redepliega:
   ```bash
   git checkout <commit_o_tag_anterior>
   ./infra/desplegar.sh
   ```

## Verificación tras el rollback

- [ ] `/api/health` responde `ok`.
- [ ] El dashboard público carga.
- [ ] Login con 2FA funciona.
- [ ] Los datos corresponden al estado esperado tras la restauración.

## Recomendaciones

- Etiqueta cada release con un tag git (`git tag vX.Y.Z`) para facilitar el rollback.
- Prueba las migraciones en staging antes de producción.
- Evita migraciones destructivas (borrado de columnas/tablas) sin una fase de
  compatibilidad previa.
