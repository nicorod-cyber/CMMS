# Etapa 1B - Controles globales funcionales

## Objetivo
Hacer funcionales los controles superiores sin modificar el diseño visual existente.

## Cambios aplicados

### Breadcrumb dinámico
- El texto `Inicio / Dashboard` ahora cambia según la ruta actual.
- Ejemplos:
  - `/mantenimiento/ot` → `Inicio / Órdenes de Trabajo`
  - `/activos/maestro` → `Inicio / Maestro de Activos`
  - `/bodega/criticos` → `Inicio / Materiales Críticos`

### Filtro de faena
- El selector de faena ahora actualiza la URL con `?faena=FXX`.
- Las vistas principales filtran la información según la faena seleccionada:
  - Dashboard
  - Órdenes de Trabajo
  - Solicitudes SM
  - Activos
  - Bodega
  - Planificación

### Búsqueda global
- El buscador superior ahora busca en:
  - OT
  - SM
  - Equipos
  - Repuestos / códigos SAP
  - Técnicos
- Al seleccionar un resultado, navega a la vista correspondiente con filtro aplicado.
- Al presionar Enter, navega al primer resultado válido.

### Notificaciones
- Al hacer click en una notificación:
  - Se marca como leída.
  - Disminuye el contador rojo.
  - Navega al detalle relacionado:
    - OT → Órdenes de Trabajo
    - SM → Solicitudes SM
    - Equipo → Maestro de Activos
    - Repuesto → Bodega / Stock

## Archivos modificados
- `src/components/Topbar.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/MantenimientoOT.tsx`
- `src/pages/MantenimientoSM.tsx`
- `src/pages/Activos.tsx`
- `src/pages/Bodega.tsx`
- `src/pages/Planificacion.tsx`
- `src/lib/filters.ts`

## Validación técnica
- `npm run build` ejecutado correctamente.
- No se modificaron clases visuales base, estructura visual, colores, tamaños ni layout.
