import { useMemo, useState } from 'react';
import { CheckCircle, ClipboardList, Download, FileText, MessageCircle, Package, Plus, UploadCloud, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { useCmms } from '@/context/CmmsContext';
import { cn } from '@/lib/utils';
import type { OrdenTrabajo, RepuestoSR } from '@/types';

const evidenciaTipos = [
  { value: 'foto', label: 'Foto' },
  { value: 'documento', label: 'Documento' },
  { value: 'video', label: 'Video' },
];

export function Tecnicos() {
  const {
    ordenes,
    pautas,
    solicitudesRepuesto,
    toggleChecklist,
    addOTComment,
    setOTEstado,
    addOTEvidence,
    createSR,
    setSREstado,
  } = useCmms();

  const pendientes = useMemo(
    () => ordenes.filter(ot => ot.estado !== 'cerrada' && ot.estado !== 'validada'),
    [ordenes]
  );

  const [otSeleccionadaId, setOtSeleccionadaId] = useState<string | null>(pendientes[0]?.id ?? null);
  const otSeleccionada = useMemo(
    () => pendientes.find(ot => ot.id === otSeleccionadaId) ?? pendientes[0] ?? null,
    [pendientes, otSeleccionadaId]
  );

  const [comentario, setComentario] = useState('');
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [modalEvidencia, setModalEvidencia] = useState(false);
  const [tipoEvidencia, setTipoEvidencia] = useState<'foto' | 'documento' | 'video'>('foto');
  const [urlEvidencia, setUrlEvidencia] = useState('');
  const [descripcionEvidencia, setDescripcionEvidencia] = useState('');
  const [solicitudItems, setSolicitudItems] = useState<RepuestoSR[]>([
    { codigoSAP: '', descripcion: '', cantidad: 1, unidadMedida: 'UN' },
  ]);

  const solicitudesTecnico = useMemo(
    () => solicitudesRepuesto.filter(sr => otSeleccionada ? sr.otId === otSeleccionada.id : true),
    [solicitudesRepuesto, otSeleccionada]
  );

  const handleAgregarComentario = () => {
    if (!otSeleccionada || !comentario.trim()) return;
    addOTComment(otSeleccionada.id, comentario.trim());
    setComentario('');
  };

  const handleUploadEvidence = () => {
    if (!otSeleccionada || !urlEvidencia.trim()) return;
    addOTEvidence(otSeleccionada.id, {
      tipo: tipoEvidencia,
      url: urlEvidencia.trim(),
      descripcion: descripcionEvidencia.trim() || `Evidencia ${tipoEvidencia}`,
    });
    setUrlEvidencia('');
    setDescripcionEvidencia('');
    setModalEvidencia(false);
  };

  const handleSolicitudRepuestos = () => {
    if (!otSeleccionada) return;
    const items = solicitudItems.filter(item => item.codigoSAP.trim() && item.cantidad > 0).map(item => ({ ...item, descripcion: item.descripcion || 'Repuesto solicitado' }));
    if (!items.length) return;
    createSR({
      otId: otSeleccionada.id,
      solicitante: otSeleccionada.tecnicoAsignado ?? 'Técnico de terreno',
      faena: otSeleccionada.faena,
      items,
    });
    setModalSolicitud(false);
    setSolicitudItems([{ codigoSAP: '', descripcion: '', cantidad: 1, unidadMedida: 'UN' }]);
  };

  const renderEstadoAction = (ot: OrdenTrabajo) => {
    if (ot.estado === 'abierta') return 'Iniciar OT';
    if (ot.estado === 'en_progreso') return 'Marcar completada';
    if (ot.estado === 'en_espera') return 'Reanudar trabajo';
    return 'Actualizar estado';
  };

  const handleEstadoUpdate = () => {
    if (!otSeleccionada) return;
    const siguienteEstado = otSeleccionada.estado === 'abierta'
      ? 'en_progreso'
      : otSeleccionada.estado === 'en_progreso'
        ? 'completada'
        : otSeleccionada.estado === 'en_espera'
          ? 'en_progreso'
          : otSeleccionada.estado;

    setOTEstado(otSeleccionada.id, siguienteEstado);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Módulo de Técnicos</p>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Trabajo de campo y cierre de OT</h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">Acceda a las órdenes asignadas, registre evidencias, solicite materiales, agregue trabajos adicionales y genere informes para su aprobación.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setModalSolicitud(true)} className="gap-2"><Package className="w-4 h-4" /> Solicitar Material</Button>
          <Button onClick={() => setModalEvidencia(true)} variant="secondary" className="gap-2"><UploadCloud className="w-4 h-4" /> Adjuntar Evidencia</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-200/80">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Órdenes activas para técnicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">OT</th>
                    <th className="px-4 py-3">Equipo</th>
                    <th className="px-4 py-3">Técnico</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Criticidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pendientes.map(ot => (
                    <tr key={ot.id} className={cn('cursor-pointer hover:bg-slate-50', ot.id === otSeleccionada?.id && 'bg-slate-100'))} onClick={() => setOtSeleccionadaId(ot.id)}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{ot.numero}</td>
                      <td className="px-4 py-3 text-slate-600">{ot.equipo}</td>
                      <td className="px-4 py-3 text-slate-600">{ot.tecnicoAsignado ?? 'Sin asignar'}</td>
                      <td className="px-4 py-3"><StatusBadge type="estadoOT" value={ot.estado} /></td>
                      <td className="px-4 py-3"><StatusBadge type="criticidad" value={ot.criticidad} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {otSeleccionada ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Orden seleccionada</p>
                      <h2 className="text-xl font-semibold text-slate-900">{otSeleccionada.numero} · {otSeleccionada.equipo}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleEstadoUpdate} className="gap-2"><CheckCircle className="w-4 h-4" /> {renderEstadoAction(otSeleccionada)}</Button>
                      <Button variant="secondary" className="gap-2" onClick={() => setModalEvidencia(true)}><UploadCloud className="w-4 h-4" /> Cargar evidencia</Button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{otSeleccionada.descripcion}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-slate-200/80">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-slate-900">Checklist de trabajo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {otSeleccionada.checklist.map(item => (
                        <button
                          key={item.id}
                          onClick={() => toggleChecklist(otSeleccionada.id, item.id)}
                          className={cn(
                            'w-full rounded-2xl border px-3 py-3 text-left transition-colors',
                            item.completado ? 'border-emerald-300 bg-emerald-50 text-slate-800' : 'border-slate-200 bg-white hover:bg-slate-50'
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium">{item.descripcion}</span>
                            <span className={cn('text-xs font-semibold', item.completado ? 'text-emerald-700' : 'text-slate-500')}>
                              {item.completado ? 'Completado' : 'Pendiente'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/80">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-slate-900">Notas y trabajos adicionales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={comentario}
                        onChange={event => setComentario(event.target.value)}
                        placeholder="Describa trabajos adicionales o hallazgos en terreno"
                        rows={4}
                      />
                      <Button onClick={handleAgregarComentario} className="w-full gap-2"><MessageCircle className="w-4 h-4" /> Agregar nota</Button>
                      <div className="space-y-2">
                        {otSeleccionada.comentarios.slice(0, 4).map(comment => (
                          <div key={comment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                            <p className="font-medium text-slate-900">{comment.usuario} • {comment.rol}</p>
                            <p className="mt-1">{comment.texto}</p>
                          </div>
                        ))}
                        {!otSeleccionada.comentarios.length && <p className="text-sm text-slate-500">No hay anotaciones registradas aún.</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-slate-200/80">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-slate-900">Evidencias cargadas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {otSeleccionada.evidencias.length ? (
                        otSeleccionada.evidencias.map(file => (
                          <div key={file.id} className="rounded-2xl border border-slate-200 bg-white p-3 flex items-start gap-3">
                            <FileText className="w-5 h-5 text-slate-500" />
                            <div>
                              <p className="font-medium text-slate-900">{file.descripcion}</p>
                              <p className="text-xs text-slate-500">{file.tipo} • {file.url}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No se han registrado evidencias para esta OT.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200/80">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-slate-900">Solicitudes de materiales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {solicitudesTecnico.length ? (
                        solicitudesTecnico.map(sr => (
                          <div key={sr.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium text-slate-900">{sr.numero}</p>
                              <StatusBadge type="estadoSR" value={sr.estado} />
                            </div>
                            <p className="text-sm text-slate-600">{sr.items.length} item(s) solicitados</p>
                            <div className="flex flex-wrap gap-2">
                              {sr.items.map(item => (
                                <span key={item.codigoSAP} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
                                  {item.codigoSAP} x{item.cantidad}
                                </span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {sr.estado === 'pendiente' && (
                                <Button variant="secondary" size="sm" onClick={() => setSREstado(sr.id, 'aprobada')}>Enviar a supervisor</Button>
                              )}
                              {sr.estado === 'aprobada' && (
                                <Button variant="secondary" size="sm" onClick={() => setSREstado(sr.id, 'en_preparacion')}>Preparar en bodega</Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No hay solicitudes vinculadas a la OT seleccionada.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Seleccione una OT para ver detalles, checklist y evidencias.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" /> Guías y pautas de mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pautas.slice(0, 4).map(pauta => (
                <div key={pauta.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{pauta.codigo}</p>
                      <p className="text-sm text-slate-600">{pauta.nombre}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{pauta.frecuencia}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    {pauta.tareas.slice(0, 3).map(tarea => (
                      <div key={tarea.id} className="rounded-xl bg-slate-50 px-3 py-2">{tarea.descripcion}</div>
                    ))}
                    {pauta.tareas.length > 3 && <p className="text-xs text-slate-400">+{pauta.tareas.length - 3} pasos adicionales</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" /> Informes y certificados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">Genere reportes resumidos de trabajo, certificados de cumplimiento y documente el cierre con trazabilidad.</p>
              <div className="grid gap-2">
                <Button className="gap-2"><Download className="w-4 h-4" /> Generar informe de trabajo</Button>
                <Button variant="secondary" className="gap-2"><FileText className="w-4 h-4" /> Descargar certificado de cierre</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={modalSolicitud} onOpenChange={setModalSolicitud}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nueva solicitud de materiales</DialogTitle>
            <DialogDescription>Registre los repuestos necesarios para esta OT y envíelos para aprobación.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Orden de Trabajo</label>
                <Input value={otSeleccionada?.numero ?? ''} disabled />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Faena</label>
                <Input value={otSeleccionada?.faena ?? ''} disabled />
              </div>
            </div>
            <div className="space-y-3">
              {solicitudItems.map((item, index) => (
                <div key={index} className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr]">
                  <Input
                    placeholder="Código SAP"
                    value={item.codigoSAP}
                    onChange={event => {
                      const next = [...solicitudItems];
                      next[index].codigoSAP = event.target.value;
                      setSolicitudItems(next);
                    }}
                  />
                  <Input
                    placeholder="Cantidad"
                    type="number"
                    value={item.cantidad}
                    min={1}
                    onChange={event => {
                      const next = [...solicitudItems];
                      next[index].cantidad = Number(event.target.value);
                      setSolicitudItems(next);
                    }}
                  />
                  <Input
                    placeholder="Descripción"
                    value={item.descripcion}
                    onChange={event => {
                      const next = [...solicitudItems];
                      next[index].descripcion = event.target.value;
                      setSolicitudItems(next);
                    }}
                  />
                </div>
              ))}
              <Button variant="secondary" onClick={() => setSolicitudItems([...solicitudItems, { codigoSAP: '', descripcion: '', cantidad: 1, unidadMedida: 'UN' }])} className="gap-2">
                <Plus className="w-4 h-4" /> Agregar ítem
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSolicitudRepuestos} className="gap-2"><Package className="w-4 h-4" /> Enviar solicitud</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalEvidencia} onOpenChange={setModalEvidencia}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar evidencia</DialogTitle>
            <DialogDescription>Registre una foto, documento o video para respaldar la ejecución de la OT.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Select value={tipoEvidencia} onValueChange={(value) => setTipoEvidencia(value as 'foto' | 'documento' | 'video')}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de evidencia" />
                </SelectTrigger>
                <SelectContent>
                  {evidenciaTipos.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="URL o nombre del archivo"
                value={urlEvidencia}
                onChange={event => setUrlEvidencia(event.target.value)}
              />
            </div>
            <Textarea
              value={descripcionEvidencia}
              onChange={event => setDescripcionEvidencia(event.target.value)}
              placeholder="Descripción breve de la evidencia"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleUploadEvidence} className="gap-2"><UploadCloud className="w-4 h-4" /> Registrar evidencia</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
