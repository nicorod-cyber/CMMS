import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, AlertTriangle, Clock, Gauge, PackageX,
  Inbox, TrendingUp, TrendingDown, Minus,
  FileText, Zap, Activity, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, EstadoOperativoBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { kpis, alertas, actividades, equipos, disponibilidadPorFaena } from '@/data/mockData';
import { useCmms } from '@/context/CmmsContext';
import { cn } from '@/lib/utils';
import { matchesBodegaFaena, matchesFaena } from '@/lib/filters';

const iconMap: Record<string, React.ElementType> = {
  ClipboardList, AlertTriangle, Clock, Gauge, PackageX, Inbox,
};

export function Dashboard() {
  const { ordenes } = useCmms();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('semana');

  const faenaUrl = searchParams.get('faena');
  const otsBase = ordenes.filter(ot => matchesFaena(ot.faena, faenaUrl));
  const alertasBase = alertas.filter(a => matchesFaena(a.faena, faenaUrl) || matchesBodegaFaena(a.faena, faenaUrl));
  const actividadesBase = actividades.filter(a => matchesFaena(a.faena, faenaUrl));
  const equiposBase = equipos.filter(e => matchesFaena(e.faena, faenaUrl));
  const disponibilidadBase = disponibilidadPorFaena.filter(df => matchesFaena(df.faena, faenaUrl));

  const navigateWithFaena = (route: string) => {
    const [pathname, query = ''] = route.split('?');
    const params = new URLSearchParams(query);
    if (faenaUrl) params.set('faena', faenaUrl);
    const search = params.toString();
    navigate(search ? `${pathname}?${search}` : pathname);
  };

  const otsCriticas = otsBase.filter(ot => ot.criticidad === 'critica');
  const otsEnProgreso = otsBase.filter(ot => ot.estado === 'en_progreso');
  const alertasCriticas = alertasBase.filter(a => a.tipo === 'critica' && !a.leida);
  const equiposCriticos = equiposBase.filter(e => e.estadoOperativo === 'detenido');

  const getKpiRoute = (label: string) => {
    if (label === 'OT Abiertas') return '/mantenimiento/ot?filtro=abiertas';
    if (label === 'OT Críticas') return '/mantenimiento/ot?filtro=criticas';
    if (label === 'Backlog (días)') return '/mantenimiento/backlog';
    if (label === 'Disp. Flota') return '/activos/maestro';
    if (label === 'Stock Crítico') return '/bodega/criticos';
    if (label === 'SM Pendientes') return '/mantenimiento/sm?filtro=pendientes';
    return '/';
  };

  const goToKpi = (label: string) => {
    navigateWithFaena(getKpiRoute(label));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Operacional</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visión general del estado de mantenimiento y operaciones</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
          {(['hoy', 'semana', 'mes'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                periodo === p ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {p === 'hoy' ? 'Hoy' : p === 'semana' ? 'Esta Semana' : 'Este Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = iconMap[kpi.icono] || ClipboardList;
          const TrendIcon = kpi.tendenciaTipo === 'up' ? TrendingUp : kpi.tendenciaTipo === 'down' ? TrendingDown : Minus;
          const trendColor = kpi.tendenciaTipo === 'up'
            ? (kpi.label.includes('Crític') || kpi.label.includes('Stock') ? 'text-red-500' : 'text-emerald-500')
            : kpi.tendenciaTipo === 'down'
            ? (kpi.label.includes('Crític') || kpi.label.includes('Stock') ? 'text-emerald-500' : 'text-red-500')
            : 'text-slate-400';

          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
            >
              <Card className="border-slate-200/80 hover:shadow-md transition-shadow cursor-default group overflow-hidden" onClick={() => goToKpi(kpi.label)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToKpi(kpi.label); }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className={cn('p-2 rounded-lg', `bg-opacity-10`)} style={{ backgroundColor: `${kpi.color}18` }}>
                      <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                    </div>
                    <div className={cn('flex items-center gap-0.5 text-xs font-medium', trendColor)}>
                      <TrendIcon className="w-3 h-3" />
                      {Math.abs(kpi.tendencia || 0)}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.valor}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column - OTs Críticas & En Progreso */}
        <div className="xl:col-span-5 space-y-6">
          {/* OTs Críticas */}
          <Card className="border-slate-200/80 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-r from-red-50/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-800">OTs Críticas Pendientes</CardTitle>
                </div>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{otsCriticas.length}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {otsCriticas.map(ot => (
                  <div key={ot.id} onClick={() => navigateWithFaena(`/mantenimiento/ot?filtro=criticas&search=${ot.numero}&vista=tabla`)} className="px-4 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800">{ot.numero}</span>
                          <StatusBadge type="criticidad" value={ot.criticidad} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">{ot.equipo}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ot.descripcion}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge type="estadoOT" value={ot.estado} />
                        {ot.tecnicoAsignado && (
                          <p className="text-[10px] text-slate-400 mt-1">{ot.tecnicoAsignado}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipos Detenidos */}
          <Card className="border-slate-200/80 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 rounded-md">
                    <Zap className="w-4 h-4 text-red-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-800">Equipos Detenidos</CardTitle>
                </div>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{equiposCriticos.length}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {equiposCriticos.map(eq => (
                  <div key={eq.id} onClick={() => navigateWithFaena(`/activos/maestro?estado=detenido&search=${eq.codigo}`)} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{eq.nombre}</p>
                        <p className="text-xs text-slate-500">{eq.codigo} · {eq.faena}</p>
                      </div>
                      <EstadoOperativoBadge estado={eq.estadoOperativo} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - OTs en Progreso & Alertas */}
        <div className="xl:col-span-4 space-y-6">
          {/* OTs en Progreso */}
          <Card className="border-slate-200/80 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-md">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-800">OTs en Ejecución</CardTitle>
                </div>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{otsEnProgreso.length}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {otsEnProgreso.map(ot => (
                  <div key={ot.id} onClick={() => navigateWithFaena(`/mantenimiento/ot?filtro=progreso&search=${ot.numero}&vista=tabla`)} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800">{ot.numero}</span>
                          <StatusBadge type="criticidad" value={ot.criticidad} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{ot.equipo}</p>
                        {ot.hhEstimadas > 0 && ot.hhReales !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>Progreso HH</span>
                              <span>{ot.hhReales}/{ot.hhEstimadas} hrs</span>
                            </div>
                            <Progress value={(ot.hhReales / ot.hhEstimadas) * 100} className="h-1.5" />
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-slate-600">{ot.tecnicoAsignado}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{ot.faena}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card className="border-slate-200/80 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 rounded-md">
                    <Bell className="w-4 h-4 text-amber-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-slate-800">Alertas Activas</CardTitle>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{alertasCriticas.length}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {alertasBase.slice(0, 5).map(alerta => (
                  <div key={alerta.id} onClick={() => navigateWithFaena(alerta.titulo.includes('Stock') ? '/bodega/criticos' : alerta.titulo.includes('Equipo') ? '/activos/maestro?estado=detenido' : '/mantenimiento/ot?filtro=criticas')} className="px-4 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {alerta.tipo === 'critica' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {alerta.tipo === 'advertencia' && <Clock className="w-4 h-4 text-amber-500" />}
                        {alerta.tipo === 'info' && <FileText className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800">{alerta.titulo}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{alerta.mensaje}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{alerta.faena}</p>
                      </div>
                      {!alerta.leida && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actividad & Disponibilidad */}
        <div className="xl:col-span-3 space-y-6">
          {/* Actividad Reciente */}
          <Card className="border-slate-200/80 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-md">
                  <Activity className="w-4 h-4 text-slate-600" />
                </div>
                <CardTitle className="text-sm font-semibold text-slate-800">Actividad Reciente</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative pl-4 border-l-2 border-slate-200 space-y-4">
                {actividadesBase.map(act => (
                  <div key={act.id} className="relative">
                    <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-slate-300" />
                    <p className="text-xs font-medium text-slate-700">{act.descripcion}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{act.usuario} · {act.faena}</p>
                    {act.detalle && <p className="text-[10px] text-slate-500 mt-0.5 italic">{act.detalle}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disponibilidad por Faena */}
          <Card className="border-slate-200/80 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-md">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                </div>
                <CardTitle className="text-sm font-semibold text-slate-800">Disp. por Faena</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {disponibilidadBase.map(df => {
                const pct = df.disponibilidad;
                const color = pct >= 92 ? 'bg-emerald-500' : pct >= 87 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={df.faena}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-700">{df.faena}</span>
                      <span className={cn('text-xs font-bold', pct >= 92 ? 'text-emerald-600' : pct >= 87 ? 'text-amber-600' : 'text-red-600')}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Objetivo: {df.objetivo}%</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
