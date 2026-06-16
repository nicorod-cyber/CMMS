import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, ArrowRight, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { equipos } from '@/data/mockData';
import { useCmms } from '@/context/CmmsContext';
import { cn } from '@/lib/utils';
import { matchesFaena } from '@/lib/filters';
import type { Criticidad } from '@/types';

type FiltroSM = 'todas' | 'pendientes' | 'nuevas' | 'revision' | 'aprobadas';

export function MantenimientoSM() {
  const { solicitudes, createSM, setSMEstado, convertirSMaOT } = useCmms();
  const [searchParams] = useSearchParams();
  const [filtro, setFiltro] = useState<FiltroSM>('todas');
  const [search, setSearch] = useState('');
  const [modalNueva, setModalNueva] = useState(false);
  const [form, setForm] = useState({ equipoId: '', solicitante: '', tipoFalla: '', descripcion: '', criticidad: 'media' as Criticidad });

  useEffect(() => {
    const filtroUrl = searchParams.get('filtro') as FiltroSM | null;
    const searchUrl = searchParams.get('search');

    if (filtroUrl && ['todas', 'pendientes', 'nuevas', 'revision', 'aprobadas'].includes(filtroUrl)) {
      setFiltro(filtroUrl);
    }

    setSearch(searchUrl ?? '');
  }, [searchParams]);

  const faenaUrl = searchParams.get('faena');
  const smUrl = searchParams.get('sm');
  const baseSolicitudes = solicitudes.filter(sm => matchesFaena(sm.faena, faenaUrl));
  const equiposDisponibles = equipos.filter(equipo => matchesFaena(equipo.faena, faenaUrl));

  const crearSM = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.equipoId || !form.solicitante.trim() || !form.tipoFalla.trim() || !form.descripcion.trim()) return;
    createSM(form);
    setForm({ equipoId: '', solicitante: '', tipoFalla: '', descripcion: '', criticidad: 'media' });
    setModalNueva(false);
    setFiltro('nuevas');
  };

  const filtered = baseSolicitudes.filter(sm => {
    if (smUrl && sm.id !== smUrl && sm.numero !== smUrl) return false;
    if (search && !sm.numero.toLowerCase().includes(search.toLowerCase()) &&
        !sm.equipo.toLowerCase().includes(search.toLowerCase()) &&
        !sm.tipoFalla.toLowerCase().includes(search.toLowerCase()) &&
        !sm.descripcion.toLowerCase().includes(search.toLowerCase()) &&
        !sm.solicitante.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtro === 'pendientes') return sm.estado === 'nueva' || sm.estado === 'en_revision';
    if (filtro === 'nuevas') return sm.estado === 'nueva';
    if (filtro === 'revision') return sm.estado === 'en_revision';
    if (filtro === 'aprobadas') return sm.estado === 'aprobada';
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Solicitudes de Mantenimiento</h1>
          <p className="text-sm text-slate-500 mt-0.5">SM creadas desde terreno pendientes de revisión y aprobación</p>
        </div>
        <Button onClick={() => setModalNueva(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Nueva SM
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {([
            { key: 'todas', label: 'Todas', count: baseSolicitudes.length },
            { key: 'nuevas', label: 'Nuevas', count: baseSolicitudes.filter(s => s.estado === 'nueva').length },
            { key: 'revision', label: 'En Revisión', count: baseSolicitudes.filter(s => s.estado === 'en_revision').length },
            { key: 'aprobadas', label: 'Aprobadas', count: baseSolicitudes.filter(s => s.estado === 'aprobada').length },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                filtro === f.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              {f.label} <span className={cn('ml-1 text-xs', filtro === f.key ? 'text-slate-300' : 'text-slate-400')}>{f.count}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar SM, equipo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((sm, idx) => (
          <motion.div
            key={sm.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <Card className="border-slate-200/80 hover:shadow-md transition-all cursor-pointer group overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{sm.numero}</span>
                      <StatusBadge type="estadoSM" value={sm.estado} />
                      <StatusBadge type="criticidad" value={sm.criticidad} />
                    </div>
                    <p className="text-sm font-medium text-slate-700 mt-1.5">{sm.equipo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sm.faena}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-600"><span className="font-medium">Falla:</span> {sm.tipoFalla}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{sm.descripcion}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span>Solicitante: <span className="font-medium text-slate-600">{sm.solicitante}</span></span>
                      <span>Fecha: <span className="font-medium text-slate-600">{sm.fechaSolicitud.split('T')[0]}</span></span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {sm.fotos && sm.fotos.length > 0 && (
                      <div className="p-1.5 bg-slate-100 rounded-lg">
                        <Camera className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                    {sm.otGenerada && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        <ArrowRight className="w-3 h-3" />
                        {sm.otGenerada}
                      </div>
                    )}
                    {!sm.otGenerada && (
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {sm.estado === 'nueva' && (
                          <Button size="sm" variant="outline" onClick={() => setSMEstado(sm.id, 'en_revision')}>Revisar</Button>
                        )}
                        {sm.estado === 'en_revision' && (
                          <Button size="sm" variant="outline" onClick={() => setSMEstado(sm.id, 'aprobada')}>Aprobar</Button>
                        )}
                        {sm.estado === 'aprobada' && (
                          <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => convertirSMaOT(sm.id)}>Generar OT</Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={modalNueva} onOpenChange={setModalNueva}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva SM</DialogTitle>
            <DialogDescription>Registre una solicitud de mantenimiento desde terreno.</DialogDescription>
          </DialogHeader>
          <form id="form-sm" onSubmit={crearSM} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select value={form.equipoId} onValueChange={(equipoId) => setForm(prev => ({ ...prev, equipoId }))}>
                <SelectTrigger><SelectValue placeholder="Equipo" /></SelectTrigger>
                <SelectContent>
                  {equiposDisponibles.map(equipo => <SelectItem key={equipo.id} value={equipo.id}>{equipo.codigo} - {equipo.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input value={form.solicitante} onChange={e => setForm(prev => ({ ...prev, solicitante: e.target.value }))} placeholder="Solicitante" />
              <Input value={form.tipoFalla} onChange={e => setForm(prev => ({ ...prev, tipoFalla: e.target.value }))} placeholder="Tipo de falla" />
              <Select value={form.criticidad} onValueChange={(criticidad) => setForm(prev => ({ ...prev, criticidad: criticidad as Criticidad }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Critica</SelectItem>
                </SelectContent>
              </Select>
              <Textarea className="sm:col-span-2" value={form.descripcion} onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))} placeholder="Descripcion del hallazgo" />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNueva(false)}>Cancelar</Button>
            <Button type="submit" form="form-sm" className="bg-red-600 hover:bg-red-700 text-white">Crear SM</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
