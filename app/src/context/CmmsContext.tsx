import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import {
  ordenesTrabajo as initialOrdenes,
  solicitudesMantenimiento as initialSolicitudes,
  solicitudesRepuesto as initialSolicitudesRepuesto,
  repuestos as initialRepuestos,
  equipos,
  usuarioActual,
} from '@/data/mockData';
import type {
  ChecklistItem,
  Criticidad,
  EstadoOT,
  EstadoSM,
  OrdenTrabajo,
  Repuesto,
  SolicitudMantenimiento,
  SolicitudRepuesto,
  TipoMantenimiento,
  Usuario,
} from '@/types';

type DocumentoCMMS = {
  id: string;
  nombre: string;
  tipo: 'Manual' | 'Procedimiento' | 'Pauta' | 'Checklist' | 'Certificado' | 'Plano';
  entidad: string;
  url: string;
  sharepointFolder: string;
  version: string;
  estado: 'vigente' | 'revision' | 'obsoleto';
  fecha: string;
};

type PautaMantenimiento = {
  id: string;
  codigo: string;
  nombre: string;
  equipoTipo: string;
  frecuencia: string;
  duracionHoras: number;
  tareas: ChecklistItem[];
  estado: 'vigente' | 'borrador';
};

type KardexMovimiento = {
  id: string;
  fecha: string;
  codigoSAP: string;
  descripcion: string;
  tipo: 'entrada' | 'salida' | 'reserva' | 'ajuste';
  cantidad: number;
  referencia: string;
  usuario: string;
  stockResultante: number;
};

type NuevoOTInput = {
  equipoId: string;
  descripcion: string;
  tareas: string[];
  tecnico: string;
  prioridad: Criticidad;
  tipo?: TipoMantenimiento;
  hhEstimadas?: number;
  origen?: string;
};

type NuevaSMInput = {
  equipoId: string;
  solicitante: string;
  tipoFalla: string;
  descripcion: string;
  criticidad: Criticidad;
};

type NuevaSRInput = {
  otId: string;
  solicitante: string;
  faena: string;
  items: { codigoSAP: string; cantidad: number }[];
};

interface CmmsContextValue {
  ordenes: OrdenTrabajo[];
  solicitudes: SolicitudMantenimiento[];
  solicitudesRepuesto: SolicitudRepuesto[];
  repuestos: Repuesto[];
  documentos: DocumentoCMMS[];
  pautas: PautaMantenimiento[];
  usuarios: Usuario[];
  kardex: KardexMovimiento[];
  createOT: (input: NuevoOTInput) => OrdenTrabajo | null;
  updateOT: (id: string, updates: Partial<OrdenTrabajo>) => void;
  setOTEstado: (id: string, estado: EstadoOT) => void;
  toggleChecklist: (otId: string, checklistId: string) => void;
  addOTComment: (otId: string, texto: string) => void;
  createSM: (input: NuevaSMInput) => SolicitudMantenimiento | null;
  setSMEstado: (id: string, estado: EstadoSM) => void;
  convertirSMaOT: (id: string) => OrdenTrabajo | null;
  createSR: (input: NuevaSRInput) => SolicitudRepuesto | null;
  setSREstado: (id: string, estado: SolicitudRepuesto['estado']) => void;
  moveStock: (codigoSAP: string, cantidad: number, tipo: KardexMovimiento['tipo'], referencia: string) => void;
  addDocumento: (doc: Omit<DocumentoCMMS, 'id' | 'fecha'>) => void;
  addPauta: (pauta: Omit<PautaMantenimiento, 'id'>) => void;
  addOTEvidence: (otId: string, evidencia: Omit<Evidencia, 'id' | 'fecha' | 'usuario'>) => void;
  currentUser: Usuario;
  currentUserId: string;
  setCurrentUser: (id: string) => void;
  hasPermission: (permission: string) => boolean;
  updateUsuario: (id: string, updates: Partial<Usuario>) => void;
  addUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  resetDemo: () => void;
}

