import { useEffect, useMemo, useState, Fragment } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Eye, Edit, Clock, User, Filter, Layers, SlidersHorizontal
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { equipos, tecnicos } from '@/data/mockData';
import { useCmms } from '@/context/CmmsContext';
import { cn } from '@/lib/utils';
import { matchesFaena } from '@/lib/filters';
import type { Criticidad, EstadoOT, OrdenTrabajo } from '@/types';

type VistaTipo = 'tabla' | 'kanban';
type FiltroRapido = 'todas' | 'abiertas' | 'criticas' | 'progreso' | 'espera' | 'cerradas';

interface NuevaOTForm {
  equipoId: string;
  ubicacion: string;
  descripcion: string;
  tareas: string;
  tecnico: string;
  cliente: string;
  prioridad: Criticidad;
}

const nuevaOTInicial: NuevaOTForm = {
  equipoId: '',
  ubicacion: '',
  descripcion: '',
  tareas: '',
  tecnico: '',
  cliente: '',
  prioridad: 'media',
};

const prioridadLabels: Record<Criticidad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
};

const estadosKanban = ['abierta', 'en_progreso', 'en_espera', 'completada', 'cerrada'] as const;

const estadoLabels: Record<string, { label: string; color: string }> = {
  abierta: { label: 'Abierta', color: 'border-t-sky-500' },
  en_progreso: { label: 'En Progreso', color: 'border-t-blue-500' },
  en_espera: { label: 'En Espera', color: 'border-t-amber-500' },
  completada: { label: 'Completada', color: 'border-t-emerald-500' },
  cerrada: { label: 'Cerrada', color: 'border-t-green-600' },
};

const tablaGrupoLabels: Record<'ninguno' | 'estado' | 'criticidad' | 'tecnico' | 'faena', string> = {
  ninguno: 'Sin agrupar',
  estado: 'Estado',
  criticidad: 'Criticidad',
  tecnico: 'Técnico',
  faena: 'Faena',
};

