import type {
  Faena, Equipo, SolicitudMantenimiento, OrdenTrabajo,
  Repuesto, SolicitudRepuesto, Alerta, Actividad,
  KPIData, Usuario
} from '@/types';

export const faenas: Faena[] = [
  { id: 'F01', nombre: 'Faena Norte - Mina Rajo', ubicacion: 'Antofagasta', activa: true },
  { id: 'F02', nombre: 'Faena Sur - Mina Subterránea', ubicacion: 'Calama', activa: true },
  { id: 'F03', nombre: 'Faena Este - Planta Procesos', ubicacion: 'Copiapó', activa: true },
  { id: 'F04', nombre: 'Faena Oeste - Relaves', ubicacion: 'La Serena', activa: true },
];

export const equipos: Equipo[] = [
  { id: 'EQ001', codigo: 'CAM-001', nombre: 'Camión Komatsu 930E-05', tipo: 'camion', marca: 'Komatsu', modelo: '930E-5', faenaId: 'F01', faena: 'Faena Norte', planta: 'Transporte', sistema: 'Propulsión', subsistema: 'Eléctrico', estadoOperativo: 'disponible', horometro: 18420, disponibilidad: 94.2, criticidad: 'alta', ultimaOT: 'OT-2024-0841' },
  { id: 'EQ002', codigo: 'CAM-002', nombre: 'Camión Caterpillar 797F', tipo: 'camion', marca: 'Caterpillar', modelo: '797F', faenaId: 'F01', faena: 'Faena Norte', planta: 'Transporte', sistema: 'Motor', subsistema: 'Diesel', estadoOperativo: 'en_mantenimiento', horometro: 22150, disponibilidad: 0, criticidad: 'critica', ultimaOT: 'OT-2024-0845' },
  { id: 'EQ003', codigo: 'PER-001', nombre: 'Perforadora Sandvik DP1500', tipo: 'perforadora', marca: 'Sandvik', modelo: 'DP1500i', faenaId: 'F01', faena: 'Faena Norte', planta: 'Perforación', sistema: 'Hidráulico', subsistema: 'Bomba Principal', estadoOperativo: 'operando', horometro: 8930, disponibilidad: 88.5, criticidad: 'alta', ultimaOT: 'OT-2024-0835' },
  { id: 'EQ004', codigo: 'CAR-001', nombre: 'Cargador Frontal CAT 994K', tipo: 'cargador', marca: 'Caterpillar', modelo: '994K', faenaId: 'F02', faena: 'Faena Sur', planta: 'Carguío', sistema: 'Hidráulico', subsistema: 'Levante', estadoOperativo: 'disponible', horometro: 15600, disponibilidad: 92.1, criticidad: 'alta', ultimaOT: 'OT-2024-0830' },
  { id: 'EQ005', codigo: 'EXC-001', nombre: 'Excavadora Hitachi EX5600', tipo: 'excavadora', marca: 'Hitachi', modelo: 'EX5600-6', faenaId: 'F02', faena: 'Faena Sur', planta: 'Carguío', sistema: 'Eléctrico', subsistema: 'Cabina', estadoOperativo: 'detenido', horometro: 31200, disponibilidad: 0, criticidad: 'critica', ultimaOT: 'OT-2024-0840' },
  { id: 'EQ006', codigo: 'BUL-001', nombre: 'Bulldozer Komatsu D375A', tipo: 'bulldozer', marca: 'Komatsu', modelo: 'D375A-8', faenaId: 'F01', faena: 'Faena Norte', planta: 'Servicios', sistema: 'Mecánico', subsistema: 'Transmisión', estadoOperativo: 'disponible', horometro: 28700, disponibilidad: 97.3, criticidad: 'media', ultimaOT: 'OT-2024-0825' },
  { id: 'EQ007', codigo: 'COM-001', nombre: 'Compresor Atlas Copco XAMS 1150', tipo: 'compresor', marca: 'Atlas Copco', modelo: 'XAMS 1150', faenaId: 'F03', faena: 'Faena Este', planta: 'Aire Comprimido', sistema: 'Compresión', subsistema: 'Tornillo', estadoOperativo: 'operando', horometro: 12000, disponibilidad: 85.0, criticidad: 'media', ultimaOT: 'OT-2024-0815' },
  { id: 'EQ008', codigo: 'PLT-001', nombre: 'Planta de Chancado Primario', tipo: 'planta', marca: 'Metso', modelo: 'C160', faenaId: 'F03', faena: 'Faena Este', planta: 'Chancado', sistema: 'Chancado', subsistema: 'Mandíbula', estadoOperativo: 'operando', horometro: 45000, disponibilidad: 91.8, criticidad: 'critica', ultimaOT: 'OT-2024-0838' },
  { id: 'EQ009', codigo: 'CAM-003', nombre: 'Camión Komatsu 830E-AC', tipo: 'camion', marca: 'Komatsu', modelo: '830E-AC', faenaId: 'F01', faena: 'Faena Norte', planta: 'Transporte', sistema: 'Propulsión', subsistema: 'Eléctrico', estadoOperativo: 'operando', horometro: 9500, disponibilidad: 96.5, criticidad: 'alta', ultimaOT: 'OT-2024-0820' },
  { id: 'EQ010', codigo: 'PER-002', nombre: 'Perforadora Atlas Copco D65', tipo: 'perforadora', marca: 'Atlas Copco', modelo: 'SmartROC D65', faenaId: 'F02', faena: 'Faena Sur', planta: 'Perforación', sistema: 'Hidráulico', subsistema: 'Alimentación', estadoOperativo: 'en_mantenimiento', horometro: 6700, disponibilidad: 78.4, criticidad: 'media', ultimaOT: 'OT-2024-0839' },
];