const STORAGE_KEY = 'cmms-demo-state-v1';

const initialDocumentos: DocumentoCMMS[] = [
  {
    id: 'DOC001',
    nombre: 'Manual de Operacion Komatsu 930E',
    tipo: 'Manual',
    entidad: 'CAM-001',
    url: 'https://sharepoint.contoso.com/sites/cmms/Activos/CAM-001/manual-operacion.pdf',
    sharepointFolder: '/Activos/CAM-001',
    version: 'v3.2',
    estado: 'vigente',
    fecha: '2024-06-01',
  },
  {
    id: 'DOC002',
    nombre: 'Pauta PM 1000 horas camion minero',
    tipo: 'Pauta',
    entidad: 'Flota Camiones',
    url: 'https://sharepoint.contoso.com/sites/cmms/Pautas/PM-1000H.pdf',
    sharepointFolder: '/Pautas/Mantenimiento Preventivo',
    version: 'v1.8',
    estado: 'vigente',
    fecha: '2024-05-15',
  },
  {
    id: 'DOC003',
    nombre: 'Procedimiento bloqueo y energia cero',
    tipo: 'Procedimiento',
    entidad: 'General',
    url: 'https://sharepoint.contoso.com/sites/cmms/SSO/LOTO.pdf',
    sharepointFolder: '/Procedimientos/SSO',
    version: 'v2.1',
    estado: 'revision',
    fecha: '2024-06-08',
  },
];

const initialPautas: PautaMantenimiento[] = [
  {
    id: 'PAU001',
    codigo: 'PM-CAM-1000H',
    nombre: 'Servicio preventivo 1000 horas camion minero',
    equipoTipo: 'camion',
    frecuencia: '1000 horas',
    duracionHoras: 12,
    estado: 'vigente',
    tareas: [
      { id: 'p1', descripcion: 'Cambiar aceite motor y filtros', completado: false },
      { id: 'p2', descripcion: 'Inspeccionar frenos, direccion y suspension', completado: false },
      { id: 'p3', descripcion: 'Lubricar puntos criticos', completado: false },
      { id: 'p4', descripcion: 'Registrar mediciones y liberar equipo', completado: false },
    ],
  },
  {
    id: 'PAU002',
    codigo: 'PM-HID-MENSUAL',
    nombre: 'Inspeccion mensual sistema hidraulico',
    equipoTipo: 'perforadora',
    frecuencia: 'Mensual',
    duracionHoras: 4,
    estado: 'vigente',
    tareas: [
      { id: 'p1', descripcion: 'Medir nivel y condicion del aceite', completado: false },
      { id: 'p2', descripcion: 'Inspeccionar mangueras y conexiones', completado: false },
      { id: 'p3', descripcion: 'Verificar presiones de trabajo', completado: false },
    ],
  },
];

const initialUsuarios: Usuario[] = [
  usuarioActual,
  { id: 'U002', nombre: 'Pedro Soto', email: 'pedro.soto@minera.cl', rol: 'Planificador', permisos: ['mantenimiento.ver', 'mantenimiento.editar', 'planificacion.ver'] },
  { id: 'U003', nombre: 'Bodega Norte', email: 'bodega.norte@minera.cl', rol: 'Bodeguero', permisos: ['bodega.ver', 'bodega.editar'] },
  { id: 'U004', nombre: 'Juan Perez', email: 'juan.perez@minera.cl', rol: 'Tecnico Mecanico', permisos: ['mantenimiento.ver'] },
];