export function MantenimientoOT() {
  const { ordenes, setOTEstado, toggleChecklist, addOTComment } = useCmms();
  const [searchParams] = useSearchParams();
  const [vista, setVista] = useState<VistaTipo>('kanban');
  const [filtro, setFiltro] = useState<FiltroRapido>('todas');
  const [search, setSearch] = useState('');
  const [sortDir] = useState<'asc' | 'desc'>('desc');
  const [tablaFiltroEstado, setTablaFiltroEstado] = useState<'todas' | 'abierta' | 'en_progreso' | 'en_espera' | 'completada' | 'cerrada'>('todas');
  const [tablaFiltroCriticidad, setTablaFiltroCriticidad] = useState<'todas' | Criticidad>('todas');
  const [tablaFiltroTecnico, setTablaFiltroTecnico] = useState<'todos' | string>('todos');
  const [tablaFiltroFaena, setTablaFiltroFaena] = useState<'todas' | string>('todas');
  const [tablaGrupo, setTablaGrupo] = useState<'ninguno' | 'estado' | 'criticidad' | 'tecnico' | 'faena'>('ninguno');
  const [modalNuevaOT, setModalNuevaOT] = useState(false);
  const [ordenesCreadas, setOrdenesCreadas] = useState<OrdenTrabajo[]>([]);
  const [nuevaOT, setNuevaOT] = useState<NuevaOTForm>(nuevaOTInicial);
  const [errorNuevaOT, setErrorNuevaOT] = useState('');
  const [erroresCampos, setErroresCampos] = useState<Partial<Record<keyof NuevaOTForm, boolean>>>({});
  const [otSeleccionadaId, setOtSeleccionadaId] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    const filtroUrl = searchParams.get('filtro') as FiltroRapido | null;
    const vistaUrl = searchParams.get('vista') as VistaTipo | null;
    const searchUrl = searchParams.get('search');

    if (filtroUrl && ['todas', 'abiertas', 'criticas', 'progreso', 'espera', 'cerradas'].includes(filtroUrl)) {
      setFiltro(filtroUrl);
    }

    if (vistaUrl && ['tabla', 'kanban'].includes(vistaUrl)) {
      setVista(vistaUrl);
    }

    setSearch(searchUrl ?? '');
  }, [searchParams]);


  const equiposDisponibles = useMemo(() => {
    const faenaUrlActual = searchParams.get('faena');
    return equipos.filter(equipo => matchesFaena(equipo.faena, faenaUrlActual));
  }, [searchParams]);

  const actualizarNuevaOT = <K extends keyof NuevaOTForm>(campo: K, valor: NuevaOTForm[K]) => {
    setNuevaOT(prev => ({ ...prev, [campo]: valor }));
    if (errorNuevaOT) setErrorNuevaOT('');
    if (erroresCampos[campo]) {
      setErroresCampos(prev => ({ ...prev, [campo]: false }));
    }
  };

  const crearNuevaOT = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nuevosErrores: Partial<Record<keyof NuevaOTForm, boolean>> = {};

    if (!nuevaOT.equipoId) nuevosErrores.equipoId = true;
    if (!nuevaOT.ubicacion.trim()) nuevosErrores.ubicacion = true;
    if (!nuevaOT.descripcion.trim()) nuevosErrores.descripcion = true;
    if (!nuevaOT.tareas.trim()) nuevosErrores.tareas = true;
    if (!nuevaOT.tecnico) nuevosErrores.tecnico = true;
    if (!nuevaOT.cliente.trim()) nuevosErrores.cliente = true;
    if (!nuevaOT.prioridad) nuevosErrores.prioridad = true;

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresCampos(nuevosErrores);
      setErrorNuevaOT('Complete los campos obligatorios marcados con * antes de crear la OT.');
      return;
    }

    const equipoSeleccionado = equipos.find(equipo => equipo.id === nuevaOT.equipoId);
    if (!equipoSeleccionado) {
      setErrorNuevaOT('Seleccione un equipo válido.');
      return;
    }

    const siguienteNumero = 851 + ordenes.length;
    const tareas = nuevaOT.tareas
      .split('\n')
      .map(tarea => tarea.trim())
      .filter(Boolean);

    const otCreada: OrdenTrabajo = {
      id: `OTN${Date.now()}`,
      numero: `OT-2024-${String(siguienteNumero).padStart(4, '0')}`,
      tipo: 'correctivo',
      equipoId: equipoSeleccionado.id,
      equipo: equipoSeleccionado.nombre,
      faena: equipoSeleccionado.faena,
      descripcion: nuevaOT.descripcion.trim(),
      estado: 'abierta',
      criticidad: nuevaOT.prioridad,
      tecnicoAsignado: nuevaOT.tecnico,
      planificador: 'Carlos Henríquez',
      fechaCreacion: new Date().toISOString(),
      hhEstimadas: 0,
      hhReales: 0,
      repuestos: [],
      checklist: tareas.map((tarea, index) => ({
        id: `nueva-${index + 1}`,
        descripcion: tarea,
        completado: false,
      })),
      evidencias: [],
      comentarios: [
        {
          id: 'cliente-ubicacion',
          usuario: 'Sistema',
          texto: `Cliente: ${nuevaOT.cliente.trim()} | Ubicación: ${nuevaOT.ubicacion.trim()}`,
          fecha: new Date().toISOString(),
          rol: 'Registro OT',
        },
      ],
    };

    setOrdenesCreadas(prev => [otCreada, ...prev]);
    setFiltro('abiertas');
    setVista('kanban');
    setNuevaOT(nuevaOTInicial);
    setErrorNuevaOT('');
    setModalNuevaOT(false);
  };

  const faenaUrl = searchParams.get('faena');
  const otUrl = searchParams.get('ot');
  const baseOrdenes = [...ordenesCreadas, ...ordenes].filter(ot => matchesFaena(ot.faena, faenaUrl));
  const otSeleccionada = baseOrdenes.find(ot => ot.id === otSeleccionadaId) ?? null;
  const progresoChecklist = otSeleccionada && otSeleccionada.checklist.length > 0
    ? Math.round((otSeleccionada.checklist.filter(item => item.completado).length / otSeleccionada.checklist.length) * 100)
    : 0;

  const filtered = baseOrdenes.filter(ot => {
    if (otUrl && ot.id !== otUrl && ot.numero !== otUrl) return false;
    if (search && !ot.numero.toLowerCase().includes(search.toLowerCase()) &&
        !ot.equipo.toLowerCase().includes(search.toLowerCase()) &&
        !ot.descripcion.toLowerCase().includes(search.toLowerCase()) &&
        !(ot.tecnicoAsignado ?? '').toLowerCase().includes(search.toLowerCase()) &&
        !ot.planificador.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtro === 'abiertas') return ['abierta', 'en_progreso', 'en_espera'].includes(ot.estado);
    if (filtro === 'criticas') return ot.criticidad === 'critica' || ot.criticidad === 'alta';
    if (filtro === 'progreso') return ot.estado === 'en_progreso';
    if (filtro === 'espera') return ot.estado === 'en_espera';
    if (filtro === 'cerradas') return ot.estado === 'cerrada';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return dir * (new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime());
  });

  const tablaOrdenes = useMemo(() => sorted.filter(ot => {
    if (tablaFiltroEstado !== 'todas' && ot.estado !== tablaFiltroEstado) return false;
    if (tablaFiltroCriticidad !== 'todas' && ot.criticidad !== tablaFiltroCriticidad) return false;
    if (tablaFiltroTecnico !== 'todos' && ot.tecnicoAsignado !== tablaFiltroTecnico) return false;
    if (tablaFiltroFaena !== 'todas' && ot.faena !== tablaFiltroFaena) return false;
    return true;
  }), [sorted, tablaFiltroEstado, tablaFiltroCriticidad, tablaFiltroTecnico, tablaFiltroFaena]);

  const tablaOrdenesAgrupadas = useMemo(() => {
    if (tablaGrupo === 'ninguno') return null;
    const groups = new Map<string, OrdenTrabajo[]>();
    tablaOrdenes.forEach(ot => {
      const agrupacion = tablaGrupo === 'estado'
        ? ot.estado
        : tablaGrupo === 'criticidad'
          ? ot.criticidad
          : tablaGrupo === 'tecnico'
            ? ot.tecnicoAsignado || 'Sin asignar'
            : ot.faena;
      const listado = groups.get(agrupacion) ?? [];
      listado.push(ot);
      groups.set(agrupacion, listado);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [tablaOrdenes, tablaGrupo]);

  const tablaTecnicos = useMemo(() => ['todos', ...Array.from(new Set(baseOrdenes.map(ot => ot.tecnicoAsignado || '').filter(Boolean))).sort()], [baseOrdenes]);
  const tablaFaenas = useMemo(() => ['todas', ...Array.from(new Set(baseOrdenes.map(ot => ot.faena))).sort()], [baseOrdenes]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Órdenes de Trabajo</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestión y seguimiento de todas las órdenes de trabajo activas</p>
        </div>
        <Button onClick={() => setModalNuevaOT(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Nueva OT
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {([
            { key: 'todas', label: 'Todas', count: baseOrdenes.length },
            { key: 'criticas', label: 'Críticas', count: baseOrdenes.filter(o => o.criticidad === 'critica' || o.criticidad === 'alta').length },
            { key: 'progreso', label: 'En Progreso', count: baseOrdenes.filter(o => o.estado === 'en_progreso').length },
            { key: 'espera', label: 'En Espera', count: baseOrdenes.filter(o => o.estado === 'en_espera').length },
            { key: 'cerradas', label: 'Cerradas', count: baseOrdenes.filter(o => o.estado === 'cerrada').length },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                filtro === f.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              {f.label} <span className={cn('ml-1 text-xs', filtro === f.key ? 'text-slate-300' : 'text-slate-400')}>{f.count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar OT, equipo, técnico..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setVista('kanban')} className={cn('px-3 py-1.5 text-sm rounded-md transition-all', vista === 'kanban' ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-500')}>Kanban</button>
            <button onClick={() => setVista('tabla')} className={cn('px-3 py-1.5 text-sm rounded-md transition-all', vista === 'tabla' ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-500')}>Tabla</button>
          </div>
        </div>
      </div>

      {vista === 'tabla' && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" /> Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filtrar por columna</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Estado
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => setTablaFiltroEstado('todas')}>Todos</DropdownMenuItem>
                    {(['abierta', 'en_progreso', 'en_espera', 'completada', 'cerrada'] as const).map(estado => (
                      <DropdownMenuItem key={estado} onSelect={() => setTablaFiltroEstado(estado)}>
                        {estadoLabels[estado].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Criticidad
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => setTablaFiltroCriticidad('todas')}>Todas</DropdownMenuItem>
                    {(Object.keys(prioridadLabels) as Criticidad[]).map(criticidad => (
                      <DropdownMenuItem key={criticidad} onSelect={() => setTablaFiltroCriticidad(criticidad)}>
                        {prioridadLabels[criticidad]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Técnico
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => setTablaFiltroTecnico('todos')}>Todos</DropdownMenuItem>
                    {tablaTecnicos.filter(t => t !== 'todos').map(tecnico => (
                      <DropdownMenuItem key={tecnico} onSelect={() => setTablaFiltroTecnico(tecnico)}>
                        {tecnico}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Faena
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => setTablaFiltroFaena('todas')}>Todas</DropdownMenuItem>
                    {tablaFaenas.filter(faena => faena !== 'todas').map(faena => (
                      <DropdownMenuItem key={faena} onSelect={() => setTablaFiltroFaena(faena)}>
                        {faena}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => {
                  setTablaFiltroEstado('todas');
                  setTablaFiltroCriticidad('todas');
                  setTablaFiltroTecnico('todos');
                  setTablaFiltroFaena('todas');
                }}>
                  Limpiar filtros
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Layers className="h-4 w-4" /> Agrupar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Agrupar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={tablaGrupo} onValueChange={value => setTablaGrupo(value as typeof tablaGrupo)}>
                  <DropdownMenuRadioItem value="ninguno">Ninguno</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="estado">Estado</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="criticidad">Criticidad</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="tecnico">Técnico</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="faena">Faena</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" className="gap-2" onClick={() => {
              setTablaFiltroEstado('todas');
              setTablaFiltroCriticidad('todas');
              setTablaFiltroTecnico('todos');
              setTablaFiltroFaena('todas');
              setTablaGrupo('ninguno');
            }}>
              <SlidersHorizontal className="h-4 w-4" /> Reset
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            {tablaFiltroEstado !== 'todas' && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Estado: {estadoLabels[tablaFiltroEstado].label}</span>}
            {tablaFiltroCriticidad !== 'todas' && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Criticidad: {prioridadLabels[tablaFiltroCriticidad]}</span>}
            {tablaFiltroTecnico !== 'todos' && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Técnico: {tablaFiltroTecnico}</span>}
            {tablaFiltroFaena !== 'todas' && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Faena: {tablaFiltroFaena}</span>}
            {tablaGrupo !== 'ninguno' && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Agrupado por: {tablaGrupoLabels[tablaGrupo]}</span>}
          </div>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {vista === 'kanban' ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="overflow-x-auto pb-2"
          >
            <div className="flex gap-4 min-w-[1000px]">
              {estadosKanban.map(estado => {
                const otsEstado = sorted.filter(ot => ot.estado === estado);
                return (
                  <div key={estado} className="flex-1 min-w-[220px]">
                    <div className={cn('bg-white rounded-xl border border-slate-200/80 border-t-4 shadow-sm', estadoLabels[estado].color)}>
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">{estadoLabels[estado].label}</h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{otsEstado.length}</span>
                      </div>
                      <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                        {otsEstado.map(ot => (
                          <motion.div
                            key={ot.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => setOtSeleccionadaId(ot.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-slate-800">{ot.numero}</span>
                              <StatusBadge type="criticidad" value={ot.criticidad} />
                            </div>
                            <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 font-medium">{ot.equipo}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{ot.descripcion}</p>
                            <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-50">
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <User className="w-3 h-3" />
                                <span className="truncate max-w-[80px]">{ot.tecnicoAsignado || 'Sin asignar'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span>{ot.hhEstimadas}h</span>
                              </div>
                            </div>
                            {ot.hhReales !== undefined && ot.hhEstimadas > 0 && (
                              <div className="mt-2">
                                <Progress value={(ot.hhReales / ot.hhEstimadas) * 100} className="h-1" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                        {otsEstado.length === 0 && (
                          <div className="text-center py-6 text-xs text-slate-400">Sin OTs en este estado</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tabla"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {[
                        { key: 'numero', label: 'N° OT' },
                        { key: 'equipo', label: 'Equipo' },
                        { key: 'descripcion', label: 'Descripción' },
                        { key: 'estado', label: 'Estado' },
                        { key: 'criticidad', label: 'Criticidad' },
                        { key: 'tecnico', label: 'Técnico' },
                        { key: 'hh', label: 'HH Est.' },
                        { key: 'fecha', label: 'Fecha' },
                        { key: 'acciones', label: '' },
                      ].map(col => (
                        <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tablaOrdenesAgrupadas ? tablaOrdenesAgrupadas.map(([grupo, ordenes]) => (
                      <Fragment key={grupo}>
                        <tr className="bg-slate-100">
                          <td colSpan={9} className="px-4 py-2 text-sm font-semibold text-slate-700">
                            {grupo} <span className="ml-2 text-xs text-slate-500">{ordenes.length} OTs</span>
                          </td>
                        </tr>
                        {ordenes.map(ot => (
                          <motion.tr
                            key={ot.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-4 py-3">
                              <span className="font-semibold text-slate-800">{ot.numero}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-slate-700">{ot.equipo}</p>
                                <p className="text-xs text-slate-400">{ot.faena}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              <p className="text-slate-600 truncate">{ot.descripcion}</p>
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge type="estadoOT" value={ot.estado} />
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge type="criticidad" value={ot.criticidad} />
                            </td>
                            <td className="px-4 py-3 text-slate-600">{ot.tecnicoAsignado || '-'}</td>
                            <td className="px-4 py-3">
                              <div className="text-slate-600">
                                {ot.hhReales !== undefined ? `${ot.hhReales}/${ot.hhEstimadas}` : ot.hhEstimadas}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                              {ot.fechaCreacion.split('T')[0]}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setOtSeleccionadaId(ot.id)} className="p-1 rounded hover:bg-slate-200 transition-colors">
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <button onClick={() => setOtSeleccionadaId(ot.id)} className="p-1 rounded hover:bg-slate-200 transition-colors">
                                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </Fragment>
                    )) : tablaOrdenes.map(ot => (
                      <motion.tr
                        key={ot.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800">{ot.numero}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-700">{ot.equipo}</p>
                            <p className="text-xs text-slate-400">{ot.faena}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-slate-600 truncate">{ot.descripcion}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge type="estadoOT" value={ot.estado} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge type="criticidad" value={ot.criticidad} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">{ot.tecnicoAsignado || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="text-slate-600">
                            {ot.hhReales !== undefined ? `${ot.hhReales}/${ot.hhEstimadas}` : ot.hhEstimadas}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {ot.fechaCreacion.split('T')[0]}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setOtSeleccionadaId(ot.id)} className="p-1 rounded hover:bg-slate-200 transition-colors">
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                            <button onClick={() => setOtSeleccionadaId(ot.id)} className="p-1 rounded hover:bg-slate-200 transition-colors">
                              <Edit className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tablaOrdenes.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">No se encontraron órdenes de trabajo</div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={modalNuevaOT} onOpenChange={setModalNuevaOT}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva OT</DialogTitle>
            <DialogDescription>
              Ingrese los antecedentes necesarios para crear una nueva orden de trabajo.
            </DialogDescription>
          </DialogHeader>

          <form id="form-nueva-ot" onSubmit={crearNuevaOT} className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Los campos marcados con</span>
              <span className="text-red-500">*</span>
              <span>son obligatorios.</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Equipo <span className="text-red-500">*</span></label>
                <Select value={nuevaOT.equipoId} onValueChange={(valor) => actualizarNuevaOT('equipoId', valor)}>
                  <SelectTrigger className={cn('w-full', erroresCampos.equipoId && 'border-red-500 focus:border-red-500 focus:ring-red-500')}>
                    <SelectValue placeholder="Seleccione equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {equiposDisponibles.map(equipo => (
                      <SelectItem key={equipo.id} value={equipo.id}>{equipo.codigo} - {equipo.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Ubicación <span className="text-red-500">*</span></label>
                <Input
                  value={nuevaOT.ubicacion}
                  onChange={e => actualizarNuevaOT('ubicacion', e.target.value)}
                  placeholder="Ej: Taller Norte, Mina Rajo, Planta..."
                  className={cn(erroresCampos.ubicacion && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                  aria-required="true"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Descripción del trabajo <span className="text-red-500">*</span></label>
                <Textarea
                  value={nuevaOT.descripcion}
                  onChange={e => actualizarNuevaOT('descripcion', e.target.value)}
                  placeholder="Describa el problema, alcance o condición detectada"
                  className={cn('min-h-20', erroresCampos.descripcion && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                  aria-required="true"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Trabajos/tareas a realizar <span className="text-red-500">*</span></label>
                <Textarea
                  value={nuevaOT.tareas}
                  onChange={e => actualizarNuevaOT('tareas', e.target.value)}
                  placeholder="Ingrese una tarea por línea"
                  className={cn('min-h-24', erroresCampos.tareas && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                  aria-required="true"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Técnico <span className="text-red-500">*</span></label>
                <Select value={nuevaOT.tecnico} onValueChange={(valor) => actualizarNuevaOT('tecnico', valor)}>
                  <SelectTrigger className={cn('w-full', erroresCampos.tecnico && 'border-red-500 focus:border-red-500 focus:ring-red-500')}>
                    <SelectValue placeholder="Seleccione técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {tecnicos.map(tecnico => (
                      <SelectItem key={tecnico.nombre} value={tecnico.nombre}>{tecnico.nombre} - {tecnico.especialidad}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Cliente <span className="text-red-500">*</span></label>
                <Input
                  value={nuevaOT.cliente}
                  onChange={e => actualizarNuevaOT('cliente', e.target.value)}
                  placeholder="Cliente interno o área solicitante"
                  className={cn(erroresCampos.cliente && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                  aria-required="true"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Prioridad <span className="text-red-500">*</span></label>
                <Select value={nuevaOT.prioridad} onValueChange={(valor) => actualizarNuevaOT('prioridad', valor as Criticidad)}>
                  <SelectTrigger className={cn('w-full', erroresCampos.prioridad && 'border-red-500 focus:border-red-500 focus:ring-red-500')}>
                    <SelectValue placeholder="Seleccione prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(prioridadLabels) as Criticidad[]).map(prioridad => (
                      <SelectItem key={prioridad} value={prioridad}>{prioridadLabels[prioridad]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {errorNuevaOT && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {errorNuevaOT}
              </div>
            )}
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalNuevaOT(false)}>Cancelar</Button>
            <Button type="submit" form="form-nueva-ot" className="bg-red-600 hover:bg-red-700 text-white">Crear OT</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!otSeleccionada} onOpenChange={(open) => !open && setOtSeleccionadaId(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {otSeleccionada && (
            <>
              <DialogHeader>
                <DialogTitle>{otSeleccionada.numero} · {otSeleccionada.equipo}</DialogTitle>
                <DialogDescription>{otSeleccionada.descripcion}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-slate-200/80 lg:col-span-2">
                  <div className="p-4 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge type="estadoOT" value={otSeleccionada.estado} />
                      <StatusBadge type="criticidad" value={otSeleccionada.criticidad} />
                      <span className="text-xs text-slate-500">{otSeleccionada.faena}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] uppercase text-slate-400">Tecnico</p>
                        <p className="font-medium text-slate-700">{otSeleccionada.tecnicoAsignado || 'Sin asignar'}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] uppercase text-slate-400">Planificador</p>
                        <p className="font-medium text-slate-700">{otSeleccionada.planificador}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] uppercase text-slate-400">HH</p>
                        <p className="font-medium text-slate-700">{otSeleccionada.hhReales ?? 0}/{otSeleccionada.hhEstimadas}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] uppercase text-slate-400">Fecha</p>
                        <p className="font-medium text-slate-700">{otSeleccionada.fechaCreacion.split('T')[0]}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-slate-800">Checklist de ejecucion</h3>
                        <span className="text-xs text-slate-500">{progresoChecklist}%</span>
                      </div>
                      <Progress value={progresoChecklist} className="h-2 mb-3" />
                      <div className="space-y-2">
                        {otSeleccionada.checklist.length === 0 && (
                          <div className="text-xs text-slate-400 rounded-lg border border-dashed border-slate-200 p-4 text-center">Sin checklist asociado</div>
                        )}
                        {otSeleccionada.checklist.map(item => (
                          <label key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 text-sm text-slate-700">
                            <Checkbox checked={item.completado} onCheckedChange={() => toggleChecklist(otSeleccionada.id, item.id)} />
                            <span className={cn(item.completado && 'line-through text-slate-400')}>{item.descripcion}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="space-y-4">
                  <Card className="border-slate-200/80 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">Control de estado</h3>
                    <Select value={otSeleccionada.estado} onValueChange={(value) => setOTEstado(otSeleccionada.id, value as EstadoOT)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['abierta', 'en_progreso', 'en_espera', 'completada', 'validada', 'cerrada', 'reprogramada'] as EstadoOT[]).map(estado => (
                          <SelectItem key={estado} value={estado}>{estado.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => setOTEstado(otSeleccionada.id, 'en_progreso')}>Iniciar</Button>
                      <Button variant="outline" onClick={() => setOTEstado(otSeleccionada.id, 'completada')}>Completar</Button>
                      <Button variant="outline" onClick={() => setOTEstado(otSeleccionada.id, 'en_espera')}>En espera</Button>
                      <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => setOTEstado(otSeleccionada.id, 'cerrada')}>Cerrar</Button>
                    </div>
                  </Card>

                  <Card className="border-slate-200/80 p-4">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Repuestos</h3>
                    <div className="space-y-2">
                      {otSeleccionada.repuestos.length === 0 && <p className="text-xs text-slate-400">Sin repuestos solicitados</p>}
                      {otSeleccionada.repuestos.map(rep => (
                        <div key={rep.codigoSAP} className="rounded-lg bg-slate-50 p-2">
                          <p className="text-xs font-semibold text-slate-700">{rep.codigoSAP}</p>
                          <p className="text-xs text-slate-500">{rep.descripcion}</p>
                          <p className="text-[10px] text-slate-400">{rep.cantidadEntregada}/{rep.cantidadSolicitada} · {rep.estado}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              <Card className="border-slate-200/80 p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Bitacora y comentarios</h3>
                <div className="flex gap-2 mb-3">
                  <Input value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Agregar comentario operativo..." />
                  <Button onClick={() => {
                    addOTComment(otSeleccionada.id, comentario);
                    setComentario('');
                  }}>Agregar</Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {otSeleccionada.comentarios.length === 0 && <p className="text-xs text-slate-400">Sin comentarios registrados</p>}
                  {otSeleccionada.comentarios.map(com => (
                    <div key={com.id} className="rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-700">{com.usuario} · {com.rol}</p>
                        <p className="text-[10px] text-slate-400">{com.fecha.split('T')[0]}</p>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{com.texto}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