export const solicitudesMantenimiento: SolicitudMantenimiento[] = [
  { id: 'SM001', numero: 'SM-2024-0125', equipoId: 'EQ002', equipo: 'Camión Caterpillar 797F', faena: 'Faena Norte', solicitante: 'Carlos Méndez', fechaSolicitud: '2024-06-10T08:30:00', tipoFalla: 'Sobrecalentamiento motor', descripcion: 'El motor principal presenta temperatura anormal en pendientes largas. Se observa humo desde el compartimiento.', criticidad: 'critica', estado: 'aprobada', otGenerada: 'OT-2024-0845' },
  { id: 'SM002', numero: 'SM-2024-0126', equipoId: 'EQ005', equipo: 'Excavadora Hitachi EX5600', faena: 'Faena Sur', solicitante: 'Ana López', fechaSolicitud: '2024-06-10T10:15:00', tipoFalla: 'Falla sistema eléctrico', descripcion: 'Panel eléctrico principal sin energía. No enciende sistema de control. Posible falla en transformador.', criticidad: 'critica', estado: 'aprobada', otGenerada: 'OT-2024-0840' },
  { id: 'SM003', numero: 'SM-2024-0127', equipoId: 'EQ003', equipo: 'Perforadora Sandvik DP1500', faena: 'Faena Norte', solicitante: 'Roberto Silva', fechaSolicitud: '2024-06-11T07:00:00', tipoFalla: 'Fuga hidráulica', descripcion: 'Fuga visible en línea hidráulica del sistema de avance. Pérdida de presión intermitente.', criticidad: 'alta', estado: 'aprobada', otGenerada: 'OT-2024-0850' },
  { id: 'SM004', numero: 'SM-2024-0128', equipoId: 'EQ001', equipo: 'Camión Komatsu 930E-05', faena: 'Faena Norte', solicitante: 'Patricia Vargas', fechaSolicitud: '2024-06-11T14:20:00', tipoFalla: 'Ruido anormal en frenos', descripcion: 'Chirrido persistente en sistema de frenos traseros al detención. Requiere inspección urgente.', criticidad: 'alta', estado: 'en_revision' },
  { id: 'SM005', numero: 'SM-2024-0129', equipoId: 'EQ007', equipo: 'Compresor Atlas Copco XAMS 1150', faena: 'Faena Este', solicitante: 'Luis Herrera', fechaSolicitud: '2024-06-12T09:45:00', tipoFalla: 'Baja presión de aire', descripcion: 'Presión de descarga por debajo del setpoint. Posible desgaste en elemento de compresión.', criticidad: 'media', estado: 'nueva' },
  { id: 'SM006', numero: 'SM-2024-0130', equipoId: 'EQ006', equipo: 'Bulldozer Komatsu D375A', faena: 'Faena Norte', solicitante: 'Diego Fuentes', fechaSolicitud: '2024-06-12T11:30:00', tipoFalla: 'Vibración en cabina', descripcion: 'Vibración excesiva en cabina durante operación. Posible desgaste en soportes de motor.', criticidad: 'media', estado: 'nueva' },
  { id: 'SM007', numero: 'SM-2024-0131', equipoId: 'EQ010', equipo: 'Perforadora Atlas Copco D65', faena: 'Faena Sur', solicitante: 'María Castro', fechaSolicitud: '2024-06-13T08:00:00', tipoFalla: 'Fallo en sistema de lubricación', descripcion: 'Bomba de lubricación no arranca. Presión de aceite en cero.', criticidad: 'alta', estado: 'nueva' },
  { id: 'SM008', numero: 'SM-2024-0132', equipoId: 'EQ004', equipo: 'Cargador Frontal CAT 994K', faena: 'Faena Sur', solicitante: 'Jorge Martínez', fechaSolicitud: '2024-06-13T13:00:00', tipoFalla: 'Desgaste cucharon', descripcion: 'Dientes del cucharon con desgaste severo. Requiere reemplazo preventivo.', criticidad: 'baja', estado: 'aprobada' },
];