const initialKardex: KardexMovimiento[] = initialRepuestos.slice(0, 5).map((r, index) => ({
  id: `KDX${String(index + 1).padStart(3, '0')}`,
  fecha: `2024-06-${String(10 + index).padStart(2, '0')}T08:00:00`,
  codigoSAP: r.codigoSAP,
  descripcion: r.descripcion,
  tipo: index % 2 === 0 ? 'entrada' : 'salida',
  cantidad: index % 2 === 0 ? 2 : 1,
  referencia: index % 2 === 0 ? 'OC demo' : 'OT demo',
  usuario: index % 2 === 0 ? 'Bodega Norte' : 'Juan Perez',
  stockResultante: r.stockActual,
}));

const defaultState = {
  ordenes: initialOrdenes,
  solicitudes: initialSolicitudes,
  solicitudesRepuesto: initialSolicitudesRepuesto,
  repuestos: initialRepuestos,
  documentos: initialDocumentos,
  pautas: initialPautas,
  usuarios: initialUsuarios,
  kardex: initialKardex,
  currentUserId: usuarioActual.id,
};

const CmmsContext = createContext<CmmsContextValue | null>(null);

function nextNumber(prefix: string, items: { numero?: string }[], base: number) {
  return `${prefix}-${new Date().getFullYear()}-${String(base + items.length + 1).padStart(4, '0')}`;
}

function getRepuestoEstado(repuesto: Repuesto): Repuesto['estado'] {
  if (repuesto.stockActual <= repuesto.stockCritico) return 'sin_stock';
  if (repuesto.stockActual <= repuesto.stockMinimo) return 'bajo_stock';
  return 'disponible';
}

