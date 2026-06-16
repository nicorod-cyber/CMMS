export type Criticidad = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoOT = 'abierta' | 'en_progreso' | 'en_espera' | 'completada' | 'validada' | 'cerrada' | 'reprogramada';
export type EstadoSM = 'nueva' | 'en_revision' | 'aprobada' | 'rechazada' | 'convertida';
export type EstadoSR = 'pendiente' | 'aprobada' | 'en_preparacion' | 'despachada' | 'entregada' | 'rechazada';
export type EstadoRepuesto = 'disponible' | 'bajo_stock' | 'sin_stock' | 'en_transito';
export type TipoMantenimiento = 'correctivo' | 'preventivo' | 'predictivo' | 'mejora';
export type TipoEquipo = 'camion' | 'perforadora' | 'cargador' | 'bulldozer' | 'excavadora' | 'compresor' | 'planta' | 'sistema';

export interface Faena {
  id: string;
  nombre: string;
  ubicacion: string;
  activa: boolean;
}

export interface Equipo {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoEquipo;
  marca: string;
  modelo: string;
  faenaId: string;
  faena: string;
  planta: string;
  sistema: string;
  subsistema: string;
  estadoOperativo: 'disponible' | 'en_mantenimiento' | 'detenido' | 'operando';
  horometro: number;
  disponibilidad: number;
  criticidad: Criticidad;
  ultimaOT?: string;
  imagen?: string;
}

export interface SolicitudMantenimiento {
  id: string;
  numero: string;
  equipoId: string;
  equipo: string;
  faena: string;
  solicitante: string;
  fechaSolicitud: string;
  tipoFalla: string;
  descripcion: string;
  criticidad: Criticidad;
  estado: EstadoSM;
  fotos?: string[];
  otGenerada?: string;
}

export interface OrdenTrabajo {
  id: string;
  numero: string;
  smId?: string;
  tipo: TipoMantenimiento;
  equipoId: string;
  equipo: string;
  faena: string;
  descripcion: string;
  estado: EstadoOT;
  criticidad: Criticidad;
  tecnicoAsignado?: string;
  planificador: string;
  fechaCreacion: string;
  fechaPlanificada?: string;
  fechaInicio?: string;
  fechaCierre?: string;
  hhEstimadas: number;
  hhReales?: number;
  repuestos: RepuestoOT[];
  checklist: ChecklistItem[];
  evidencias: Evidencia[];
  comentarios: Comentario[];
}

export interface RepuestoOT {
  codigoSAP: string;
  descripcion: string;
  cantidadSolicitada: number;
  cantidadEntregada: number;
  estado: 'pendiente' | 'entregado' | 'parcial';
}

export interface ChecklistItem {
  id: string;
  descripcion: string;
  completado: boolean;
  observacion?: string;
}

export interface Evidencia {
  id: string;
  tipo: 'foto' | 'documento' | 'video';
  url: string;
  descripcion: string;
  fecha: string;
  usuario: string;
}

export interface Comentario {
  id: string;
  usuario: string;
  texto: string;
  fecha: string;
  rol: string;
}

export interface Repuesto {
  codigoSAP: string;
  descripcion: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  stockCritico: number;
  bodega: string;
  estado: EstadoRepuesto;
  ubicacion?: string;
  ultimoMovimiento?: string;
  precioUnitario?: number;
}

export interface SolicitudRepuesto {
  id: string;
  numero: string;
  otId: string;
  solicitante: string;
  fechaSolicitud: string;
  estado: EstadoSR;
  items: RepuestoSR[];
  faena: string;
}

export interface RepuestoSR {
  codigoSAP: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
}

export interface Alerta {
  id: string;
  tipo: 'critica' | 'advertencia' | 'info' | 'exito';
  titulo: string;
  mensaje: string;
  faena: string;
  fecha: string;
  leida: boolean;
  entidadId?: string;
  entidadTipo?: 'ot' | 'equipo' | 'repuesto' | 'sm';
}

export interface Actividad {
  id: string;
  tipo: 'ot_creada' | 'ot_cerrada' | 'ot_asignada' | 'sm_creada' | 'sm_convertida' | 'repuesto_entregado' | 'repuesto_solicitado' | 'equipo_detenido' | 'alerta_generada';
  descripcion: string;
  usuario: string;
  faena: string;
  fecha: string;
  entidadId?: string;
  entidadTipo?: string;
  detalle?: string;
}

export interface KPIData {
  label: string;
  valor: number | string;
  tendencia?: number;
  tendenciaTipo?: 'up' | 'down' | 'neutral';
  icono: string;
  color: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  avatar?: string;
  faenaDefault?: string;
  permisos: string[];
}