export const ordenesTrabajo: OrdenTrabajo[] = [
  { id: 'OT001', numero: 'OT-2024-0845', smId: 'SM001', tipo: 'correctivo', equipoId: 'EQ002', equipo: 'Camión Caterpillar 797F', faena: 'Faena Norte', descripcion: 'Reparación sistema de refrigeración motor - Sobrecalentamiento', estado: 'en_progreso', criticidad: 'critica', tecnicoAsignado: 'Juan Pérez', planificador: 'Pedro Soto', fechaCreacion: '2024-06-10T09:00:00', fechaPlanificada: '2024-06-10', fechaInicio: '2024-06-10T09:30:00', hhEstimadas: 16, hhReales: 10, repuestos: [{ codigoSAP: 'SAP-45821', descripcion: 'Bomba agua refrigeración CAT 797F', cantidadSolicitada: 1, cantidadEntregada: 1, estado: 'entregado' }, { codigoSAP: 'SAP-32015', descripcion: 'Manguera radiador superior 4\"', cantidadSolicitada: 2, cantidadEntregada: 2, estado: 'entregado' }], checklist: [{ id: 'c1', descripcion: 'Desconectar baterías y sistema eléctrico', completado: true }, { id: 'c2', descripcion: 'Drenar sistema de refrigeración', completado: true }, { id: 'c3', descripcion: 'Retirar bomba agua dañada', completado: true }, { id: 'c4', descripcion: 'Instalar nueva bomba agua', completado: false }, { id: 'c5', descripcion: 'Llenar y purgar sistema refrigeración', completado: false }, { id: 'c6', descripcion: 'Prueba de funcionamiento', completado: false }], evidencias: [], comentarios: [{ id: 'com1', usuario: 'Juan Pérez', texto: 'Bomba anterior presentaba corrosión severa en impulsor', fecha: '2024-06-10T12:00:00', rol: 'Técnico' }] },
  { id: 'OT002', numero: 'OT-2024-0840', smId: 'SM002', tipo: 'correctivo', equipoId: 'EQ005', equipo: 'Excavadora Hitachi EX5600', faena: 'Faena Sur', descripcion: 'Diagnóstico y reparación falla eléctrica panel principal', estado: 'abierta', criticidad: 'critica', tecnicoAsignado: 'Miguel Ángel Rojas', planificador: 'Pedro Soto', fechaCreacion: '2024-06-10T11:00:00', fechaPlanificada: '2024-06-14', hhEstimadas: 24, hhReales: 0, repuestos: [{ codigoSAP: 'SAP-77102', descripcion: 'Transformador principal 480V', cantidadSolicitada: 1, cantidadEntregada: 0, estado: 'pendiente' }, { codigoSAP: 'SAP-55234', descripcion: 'Fusible NH-3 500A', cantidadSolicitada: 3, cantidadEntregada: 0, estado: 'pendiente' }], checklist: [{ id: 'c1', descripcion: 'Medición voltaje entrada transformador', completado: false }, { id: 'c2', descripcion: 'Inspección visual conexiones', completado: false }, { id: 'c3', descripcion: 'Prueba continuidad devanados', completado: false }, { id: 'c4', descripcion: 'Reemplazo componente defectuoso', completado: false }, { id: 'c5', descripcion: 'Prueba energización progresiva', completado: false }], evidencias: [], comentarios: [] },
  { id: 'OT003', numero: 'OT-2024-0850', smId: 'SM003', tipo: 'correctivo', equipoId: 'EQ003', equipo: 'Perforadora Sandvik DP1500', faena: 'Faena Norte', descripcion: 'Reemplazo línea hidráulica sistema de avance', estado: 'abierta', criticidad: 'alta', tecnicoAsignado: 'Andrés Contreras', planificador: 'Carmen Díaz', fechaCreacion: '2024-06-11T08:00:00', fechaPlanificada: '2024-06-15', hhEstimadas: 6, hhReales: 0, repuestos: [{ codigoSAP: 'SAP-11245', descripcion: 'Manguera hidráulica 1\" SAE 100R2', cantidadSolicitada: 1, cantidadEntregada: 0, estado: 'pendiente' }], checklist: [{ id: 'c1', descripcion: 'Despresurizar sistema hidráulico', completado: false }, { id: 'c2', descripcion: 'Retirar manguera dañada', completado: false }, { id: 'c3', descripcion: 'Instalar nueva manguera', completado: false }, { id: 'c4', descripcion: 'Verificar conexiones y torque', completado: false }, { id: 'c5', descripcion: 'Prueba de presión', completado: false }], evidencias: [], comentarios: [] },
  { id: 'OT004', numero: 'OT-2024-0841', tipo: 'preventivo', equipoId: 'EQ001', equipo: 'Camión Komatsu 930E-05', faena: 'Faena Norte', descripcion: 'Mantenimiento preventivo 1000 hrs - Servicio completo', estado: 'cerrada', criticidad: 'media', tecnicoAsignado: 'Juan Pérez', planificador: 'Carmen Díaz', fechaCreacion: '2024-06-05T07:00:00', fechaPlanificada: '2024-06-08', fechaInicio: '2024-06-08T08:00:00', fechaCierre: '2024-06-09T16:30:00', hhEstimadas: 12, hhReales: 11, repuestos: [{ codigoSAP: 'SAP-22341', descripcion: 'Filtro aceite motor', cantidadSolicitada: 1, cantidadEntregada: 1, estado: 'entregado' }, { codigoSAP: 'SAP-22342', descripcion: 'Filtro combustible primario', cantidadSolicitada: 1, cantidadEntregada: 1, estado: 'entregado' }, { codigoSAP: 'SAP-22343', descripcion: 'Filtro aire exterior', cantidadSolicitada: 1, cantidadEntregada: 1, estado: 'entregado' }], checklist: [{ id: 'c1', descripcion: 'Cambio aceite motor y filtros', completado: true }, { id: 'c2', descripcion: 'Inspección sistema de frenos', completado: true }, { id: 'c3', descripcion: 'Lubricación puntos criticos', completado: true }, { id: 'c4', descripcion: 'Inspección bandas y mangueras', completado: true }, { id: 'c5', descripcion: 'Prueba de funcionamiento general', completado: true }], evidencias: [], comentarios: [{ id: 'com1', usuario: 'Juan Pérez', texto: 'Todo en orden. Banda del alternador con desgaste leve, monitorear.', fecha: '2024-06-09T16:30:00', rol: 'Técnico' }] },
  { id: 'OT005', numero: 'OT-2024-0835', tipo: 'preventivo', equipoId: 'EQ003', equipo: 'Perforadora Sandvik DP1500', faena: 'Faena Norte', descripcion: 'Inspección mensual sistema hidráulico', estado: 'cerrada', criticidad: 'baja', tecnicoAsignado: 'Andrés Contreras', planificador: 'Pedro Soto', fechaCreacion: '2024-06-01T07:00:00', fechaPlanificada: '2024-06-05', fechaInicio: '2024-06-05T09:00:00', fechaCierre: '2024-06-05T14:00:00', hhEstimadas: 4, hhReales: 4, repuestos: [{ codigoSAP: 'SAP-33456', descripcion: 'Aceite hidráulico ISO 46 - 200L', cantidadSolicitada: 1, cantidadEntregada: 1, estado: 'entregado' }], checklist: [{ id: 'c1', descripcion: 'Medición nivel aceite hidráulico', completado: true }, { id: 'c2', descripcion: 'Inspección mangueras y conexiones', completado: true }, { id: 'c3', descripcion: 'Verificación presión de trabajo', completado: true }, { id: 'c4', descripcion: 'Limpieza filtros retorno', completado: true }], evidencias: [], comentarios: [] },
  { id: 'OT006', numero: 'OT-2024-0838', tipo: 'correctivo', equipoId: 'EQ008', equipo: 'Planta de Chancado Primario', faena: 'Faena Este', descripcion: 'Reemplazo manto bowl chancador primario', estado: 'en_espera', criticidad: 'critica', tecnicoAsignado: 'Luis Ortega', planificador: 'Carmen Díaz', fechaCreacion: '2024-06-08T10:00:00', fechaPlanificada: '2024-06-16', hhEstimadas: 32, hhReales: 0, repuestos: [{ codigoSAP: 'SAP-99123', descripcion: 'Manto bowl chancador Metso C160', cantidadSolicitada: 1, cantidadEntregada: 0, estado: 'pendiente' }, { codigoSAP: 'SAP-99124', descripcion: 'Concavo fijo chancador C160', cantidadSolicitada: 1, cantidadEntregada: 0, estado: 'pendiente' }], checklist: [], evidencias: [], comentarios: [{ id: 'com1', usuario: 'Luis Ortega', texto: 'Esperando llegada de repuestos desde proveedor. ETA 14 de junio.', fecha: '2024-06-08T10:00:00', rol: 'Técnico' }] },
  { id: 'OT007', numero: 'OT-2024-0848', tipo: 'correctivo', equipoId: 'EQ001', equipo: 'Camión Komatsu 930E-05', faena: 'Faena Norte', descripcion: 'Reparación chirrido frenos traseros', estado: 'abierta', criticidad: 'alta', tecnicoAsignado: 'Juan Pérez', planificador: 'Pedro Soto', fechaCreacion: '2024-06-11T15:00:00', fechaPlanificada: '2024-06-16', hhEstimadas: 8, hhReales: 0, repuestos: [{ codigoSAP: 'SAP-44567', descripcion: 'Pastilla freno trasera 930E', cantidadSolicitada: 4, cantidadEntregada: 0, estado: 'pendiente' }], checklist: [], evidencias: [], comentarios: [] },
  { id: 'OT008', numero: 'OT-2024-0839', tipo: 'correctivo', equipoId: 'EQ010', equipo: 'Perforadora Atlas Copco D65', faena: 'Faena Sur', descripcion: 'Reparación bomba lubricación principal', estado: 'en_progreso', criticidad: 'alta', tecnicoAsignado: 'Miguel Ángel Rojas', planificador: 'Carmen Díaz', fechaCreacion: '2024-06-10T14:00:00', fechaPlanificada: '2024-06-13', fechaInicio: '2024-06-13T08:00:00', hhEstimadas: 10, hhReales: 4, repuestos: [{ codigoSAP: 'SAP-55678', descripcion: 'Bomba lubricación engranajes', cantidadSolicitada: 1, cantidadEntregada: 1, estado: 'entregado' }], checklist: [{ id: 'c1', descripcion: 'Desmontar bomba defectuosa', completado: true }, { id: 'c2', descripcion: 'Inspección carcasa y ejes', completado: true }, { id: 'c3', descripcion: 'Instalar bomba repuesto', completado: false }, { id: 'c4', descripcion: 'Verificación caudal lubricación', completado: false }], evidencias: [], comentarios: [{ id: 'com1', usuario: 'Miguel Ángel Rojas', texto: 'Bomba anterior tenía desgaste en sellos. Carcasa OK.', fecha: '2024-06-13T12:00:00', rol: 'Técnico' }] },
  { id: 'OT009', numero: 'OT-2024-0849', tipo: 'preventivo', equipoId: 'EQ004', equipo: 'Cargador Frontal CAT 994K', faena: 'Faena Sur', descripcion: 'Cambio dientes cucharon y revisión estructural', estado: 'abierta', criticidad: 'baja', tecnicoAsignado: 'Roberto Silva', planificador: 'Pedro Soto', fechaCreacion: '2024-06-11T16:00:00', fechaPlanificada: '2024-06-17', hhEstimadas: 6, hhReales: 0, repuestos: [{ codigoSAP: 'SAP-66789', descripcion: 'Diente cucharon CAT 994K (juego)', cantidadSolicitada: 6, cantidadEntregada: 0, estado: 'pendiente' }], checklist: [], evidencias: [], comentarios: [] },
  { id: 'OT010', numero: 'OT-2024-0842', tipo: 'mejora', equipoId: 'EQ006', equipo: 'Bulldozer Komatsu D375A', faena: 'Faena Norte', descripcion: 'Instalación sistema monitoreo vibración cabina', estado: 'completada', criticidad: 'baja', tecnicoAsignado: 'Andrés Contreras', planificador: 'Carmen Díaz', fechaCreacion: '2024-06-03T08:00:00', fechaPlanificada: '2024-06-10', fechaInicio: '2024-06-10T08:00:00', fechaCierre: '2024-06-10T14:00:00', hhEstimadas: 5, hhReales: 5, repuestos: [{ codigoSAP: 'SAP-77890', descripcion: 'Sensor vibración triaxial', cantidadSolicitada: 2, cantidadEntregada: 2, estado: 'entregado' }], checklist: [{ id: 'c1', descripcion: 'Instalar sensores en cabina', completado: true }, { id: 'c2', descripcion: 'Cableado a módulo adquisición', completado: true }, { id: 'c3', descripcion: 'Configurar software monitoreo', completado: true }, { id: 'c4', descripcion: 'Calibrar umbrales de alarma', completado: true }], evidencias: [], comentarios: [] },
];