export function CmmsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(defaultState);

  const currentUser = useMemo(
    () => state.usuarios.find(user => user.id === state.currentUserId) ?? usuarioActual,
    [state.usuarios, state.currentUserId]
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setState({ ...defaultState, ...JSON.parse(saved) });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<CmmsContextValue>(() => ({
    ...state,
    currentUser,
    currentUserId: state.currentUserId,
    setCurrentUser(id) {
      setState(prev => ({ ...prev, currentUserId: id }));
    },
    hasPermission(permission) {
      return currentUser.permisos.includes(permission);
    },
    updateUsuario(id, updates) {
      setState(prev => ({ ...prev, usuarios: prev.usuarios.map(user => user.id === id ? { ...user, ...updates } : user) }));
      toast.success('Usuario actualizado');
    },
    createOT(input) {
      const equipo = equipos.find(item => item.id === input.equipoId);
      if (!equipo) return null;

      const ot: OrdenTrabajo = {
        id: `OTN${Date.now()}`,
        numero: nextNumber('OT', state.ordenes, 850),
        tipo: input.tipo ?? 'correctivo',
        equipoId: equipo.id,
        equipo: equipo.nombre,
        faena: equipo.faena,
        descripcion: input.descripcion,
        estado: 'abierta',
        criticidad: input.prioridad,
        tecnicoAsignado: input.tecnico,
        planificador: currentUser.nombre,
        fechaCreacion: new Date().toISOString(),
        fechaPlanificada: new Date().toISOString().slice(0, 10),
        hhEstimadas: input.hhEstimadas ?? 0,
        hhReales: 0,
        repuestos: [],
        checklist: input.tareas.map((tarea, index) => ({ id: `chk-${Date.now()}-${index}`, descripcion: tarea, completado: false })),
        evidencias: [],
        comentarios: input.origen ? [{ id: `com-${Date.now()}`, usuario: 'Sistema', texto: input.origen, fecha: new Date().toISOString(), rol: 'Automatizacion' }] : [],
      };

      setState(prev => ({ ...prev, ordenes: [ot, ...prev.ordenes] }));
      toast.success(`${ot.numero} creada`);
      return ot;
    },
    updateOT(id, updates) {
      setState(prev => ({ ...prev, ordenes: prev.ordenes.map(ot => ot.id === id ? { ...ot, ...updates } : ot) }));
      toast.success('OT actualizada');
    },
    setOTEstado(id, estado) {
      setState(prev => ({
        ...prev,
        ordenes: prev.ordenes.map(ot => ot.id === id ? {
          ...ot,
          estado,
          fechaInicio: estado === 'en_progreso' && !ot.fechaInicio ? new Date().toISOString() : ot.fechaInicio,
          fechaCierre: ['completada', 'cerrada', 'validada'].includes(estado) ? new Date().toISOString() : ot.fechaCierre,
        } : ot),
      }));
      toast.success('Estado de OT actualizado');
    },
    toggleChecklist(otId, checklistId) {
      setState(prev => ({
        ...prev,
        ordenes: prev.ordenes.map(ot => ot.id === otId ? {
          ...ot,
          checklist: ot.checklist.map(item => item.id === checklistId ? { ...item, completado: !item.completado } : item),
        } : ot),
      }));
    },
    addOTComment(otId, texto) {
      if (!texto.trim()) return;
      setState(prev => ({
        ...prev,
        ordenes: prev.ordenes.map(ot => ot.id === otId ? {
          ...ot,
          comentarios: [{ id: `com-${Date.now()}`, usuario: currentUser.nombre, texto: texto.trim(), fecha: new Date().toISOString(), rol: currentUser.rol }, ...ot.comentarios],
        } : ot),
      }));
      toast.success('Comentario agregado');
    },
    createSM(input) {
      const equipo = equipos.find(item => item.id === input.equipoId);
      if (!equipo) return null;
      const sm: SolicitudMantenimiento = {
        id: `SMN${Date.now()}`,
        numero: nextNumber('SM', state.solicitudes, 132),
        equipoId: equipo.id,
        equipo: equipo.nombre,
        faena: equipo.faena,
        solicitante: input.solicitante,
        fechaSolicitud: new Date().toISOString(),
        tipoFalla: input.tipoFalla,
        descripcion: input.descripcion,
        criticidad: input.criticidad,
        estado: 'nueva',
      };
      setState(prev => ({ ...prev, solicitudes: [sm, ...prev.solicitudes] }));
      toast.success(`${sm.numero} registrada`);
      return sm;
    },
    setSMEstado(id, estado) {
      setState(prev => ({ ...prev, solicitudes: prev.solicitudes.map(sm => sm.id === id ? { ...sm, estado } : sm) }));
      toast.success('Solicitud actualizada');
    },
    convertirSMaOT(id) {
      const sm = state.solicitudes.find(item => item.id === id);
      if (!sm) return null;

      const ot: OrdenTrabajo = {
        id: `OTN${Date.now()}`,
        numero: nextNumber('OT', state.ordenes, 850),
        smId: sm.id,
        tipo: 'correctivo',
        equipoId: sm.equipoId,
        equipo: sm.equipo,
        faena: sm.faena,
        descripcion: `${sm.tipoFalla} - ${sm.descripcion}`,
        estado: 'abierta',
        criticidad: sm.criticidad,
        tecnicoAsignado: undefined,
        planificador: currentUser.nombre,
        fechaCreacion: new Date().toISOString(),
        fechaPlanificada: new Date().toISOString().slice(0, 10),
        hhEstimadas: 6,
        hhReales: 0,
        repuestos: [],
        checklist: ['Diagnosticar falla reportada', 'Ejecutar reparacion', 'Registrar pruebas y liberar equipo'].map((tarea, index) => ({
          id: `chk-sm-${Date.now()}-${index}`,
          descripcion: tarea,
          completado: false,
        })),
        evidencias: [],
        comentarios: [{ id: `com-${Date.now()}`, usuario: 'Sistema', texto: `OT generada desde ${sm.numero}`, fecha: new Date().toISOString(), rol: 'Automatizacion' }],
      };

      setState(prev => ({
        ...prev,
        ordenes: [ot, ...prev.ordenes],
        solicitudes: prev.solicitudes.map(item => item.id === id ? { ...item, estado: 'convertida', otGenerada: ot.numero } : item),
      }));
      toast.success(`${sm.numero} convertida a ${ot.numero}`);
      return ot;
    },
    createSR(input) {
      const sr: SolicitudRepuesto = {
        id: `SRN${Date.now()}`,
        numero: nextNumber('SR', state.solicitudesRepuesto, 238),
        otId: input.otId,
        solicitante: input.solicitante,
        fechaSolicitud: new Date().toISOString(),
        estado: 'pendiente',
        faena: input.faena,
        items: input.items.map(item => {
          const repuesto = state.repuestos.find(r => r.codigoSAP === item.codigoSAP);
          return {
            codigoSAP: item.codigoSAP,
            descripcion: repuesto?.descripcion ?? 'Repuesto no catalogado',
            cantidad: item.cantidad,
            unidadMedida: repuesto?.unidadMedida ?? 'UN',
          };
        }),
      };
      setState(prev => ({ ...prev, solicitudesRepuesto: [sr, ...prev.solicitudesRepuesto] }));
      toast.success(`${sr.numero} creada`);
      return sr;
    },
    setSREstado(id, estado) {
      setState(prev => ({ ...prev, solicitudesRepuesto: prev.solicitudesRepuesto.map(sr => sr.id === id ? { ...sr, estado } : sr) }));
      toast.success('Solicitud de repuesto actualizada');
    },
    moveStock(codigoSAP, cantidad, tipo, referencia) {
      setState(prev => {
        const repuesto = prev.repuestos.find(r => r.codigoSAP === codigoSAP);
        if (!repuesto) return prev;
        const delta = tipo === 'entrada' ? cantidad : -cantidad;
        const stockActual = Math.max(0, repuesto.stockActual + delta);
        const actualizado = { ...repuesto, stockActual };
        const movimiento: KardexMovimiento = {
          id: `KDX${Date.now()}`,
          fecha: new Date().toISOString(),
          codigoSAP,
          descripcion: repuesto.descripcion,
          tipo,
          cantidad,
          referencia,
          usuario: usuarioActual.nombre,
          stockResultante: stockActual,
        };
        return {
          ...prev,
          repuestos: prev.repuestos.map(r => r.codigoSAP === codigoSAP ? { ...actualizado, estado: getRepuestoEstado(actualizado) } : r),
          kardex: [movimiento, ...prev.kardex],
        };
      });
      toast.success('Movimiento registrado en kardex');
    },
    addDocumento(doc) {
      setState(prev => ({ ...prev, documentos: [{ ...doc, id: `DOC${Date.now()}`, fecha: new Date().toISOString().slice(0, 10) }, ...prev.documentos] }));
      toast.success('Documento enlazado');
    },
    addPauta(pauta) {
      setState(prev => ({ ...prev, pautas: [{ ...pauta, id: `PAU${Date.now()}` }, ...prev.pautas] }));
      toast.success('Pauta guardada');
    },
    addOTEvidence(otId, evidencia) {
      setState(prev => ({
        ...prev,
        ordenes: prev.ordenes.map(ot => ot.id === otId ? {
          ...ot,
          evidencias: [
            {
              id: `EV${Date.now()}`,
              fecha: new Date().toISOString(),
              usuario: currentUser.nombre,
              ...evidencia,
            },
            ...ot.evidencias,
          ],
        } : ot),
      }));
      toast.success('Evidencia registrada en OT');
    },
    addUsuario(usuario) {
      setState(prev => ({ ...prev, usuarios: [{ ...usuario, id: `U${Date.now()}` }, ...prev.usuarios] }));
      toast.success('Usuario creado');
    },
    resetDemo() {
      localStorage.removeItem(STORAGE_KEY);
      setState(defaultState);
      toast.success('Datos demo restaurados');
    },
  }), [state]);

  return <CmmsContext.Provider value={value}>{children}</CmmsContext.Provider>;
}

export function useCmms() {
  const context = useContext(CmmsContext);
  if (!context) throw new Error('useCmms must be used within CmmsProvider');
  return context;
}
