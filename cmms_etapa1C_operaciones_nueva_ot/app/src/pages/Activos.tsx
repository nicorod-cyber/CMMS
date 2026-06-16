import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Truck, BarChart3, FileText,
  ChevronRight, Activity, History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { StatusBadge, EstadoOperativoBadge } from '@/components/StatusBadge';
import { equipos } from '@/data/mockData';
import { useCmms } from '@/context/CmmsContext';
import { cn } from '@/lib/utils';
import { matchesFaena } from '@/lib/filters';

type VistaActivos = 'grid' | 'lista' | 'ficha';

export function Activos() {
  const { ordenes } = useCmms();
  const [searchParams] = useSearchParams();
  const [vista, setVista] = useState<VistaActivos>('grid');
  const [search, setSearch] = useState('');
  const [equipoSel, setEquipoSel] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  useEffect(() => {
    const estadoUrl = searchParams.get('estado');
    const searchUrl = searchParams.get('search');

    if (estadoUrl && ['todos', 'disponible', 'operando', 'en_mantenimiento', 'detenido'].includes(estadoUrl)) {
      setFiltroEstado(estadoUrl);
    }

    setSearch(searchUrl ?? '');
  }, [searchParams]);

  const faenaUrl = searchParams.get('faena');
  const equipoUrl = searchParams.get('equipo');
  const baseEquipos = equipos.filter(eq => matchesFaena(eq.faena, faenaUrl));

  const filtered = baseEquipos.filter(eq => {
    if (equipoUrl && eq.id !== equipoUrl && eq.codigo !== equipoUrl) return false;
    if (search && !eq.nombre.toLowerCase().includes(search.toLowerCase()) &&
        !eq.codigo.toLowerCase().includes(search.toLowerCase()) &&
        !eq.marca.toLowerCase().includes(search.toLowerCase()) &&
        !eq.modelo.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroEstado !== 'todos' && eq.estadoOperativo !== filtroEstado) return false;
    return true;
  });

  const selected = baseEquipos.find(e => e.id === equipoSel) ?? equipos.find(e => e.id === equipoSel);
  const historialSel = selected
    ? ordenes.filter(ot => ot.equipoId === selected.id).sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    : [];

  if (vista === 'ficha' && selected) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setVista('grid')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Volver
          </button>
        </div>

        {/* Ficha 360 Header */}
        <Card className="border-slate-200/80 overflow-hidden bg-gradient-to-r from-slate-50 to-white">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shrink-0">
                <Truck className="w-12 h-12 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{selected.nombre}</h1>
                  <EstadoOperativoBadge estado={selected.estadoOperativo} />
                  <StatusBadge type="criticidad" value={selected.criticidad} />
                </div>
                <p className="text-sm text-slate-500 mt-1">{selected.codigo} · {selected.marca} {selected.modelo}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  <span className="text-slate-600"><span className="text-slate-400">Faena:</span> {selected.faena}</span>
                  <span className="text-slate-600"><span className="text-slate-400">Planta:</span> {selected.planta}</span>
                  <span className="text-slate-600"><span className="text-slate-400">Sistema:</span> {selected.sistema}</span>
                  <span className="text-slate-600"><span className="text-slate-400">Subsistema:</span> {selected.subsistema}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900">{selected.disponibilidad}%</p>
                  <p className="text-xs text-slate-500">Disponibilidad</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-700">{selected.horometro.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Horómetro (hrs)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jerarquía Técnica */}
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" /> Jerarquía Técnica
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {[
                  { label: 'Faena', value: selected.faena, nivel: 0 },
                  { label: 'Planta', value: selected.planta, nivel: 1 },
                  { label: 'Equipo', value: selected.nombre, nivel: 2 },
                  { label: 'Sistema', value: selected.sistema, nivel: 3 },
                  { label: 'Subsistema', value: selected.subsistema, nivel: 4 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ paddingLeft: `${item.nivel * 16}px` }}>
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">{item.label}</p>
                      <p className="text-xs font-medium text-slate-700">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Indicadores */}
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" /> Indicadores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Disponibilidad</span>
                  <span className="font-bold text-slate-800">{selected.disponibilidad}%</span>
                </div>
                <Progress value={selected.disponibilidad} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Confiabilidad MTBF</span>
                  <span className="font-bold text-slate-800">420 hrs</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Tiempo Medio Reparación</span>
                  <span className="font-bold text-slate-800">8.5 hrs</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-slate-800">{historialSel.length}</p>
                  <p className="text-[10px] text-slate-500">OTs totales</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-emerald-600">{historialSel.filter(h => h.estado === 'cerrada').length}</p>
                  <p className="text-[10px] text-slate-500">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card className="border-slate-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Documentos Asociados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {['Manual de Operación', 'Ficha Técnica', 'Diagrama Eléctrico', 'Historial de Garantía', 'Certificado ISO'].map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{doc}</p>
                      <p className="text-[10px] text-slate-400">PDF · SharePoint</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historial de OTs */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" /> Historial de Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">N° OT</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Descripción</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Técnico</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">HH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historialSel.map(ot => (
                    <tr key={ot.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{ot.numero}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          ot.tipo === 'correctivo' && 'bg-red-50 text-red-700',
                          ot.tipo === 'preventivo' && 'bg-emerald-50 text-emerald-700',
                          ot.tipo === 'predictivo' && 'bg-blue-50 text-blue-700',
                          ot.tipo === 'mejora' && 'bg-purple-50 text-purple-700',
                        )}>
                          {ot.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{ot.descripcion}</td>
                      <td className="px-4 py-3"><StatusBadge type="estadoOT" value={ot.estado} /></td>
                      <td className="px-4 py-3 text-slate-600">{ot.tecnicoAsignado || '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{ot.fechaCreacion.split('T')[0]}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{ot.hhReales ?? '-'}/{ot.hhEstimadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maestro de Activos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Inventario completo de equipos y activos por faena</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {([
            { key: 'todos', label: 'Todos' },
            { key: 'disponible', label: 'Disponibles' },
            { key: 'operando', label: 'Operando' },
            { key: 'en_mantenimiento', label: 'En Mant.' },
            { key: 'detenido', label: 'Detenidos' },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFiltroEstado(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                filtroEstado === f.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar equipo por código o nombre..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-72" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((eq, idx) => (
          <motion.div
            key={eq.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => { setEquipoSel(eq.id); setVista('ficha'); }}
          >
            <Card className="border-slate-200/80 hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 group-hover:from-cyan-50 group-hover:to-cyan-100 transition-colors">
                    <Truck className="w-7 h-7 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{eq.codigo}</span>
                      <EstadoOperativoBadge estado={eq.estadoOperativo} />
                    </div>
                    <p className="text-sm font-medium text-slate-700 mt-0.5 truncate">{eq.nombre}</p>
                    <p className="text-xs text-slate-500">{eq.marca} {eq.modelo} · {eq.faena}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge type="criticidad" value={eq.criticidad} />
                      <span className="text-xs text-slate-400">{eq.horometro.toLocaleString()} hrs</span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-500">Disponibilidad</span>
                        <span className={cn('font-bold', eq.disponibilidad >= 92 ? 'text-emerald-600' : eq.disponibilidad >= 80 ? 'text-amber-600' : 'text-red-600')}>
                          {eq.disponibilidad}%
                        </span>
                      </div>
                      <Progress value={eq.disponibilidad} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