export const repuestos: Repuesto[] = [
  { codigoSAP: 'SAP-22341', descripcion: 'Filtro aceite motor Komatsu 930E', unidadMedida: 'UN', stockActual: 12, stockMinimo: 5, stockCritico: 2, bodega: 'Bodega Principal Norte', estado: 'disponible', ubicacion: 'A-12-04' },
  { codigoSAP: 'SAP-22342', descripcion: 'Filtro combustible primario CAT 797', unidadMedida: 'UN', stockActual: 3, stockMinimo: 4, stockCritico: 2, bodega: 'Bodega Principal Norte', estado: 'bajo_stock', ubicacion: 'A-12-05' },
  { codigoSAP: 'SAP-44567', descripcion: 'Pastilla freno trasera 930E', unidadMedida: 'JGO', stockActual: 1, stockMinimo: 3, stockCritico: 1, bodega: 'Bodega Principal Norte', estado: 'bajo_stock', ubicacion: 'B-08-02' },
  { codigoSAP: 'SAP-45821', descripcion: 'Bomba agua refrigeración CAT 797F', unidadMedida: 'UN', stockActual: 0, stockMinimo: 1, stockCritico: 0, bodega: 'Bodega Principal Norte', estado: 'sin_stock', ubicacion: 'C-03-01' },
  { codigoSAP: 'SAP-77102', descripcion: 'Transformador principal 480V', unidadMedida: 'UN', stockActual: 0, stockMinimo: 1, stockCritico: 0, bodega: 'Bodega Principal Sur', estado: 'sin_stock', ubicacion: 'D-01-01' },
  { codigoSAP: 'SAP-99123', descripcion: 'Manto bowl chancador Metso C160', unidadMedida: 'UN', stockActual: 0, stockMinimo: 1, stockCritico: 0, bodega: 'Bodega Este', estado: 'en_transito', ubicacion: 'PATIO' },
  { codigoSAP: 'SAP-11245', descripcion: 'Manguera hidráulica 1\" SAE 100R2', unidadMedida: 'M', stockActual: 45, stockMinimo: 10, stockCritico: 5, bodega: 'Bodega Principal Norte', estado: 'disponible', ubicacion: 'E-15-03' },
  { codigoSAP: 'SAP-33456', descripcion: 'Aceite hidráulico ISO 46 - 200L', unidadMedida: 'BD', stockActual: 8, stockMinimo: 5, stockCritico: 2, bodega: 'Bodega Principal Norte', estado: 'disponible', ubicacion: 'TANQUE-02' },
  { codigoSAP: 'SAP-55678', descripcion: 'Bomba lubricación engranajes', unidadMedida: 'UN', stockActual: 2, stockMinimo: 2, stockCritico: 1, bodega: 'Bodega Principal Sur', estado: 'disponible', ubicacion: 'C-05-07' },
  { codigoSAP: 'SAP-66789', descripcion: 'Diente cucharon CAT 994K (juego)', unidadMedida: 'JGO', stockActual: 2, stockMinimo: 3, stockCritico: 1, bodega: 'Bodega Principal Sur', estado: 'bajo_stock', ubicacion: 'B-10-01' },
];

