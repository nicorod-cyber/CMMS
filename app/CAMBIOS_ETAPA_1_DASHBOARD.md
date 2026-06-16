# Etapa 1A - Dashboard: indicadores navegables

## Alcance
Se mantiene el diseño visual original. Solo se agregan acciones de navegación y lectura de filtros por URL para validar indicadores del Dashboard.

## Archivos modificados
- `src/pages/Dashboard.tsx`
- `src/pages/MantenimientoOT.tsx`
- `src/pages/MantenimientoSM.tsx`
- `src/pages/Activos.tsx`
- `src/pages/Bodega.tsx`

## Comportamiento agregado
- Click en `OT Abiertas` lleva a `/mantenimiento/ot?filtro=abiertas`.
- Click en `OT Críticas` lleva a `/mantenimiento/ot?filtro=criticas`.
- Click en `Backlog (días)` lleva a `/mantenimiento/backlog`.
- Click en `Disp. Flota` lleva a `/activos/maestro`.
- Click en `Stock Crítico` lleva a `/bodega/criticos`.
- Click en `SM Pendientes` lleva a `/mantenimiento/sm?filtro=pendientes`.
- Click en una OT crítica del panel del Dashboard lleva a la tabla de OT filtrada por esa OT.
- Click en una OT en ejecución lleva a la tabla de OT filtrada por esa OT.
- Click en equipos detenidos lleva al maestro de activos filtrado por estado detenido.
- Click en alertas activas dirige al módulo relacionado según el tipo de alerta.

## Nota técnica
No se modificaron colores, layout, textos visibles ni estructura visual. Los filtros `abiertas` y `pendientes` se activan por URL para no agregar nuevos botones visibles en esta etapa.
