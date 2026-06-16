# Cambios Etapa 1C - Operaciones / Nueva OT

## Alcance
Se aplicaron cambios funcionales sin rediseñar la pantalla de Órdenes de Trabajo.

## Cambios realizados

1. Menú lateral
   - Se cambió el nombre del módulo `Mantenimiento` por `Operaciones`.
   - No se modificaron rutas internas todavía. Las rutas siguen usando `/mantenimiento` para no romper navegación existente.

2. Botón Nueva OT
   - El botón `Nueva OT` ahora abre una ventana modal.
   - La ventana incluye los campos solicitados:
     - Equipo
     - Ubicación
     - Descripción del trabajo
     - Trabajos/tareas a realizar
     - Técnicos
     - Cliente
     - Prioridad

3. Creación de OT en frontend
   - Al completar el formulario y presionar `Crear OT`, se crea una nueva OT en memoria local del frontend.
   - La OT nueva queda en estado `Abierta`.
   - Se muestra en el Kanban sin recargar la página.
   - Las tareas ingresadas se transforman en checklist interno de la OT.
   - Cliente y ubicación quedan registrados como comentario técnico inicial.

## Limitación actual
La OT creada no persiste si se recarga la página porque aún no existe backend ni base de datos.

## Validación
Se ejecutó `npm run build` correctamente.