export const solicitudesRepuesto: SolicitudRepuesto[] = [
  { id: 'SR001', numero: 'SR-2024-0234', otId: 'OT001', solicitante: 'Juan Pérez', fechaSolicitud: '2024-06-10T09:30:00', estado: 'entregada', faena: 'Faena Norte', items: [{ codigoSAP: 'SAP-45821', descripcion: 'Bomba agua refrigeración CAT 797F', cantidad: 1, unidadMedida: 'UN' }, { codigoSAP: 'SAP-32015', descripcion: 'Manguera radiador superior 4\"', cantidad: 2, unidadMedida: 'UN' }] },
  { id: 'SR002', numero: 'SR-2024-0235', otId: 'OT006', solicitante: 'Luis Ortega', fechaSolicitud: '2024-06-08T10:30:00', estado: 'en_preparacion', faena: 'Faena Este', items: [{ codigoSAP: 'SAP-99123', descripcion: 'Manto bowl chancador Metso C160', cantidad: 1, unidadMedida: 'UN' }, { codigoSAP: 'SAP-99124', descripcion: 'Concavo fijo chancador C160', cantidad: 1, unidadMedida: 'UN' }] },
  { id: 'SR003', numero: 'SR-2024-0236', otId: 'OT002', solicitante: 'Miguel Ángel Rojas', fechaSolicitud: '2024-06-10T11:30:00', estado: 'aprobada', faena: 'Faena Sur', items: [{ codigoSAP: 'SAP-77102', descripcion: 'Transformador principal 480V', cantidad: 1, unidadMedida: 'UN' }, { codigoSAP: 'SAP-55234', descripcion: 'Fusible NH-3 500A', cantidad: 3, unidadMedida: 'UN' }] },
  { id: 'SR004', numero: 'SR-2024-0237', otId: 'OT007', solicitante: 'Juan Pérez', fechaSolicitud: '2024-06-11T15:30:00', estado: 'pendiente', faena: 'Faena Norte', items: [{ codigoSAP: 'SAP-44567', descripcion: 'Pastilla freno trasera 930E', cantidad: 4, unidadMedida: 'JGO' }] },
  { id: 'SR005', numero: 'SR-2024-0238', otId: 'OT009', solicitante: 'Roberto Silva', fechaSolicitud: '2024-06-11T16:30:00', estado: 'pendiente', faena: 'Faena Sur', items: [{ codigoSAP: 'SAP-66789', descripcion: 'Diente cucharon CAT 994K (juego)', cantidad: 6, unidadMedida: 'JGO' }] },
];

