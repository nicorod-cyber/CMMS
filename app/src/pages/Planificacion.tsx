import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, User,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { planificacionSemanal, tecnicos } from '@/data/mockData';
import { useCmms } from '@/context/CmmsContext';
import { cn } from '@/lib/utils';
import { matchesFaena } from '@/lib/filters';

type VistaPlan = 'semanal' | 'mensual' | 'asignacion';

export function Planificacion() {
  const { ordenes } = useCmms();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [vista, setVista] = useState<VistaPlan>('semanal');

  useEffect(() => {
    const vistaUrl = searchParams.get('vista') as VistaPlan | null;

    if (vistaUrl && ['semanal', 'mensual', 'asignacion'].includes(vistaUrl)) {
      setVista(vistaUrl);
    } else if (location.pathname.includes('/mensual')) {
      setVista('mensual');
    } else if (location.pathname.includes('/asignacion')) {
      setVista('asignacion');
    } else if (location.pathname.includes('/semanal')) {
      setVista('semanal');
    }
  }, [location.pathname, searchParams]);

  const faenaUrl = searchParams.get('faena');
  const ordenesFiltradas = ordenes.filter(ot => matchesFaena(ot.faena, faenaUrl));
  const tecnicosFiltrados = tecnicos.filter(t => matchesFaena(t.faena, faenaUrl));

  const otsPorDia = (dia: string) => {
    const planDia = planificacionSemanal.find(p => p.fecha === dia);
    if (!planDia) return [];
    return ordenesFiltradas.filter(ot => planDia.ots.includes(ot.numero));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Planificación de Mantenimiento</h1>
          <p className="text-sm text-slate-500 mt-0.5">Programación semanal, mensual y asignación de recursos</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([
          { key: 'semanal' as const, label: 'Vista Semanal', icon: CalendarDays },
          { key: 'mensual' as const, label: 'Vista Mensual', icon: CalendarDays },
          { key: 'asignacion' as const, label: 'Asignación de Técnicos', icon: User },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setVista(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border',
              vista === tab.key ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {vista === 'semanal' && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Semana del 10 al 16 de junio, 2024</h2>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
              <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              <span className="px-3 text-sm text-slate-600 font-medium">Esta semana</span>
              <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'OTs Planificadas', value: 6, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'HH Programadas', value: '86 hrs', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Técnicos Asignados', value: 4, icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Cumplimiento', value: '78%', icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            ].map((stat, i) => (
              <Card key={i} className="border-slate-200/80">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn('p-2.5 rounded-lg', stat.bg)}>
                    <stat.icon className={cn('w-5 h-5', stat.color)} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
            {planificacionSemanal.map((dia, idx) => {
              const ots = otsPorDia(dia.fecha);
              const isWeekend = dia.dia === 'Sábado' || dia.dia === 'Domingo';
              return (
                <motion.div
                  key={dia.fecha}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'rounded-xl border overflow-hidden',
                    isWeekend ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200/80 bg-white'
                  )}
                >
                  <div className={cn(
                    'px-3 py-2.5 border-b text-center',
                    isWeekend ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-100'
                  )}>
                    <p className={cn('text-xs font-semibold', isWeekend ? 'text-slate-400' : 'text-slate-600')}>{dia.dia}</p>
                    <p className={cn('text-sm font-bold', isWeekend ? 'text-slate-400' : 'text-slate-800')}>
                      {dia.fecha.split('-')[2]}
                    </p>
                  </div>
                  <div className="p-2 space-y-2 min-h-[120px]">
                    {ots.map(ot => (
                      <div
                        key={ot.id}
                        className={cn(
                          'p-2 rounded-lg border text-xs cursor-pointer hover:shadow-sm transition-all',
                          ot.criticidad === 'critica' ? 'bg-red-50 border-red-200' :
                          ot.criticidad === 'alta' ? 'bg-amber-50 border-amber-200' :
                          'bg-slate-50 border-slate-200'
                        )}
                      >
                        <p className="font-bold text-slate-800">{ot.numero}</p>
                        <p className="text-slate-600 mt-0.5 truncate">{ot.equipo.split(' ').slice(0, 3).join(' ')}</p>
                        <div className="flex items-center gap-1 mt-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{ot.hhEstimadas}h</span>
                        </div>
                        {ot.tecnicoAsignado && (
                          <div className="flex items-center gap-1 mt-1 text-slate-400">
                            <User className="w-3 h-3" />
                            <span className="truncate">{ot.tecnicoAsignado}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {ots.length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-300">Sin actividad</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {vista === 'asignacion' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Capacidad Total', value: '240 hrs/semana', color: 'text-slate-700' },
              { label: 'Carga Programada', value: '175 hrs', color: 'text-blue-600' },
              { label: 'Utilización', value: '73%', color: 'text-emerald-600' },
            ].map((s, i) => (
              <Card key={i} className="border-slate-200/80">
                <CardContent className="p-4 text-center">
                  <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            {tecnicosFiltrados.map((tec, idx) => {
              const pct = (tec.cargaSemanal / tec.capacidad) * 100;
              const color = pct > 90 ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <motion.div
                  key={tec.nombre}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="border-slate-200/80">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {tec.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{tec.nombre}</p>
                            <p className="text-xs text-slate-500">{tec.especialidad} · {tec.faena}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-center">
                            <p className="text-lg font-bold text-slate-800">{tec.cargaSemanal}h</p>
                            <p className="text-[10px] text-slate-500">Carga semanal</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-slate-500">{tec.capacidad}h</p>
                            <p className="text-[10px] text-slate-500">Capacidad</p>
                          </div>
                          <div className="w-32">
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-slate-500">Ocupación</span>
                              <span className={cn('font-bold', pct > 90 ? 'text-red-600' : pct > 75 ? 'text-amber-600' : 'text-emerald-600')}>
                                {Math.round(pct)}%
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(100, pct)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {vista === 'mensual' && (
        <Card className="border-slate-200/80 p-8">
          <div className="text-center text-slate-400">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Vista mensual en desarrollo</p>
            <p className="text-xs mt-1">Se mostrará el calendario mensual con todas las OTs planificadas</p>
          </div>
        </Card>
      )}
    </div>
  );
}
