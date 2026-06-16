import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Package, AlertTriangle, QrCode,
  ClipboardList, Warehouse
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { ordenesTrabajo } from '@/data/mockData';
import { useCmms } from '@/context/CmmsContext';
import { cn } from '@/lib/utils';
import { matchesBodegaFaena, matchesFaena } from '@/lib/filters';

type VistaBodega = 'stock' | 'solicitudes' | 'criticos';

export function Bodega() {
  const { repuestos, solicitudesRepuesto, createSR, setSREstado, moveStock } = useCmms();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [vista, setVista] = useState<VistaBodega>('stock');
  const [search, setSearch] = useState('');
  const [bodegaFilter, setBodegaFilter] = useState('todas');
  const [modalSR, setModalSR] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState<string | null>(null);
  const [srForm, setSrForm] = useState({ otId: '', codigoSAP: '', cantidad: 1 });
  const [movimientoCantidad, setMovimientoCantidad] = useState(1);

  useEffect(() => {
    const vistaUrl = searchParams.get('vista') as VistaBodega | null;
    const searchUrl = searchParams.get('search');

    if (vistaUrl && ['stock', 'solicitudes', 'criticos'].includes(vistaUrl)) {
      setVista(vistaUrl);
    } else if (location.pathname.includes('/solicitudes')) {
      setVista('solicitudes');
    } else if (location.pathname.includes('/criticos')) {
      setVista('criticos');
    } else if (location.pathname.includes('/stock')) {
      setVista('stock');
    }

    setSearch(searchUrl ?? '');
  }, [location.pathname, searchParams]);

  const faenaUrl = searchParams.get('faena');
  const repuestoUrl = searchParams.get('repuesto');
  const srUrl = searchParams.get('sr');
  const baseRepuestos = repuestos.filter(r => matchesBodegaFaena(r.bodega, faenaUrl));
  const baseSolicitudesRepuesto = solicitudesRepuesto.filter(sr => matchesFaena(sr.faena, faenaUrl));

  const repuestosFiltered = baseRepuestos.filter(r => {
    if (repuestoUrl && r.codigoSAP !== repuestoUrl) return false;
    if (search && !r.codigoSAP.toLowerCase().includes(search.toLowerCase()) &&
        !r.descripcion.toLowerCase().includes(search.toLowerCase()) &&
        !r.bodega.toLowerCase().includes(search.toLowerCase())) return false;
    if (bodegaFilter !== 'todas' && r.bodega !== bodegaFilter) return false;
    return true;
  });

  const criticos = baseRepuestos.filter(r => r.estado !== 'disponible');
  const criticosFiltered = repuestosFiltered.filter(r => r.estado !== 'disponible');
  const srFiltered = baseSolicitudesRepuesto.filter(sr => {
    if (srUrl && sr.id !== srUrl && sr.numero !== srUrl) return false;
    if (search && !sr.numero.toLowerCase().includes(search.toLowerCase()) &&
        !sr.otId.toLowerCase().includes(search.toLowerCase()) &&
        !sr.solicitante.toLowerCase().includes(search.toLowerCase()) &&
        !sr.items.some(item => item.codigoSAP.toLowerCase().includes(search.toLowerCase()) || item.descripcion.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const crearSR = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ot = ordenesTrabajo.find(item => item.numero === srForm.otId || item.id === srForm.otId);
    if (!ot || !srForm.codigoSAP || srForm.cantidad <= 0) return;

    createSR({
      otId: ot.numero,
      solicitante: ot.tecnicoAsignado || 'Planificacion',
      faena: ot.faena,
      items: [{ codigoSAP: srForm.codigoSAP, cantidad: srForm.cantidad }],
    });
    setSrForm({ otId: '', codigoSAP: '', cantidad: 1 });
    setModalSR(false);
    setVista('solicitudes');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Bodega</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control de stock, solicitudes y materiales críticos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            setSearch('SAP-44567');
            setVista('stock');
          }}>
            <QrCode className="w-4 h-4" /> Escanear QR
          </Button>
          <Button onClick={() => setModalSR(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
            <Package className="w-4 h-4" /> Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { key: 'stock' as const, label: 'Stock por Bodega', count: baseRepuestos.length, icon: Warehouse },
          { key: 'solicitudes' as const, label: 'Solicitudes SR', count: baseSolicitudesRepuesto.length, icon: ClipboardList },
          { key: 'criticos' as const, label: 'Materiales Críticos', count: criticos.length, icon: AlertTriangle },
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
            <span className={cn('text-xs ml-1', vista === tab.key ? 'text-slate-400' : 'text-slate-400')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar por código SAP o descripción..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {vista === 'stock' && (
          <select
            value={bodegaFilter}
            onChange={e => setBodegaFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600"
          >
            <option value="todas">Todas las bodegas</option>
            <option value="Bodega Principal Norte">Bodega Principal Norte</option>
            <option value="Bodega Principal Sur">Bodega Principal Sur</option>
            <option value="Bodega Este">Bodega Este</option>
          </select>
        )}
      </div>

      {vista === 'stock' && (
        <Card className="border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Código SAP</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">U.M.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Mínimo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Bodega</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ubicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repuestosFiltered.map((r, idx) => (
                  <motion.tr
                    key={r.codigoSAP}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">{r.codigoSAP}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{r.descripcion}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.unidadMedida}</td>
                    <td className="px-4 py-3">
                      <span className={cn('font-semibold', r.stockActual === 0 ? 'text-red-600' : r.stockActual <= r.stockMinimo ? 'text-amber-600' : 'text-emerald-600')}>
                        {r.stockActual}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.stockMinimo}</td>
                    <td className="px-4 py-3"><StatusBadge type="estadoRepuesto" value={r.estado} /></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.bodega}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{r.ubicacion}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => setModalMovimiento(r.codigoSAP)}>Mover</Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {vista === 'solicitudes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {srFiltered.map((sr, idx) => (
            <motion.div
              key={sr.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card className="border-slate-200/80 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-bold text-slate-800">{sr.numero}</span>
                      <p className="text-xs text-slate-500 mt-0.5">OT: {sr.otId}</p>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      sr.estado === 'entregada' && 'bg-emerald-50 text-emerald-700',
                      sr.estado === 'pendiente' && 'bg-amber-50 text-amber-700',
                      sr.estado === 'aprobada' && 'bg-blue-50 text-blue-700',
                      sr.estado === 'en_preparacion' && 'bg-purple-50 text-purple-700',
                      sr.estado === 'despachada' && 'bg-cyan-50 text-cyan-700',
                      sr.estado === 'rechazada' && 'bg-red-50 text-red-700',
                    )}>
                      {sr.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {sr.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-700">{item.codigoSAP}</p>
                          <p className="text-xs text-slate-500 truncate">{item.descripcion}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-700 shrink-0 ml-2">{item.cantidad} {item.unidadMedida}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>Solicitante: <span className="font-medium text-slate-700">{sr.solicitante}</span></span>
                    <span>{sr.fechaSolicitud.split('T')[0]}</span>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    {sr.estado === 'pendiente' && <Button size="sm" variant="outline" onClick={() => setSREstado(sr.id, 'aprobada')}>Aprobar</Button>}
                    {sr.estado === 'aprobada' && <Button size="sm" variant="outline" onClick={() => setSREstado(sr.id, 'en_preparacion')}>Preparar</Button>}
                    {sr.estado === 'en_preparacion' && (
                      <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => {
                        sr.items.forEach(item => moveStock(item.codigoSAP, item.cantidad, 'salida', sr.numero));
                        setSREstado(sr.id, 'entregada');
                      }}>Entregar</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {vista === 'criticos' && (
        <div className="space-y-4">
          {criticosFiltered.map((r, idx) => (
            <motion.div
              key={r.codigoSAP}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={cn(
                'border overflow-hidden',
                r.estado === 'sin_stock' ? 'border-red-300 bg-red-50/30' : 'border-amber-300 bg-amber-50/30'
              )}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={cn('p-2 rounded-lg', r.estado === 'sin_stock' ? 'bg-red-100' : 'bg-amber-100')}>
                        <AlertTriangle className={cn('w-5 h-5', r.estado === 'sin_stock' ? 'text-red-600' : 'text-amber-600')} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{r.codigoSAP}</p>
                        <p className="text-sm text-slate-700">{r.descripcion}</p>
                        <p className="text-xs text-slate-500">{r.bodega} · {r.ubicacion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <p className={cn('text-2xl font-bold', r.estado === 'sin_stock' ? 'text-red-600' : 'text-amber-600')}>
                          {r.stockActual}
                        </p>
                        <p className="text-[10px] text-slate-500">Stock actual</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-700">{r.stockMinimo}</p>
                        <p className="text-[10px] text-slate-500">Mínimo</p>
                      </div>
                      <StatusBadge type="estadoRepuesto" value={r.estado} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Nivel de stock</span>
                      <span>{r.stockMinimo > 0 ? Math.round((r.stockActual / r.stockMinimo) * 100) : 0}%</span>
                    </div>
                    <Progress
                      value={r.stockMinimo > 0 ? (r.stockActual / r.stockMinimo) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={modalSR} onOpenChange={setModalSR}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva solicitud de repuestos</DialogTitle>
            <DialogDescription>Reserve materiales para una OT activa.</DialogDescription>
          </DialogHeader>
          <form id="form-sr" onSubmit={crearSR} className="space-y-4">
            <Select value={srForm.otId} onValueChange={(otId) => setSrForm(prev => ({ ...prev, otId }))}>
              <SelectTrigger><SelectValue placeholder="Orden de trabajo" /></SelectTrigger>
              <SelectContent>
                {ordenesTrabajo.map(ot => <SelectItem key={ot.id} value={ot.numero}>{ot.numero} - {ot.equipo}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={srForm.codigoSAP} onValueChange={(codigoSAP) => setSrForm(prev => ({ ...prev, codigoSAP }))}>
              <SelectTrigger><SelectValue placeholder="Repuesto" /></SelectTrigger>
              <SelectContent>
                {repuestos.map(rep => <SelectItem key={rep.codigoSAP} value={rep.codigoSAP}>{rep.codigoSAP} - {rep.descripcion}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" min={1} value={srForm.cantidad} onChange={e => setSrForm(prev => ({ ...prev, cantidad: Number(e.target.value) }))} />
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalSR(false)}>Cancelar</Button>
            <Button type="submit" form="form-sr" className="bg-red-600 hover:bg-red-700 text-white">Crear SR</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!modalMovimiento} onOpenChange={(open) => !open && setModalMovimiento(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimiento de stock</DialogTitle>
            <DialogDescription>Registre entrada o salida manual con trazabilidad en kardex.</DialogDescription>
          </DialogHeader>
          <Input type="number" min={1} value={movimientoCantidad} onChange={e => setMovimientoCantidad(Number(e.target.value))} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMovimiento(null)}>Cancelar</Button>
            <Button variant="outline" onClick={() => {
              if (modalMovimiento) moveStock(modalMovimiento, movimientoCantidad, 'ajuste', 'Ajuste manual');
              setModalMovimiento(null);
            }}>Salida</Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => {
              if (modalMovimiento) moveStock(modalMovimiento, movimientoCantidad, 'entrada', 'Recepcion manual');
              setModalMovimiento(null);
            }}>Entrada</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