export const alertas: Alerta[] = [
  { id: 'AL001', tipo: 'critica', titulo: 'OT Crítica Vencida', mensaje: 'La OT-2024-0840 (Excavadora Hitachi EX5600) lleva 4 días abierta sin asignación de fecha de inicio.', faena: 'Faena Sur', fecha: '2024-06-14T08:00:00', leida: false, entidadId: 'OT002', entidadTipo: 'ot' },
  { id: 'AL002', tipo: 'critica', titulo: 'Equipo Detenido', mensaje: 'El Camión CAT 797F (CAM-002) lleva 4 días detenido por mantenimiento. Impacto en producción estimado: 15%.', faena: 'Faena Norte', fecha: '2024-06-14T07:30:00', leida: false, entidadId: 'EQ002', entidadTipo: 'equipo' },
  { id: 'AL003', tipo: 'advertencia', titulo: 'Stock Crítico', mensaje: 'El repuesto SAP-44567 (Pastilla freno trasera 930E) está con stock bajo: solo queda 1 juego.', faena: 'Bodega Principal Norte', fecha: '2024-06-14T06:00:00', leida: false, entidadId: 'SAP-44567', entidadTipo: 'repuesto' },
  { id: 'AL004', tipo: 'advertencia', titulo: 'Sin Stock - Repuesto', mensaje: 'Bomba agua refrigeración CAT 797F (SAP-45821) sin stock. Solicitud de compra pendiente.', faena: 'Bodega Principal Norte', fecha: '2024-06-13T14:00:00', leida: true, entidadId: 'SAP-45821', entidadTipo: 'repuesto' },
  { id: 'AL005', tipo: 'advertencia', titulo: 'Backlog Elevado', mensaje: 'Faena Sur acumula 12 OT abiertas con promedio de 8 días de antigüedad. Revisar capacidad de planificación.', faena: 'Faena Sur', fecha: '2024-06-13T09:00:00', leida: false, entidadTipo: 'ot' },
  { id: 'AL006', tipo: 'info', titulo: 'Repuesto en Tránsito', mensaje: 'Manto bowl chancador (SAP-99123) en tránsito. ETA estimada: 16 de junio.', faena: 'Faena Este', fecha: '2024-06-12T16:00:00', leida: true, entidadId: 'SAP-99123', entidadTipo: 'repuesto' },
  { id: 'AL007', tipo: 'critica', titulo: 'SM sin Revisión', mensaje: 'SM-2024-0127 lleva 3 días sin ser revisada. Equipo: Perforadora Sandvik DP1500.', faena: 'Faena Norte', fecha: '2024-06-14T08:30:00', leida: false, entidadId: 'SM003', entidadTipo: 'sm' },
  { id: 'AL008', tipo: 'advertencia', titulo: 'Disponibilidad Baja', mensaje: 'La disponibilidad de la flota Faena Norte ha caído a 87.3% esta semana.', faena: 'Faena Norte', fecha: '2024-06-13T18:00:00', leida: false },
];

export const actividades: Actividad[] = [
  { id: 'AC001', tipo: 'ot_asignada', descripcion: 'OT-2024-0845 asignada a Juan Pérez', usuario: 'Pedro Soto', faena: 'Faena Norte', fecha: '2024-06-14T09:00:00', entidadId: 'OT001', entidadTipo: 'ot', detalle: 'Reparación sistema refrigeración CAT 797F' },
  { id: 'AC002', tipo: 'repuesto_entregado', descripcion: 'Bodega entregó 2 ítems para OT-2024-0845', usuario: 'Bodega Norte', faena: 'Faena Norte', fecha: '2024-06-14T08:45:00', entidadId: 'OT001', entidadTipo: 'ot', detalle: 'Bomba agua + Mangueras radiador' },
  { id: 'AC003', tipo: 'sm_creada', descripcion: 'Nueva SM-2024-0130 creada', usuario: 'Diego Fuentes', faena: 'Faena Norte', fecha: '2024-06-14T08:30:00', entidadId: 'SM006', entidadTipo: 'sm', detalle: 'Bulldozer D375A - Vibración cabina' },
  { id: 'AC004', tipo: 'ot_creada', descripcion: 'OT-2024-0850 creada desde SM-2024-0127', usuario: 'Carmen Díaz', faena: 'Faena Norte', fecha: '2024-06-14T08:15:00', entidadId: 'OT003', entidadTipo: 'ot', detalle: 'Perforadora DP1500 - Línea hidráulica' },
  { id: 'AC005', tipo: 'equipo_detenido', descripcion: 'Excavadora Hitachi EX5600 reportada detenida', usuario: 'Ana López', faena: 'Faena Sur', fecha: '2024-06-14T08:00:00', entidadId: 'EQ005', entidadTipo: 'equipo', detalle: 'Falla eléctrica panel principal' },
  { id: 'AC006', tipo: 'repuesto_solicitado', descripcion: 'SR-2024-0237 solicitada desde OT-2024-0848', usuario: 'Juan Pérez', faena: 'Faena Norte', fecha: '2024-06-14T07:45:00', entidadId: 'SR004', entidadTipo: 'sr', detalle: '4 juegos pastilla freno trasera 930E' },
  { id: 'AC007', tipo: 'alerta_generada', descripcion: 'Alerta crítica generada automáticamente', usuario: 'Sistema', faena: 'Faena Sur', fecha: '2024-06-14T07:30:00', entidadId: 'AL002', detalle: 'Equipo CAT 797F 4 días detenido' },
  { id: 'AC008', tipo: 'ot_cerrada', descripcion: 'OT-2024-0842 cerrada y validada', usuario: 'Andrés Contreras', faena: 'Faena Norte', fecha: '2024-06-13T16:00:00', entidadId: 'OT010', entidadTipo: 'ot', detalle: 'Instalación monitoreo vibración D375A' },
];

export const kpis: KPIData[] = [
  { label: 'OT Abiertas', valor: 142, tendencia: -12, tendenciaTipo: 'down', icono: 'ClipboardList', color: '#0E7490' },
  { label: 'OT Críticas', valor: 8, tendencia: 3, tendenciaTipo: 'up', icono: 'AlertTriangle', color: '#DC2626' },
  { label: 'Backlog (días)', valor: 4.2, tendencia: -0.8, tendenciaTipo: 'down', icono: 'Clock', color: '#D97706' },
  { label: 'Disp. Flota', valor: '89.4%', tendencia: -2.1, tendenciaTipo: 'down', icono: 'Gauge', color: '#16A34A' },
  { label: 'Stock Crítico', valor: 6, tendencia: 2, tendenciaTipo: 'up', icono: 'PackageX', color: '#D97706' },
  { label: 'SM Pendientes', valor: 23, tendencia: -5, tendenciaTipo: 'down', icono: 'Inbox', color: '#4F46E5' },
];

export const usuarioActual: Usuario = {
  id: 'U001',
  nombre: 'Carlos Henríquez',
  email: 'carlos.henriquez@minera.cl',
  rol: 'Supervisor de Mantenimiento',
  faenaDefault: 'F01',
  permisos: [
    'mantenimiento.ver',
    'mantenimiento.editar',
    'bodega.ver',
    'planificacion.ver',
    'reportes.ver',
    'documentos.ver',
    'usuarios.ver',
    'usuarios.editar',
    'usuarios.crear',
    'configuracion.ver',
  ],
};

export const planificacionSemanal = [
  { dia: 'Lunes', fecha: '2024-06-10', ots: ['OT-2024-0845', 'OT-2024-0839'] },
  { dia: 'Martes', fecha: '2024-06-11', ots: ['OT-2024-0840', 'OT-2024-0839'] },
  { dia: 'Miércoles', fecha: '2024-06-12', ots: ['OT-2024-0840', 'OT-2024-0850'] },
  { dia: 'Jueves', fecha: '2024-06-13', ots: ['OT-2024-0850', 'OT-2024-0848'] },
  { dia: 'Viernes', fecha: '2024-06-14', ots: ['OT-2024-0848'] },
  { dia: 'Sábado', fecha: '2024-06-15', ots: [] },
  { dia: 'Domingo', fecha: '2024-06-16', ots: ['OT-2024-0840'] },
];

export const tecnicos = [
  { nombre: 'Juan Pérez', cargaSemanal: 38, capacidad: 48, faena: 'Faena Norte', especialidad: 'Mecánica' },
  { nombre: 'Miguel Ángel Rojas', cargaSemanal: 42, capacidad: 48, faena: 'Faena Sur', especialidad: 'Eléctrica' },
  { nombre: 'Andrés Contreras', cargaSemanal: 30, capacidad: 44, faena: 'Faena Norte', especialidad: 'Hidráulica' },
  { nombre: 'Luis Ortega', cargaSemanal: 45, capacidad: 48, faena: 'Faena Este', especialidad: 'Mecánica Pesada' },
  { nombre: 'Roberto Silva', cargaSemanal: 20, capacidad: 40, faena: 'Faena Sur', especialidad: 'Soldadura' },
];

export const indicadoresConfiabilidad = [
  { mes: 'Ene', mtbf: 420, mttr: 8, disponibilidad: 94.5 },
  { mes: 'Feb', mtbf: 380, mttr: 12, disponibilidad: 91.2 },
  { mes: 'Mar', mtbf: 450, mttr: 6, disponibilidad: 95.8 },
  { mes: 'Abr', mtbf: 390, mttr: 10, disponibilidad: 92.1 },
  { mes: 'May', mtbf: 410, mttr: 7, disponibilidad: 94.0 },
  { mes: 'Jun', mtbf: 360, mttr: 11, disponibilidad: 89.4 },
];

export const disponibilidadPorFaena = [
  { faena: 'Faena Norte', disponibilidad: 87.3, objetivo: 92.0 },
  { faena: 'Faena Sur', disponibilidad: 91.5, objetivo: 92.0 },
  { faena: 'Faena Este', disponibilidad: 93.8, objetivo: 92.0 },
  { faena: 'Faena Oeste', disponibilidad: 95.2, objetivo: 92.0 },
];
