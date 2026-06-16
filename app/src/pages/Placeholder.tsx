import { useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { CalendarClock, CheckSquare, Database, FileText, FolderSymlink, Plus, RotateCcw, Settings, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { useCmms } from '@/context/CmmsContext';
import { cn } from '@/lib/utils';

export function Placeholder({ title }: { title: string }) {
  const location = useLocation();
  const cmms = useCmms();
  const [modal, setModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [detalle, setDetalle] = useState('');

  const isBacklog = location.pathname.includes('backlog');
  const isChecklists = location.pathname.includes('checklists');
  const isKardex = location.pathname.includes('kardex');
  const isDocumentos = location.pathname.includes('documentos');
  const isUsuarios = location.pathname.includes('usuarios');
  const isConfig = location.pathname.includes('configuracion');

  const backlog = cmms.ordenes.filter(ot => ['abierta', 'en_espera', 'reprogramada'].includes(ot.estado));

  const guardar = () => {
    if (isDocumentos) {
      cmms.addDocumento({
        nombre: nombre || 'Documento operativo',
        tipo: 'Procedimiento',
        entidad: detalle || 'General',
        url: 'https://sharepoint.contoso.com/sites/cmms/documento-demo.pdf',
        sharepointFolder: '/CMMS/Documentos Operacionales',
        version: 'v1.0',
        estado: 'vigente',
      });
    }

    if (isChecklists) {
      cmms.addPauta({
        codigo: `PAU-${Date.now()}`,
        nombre: nombre || 'Nueva pauta de mantenimiento',
        equipoTipo: detalle || 'sistema',
        frecuencia: 'Mensual',
        duracionHoras: 4,
        estado: 'borrador',
        tareas: [
          { id: `t-${Date.now()}-1`, descripcion: 'Verificar condicion operacional', completado: false },
          { id: `t-${Date.now()}-2`, descripcion: 'Registrar mediciones y observaciones', completado: false },
        ],
      });
    }

    if (isUsuarios) {
      cmms.addUsuario({
        nombre: nombre || 'Nuevo usuario',
        email: `${(nombre || 'usuario').toLowerCase().replace(/\s+/g, '.')}@minera.cl`,
        rol: detalle || 'Tecnico',
        permisos: ['mantenimiento.ver'],
      });
    }

    setNombre('');
    setDetalle('');
    setModal(false);
  };

  if (isBacklog) {
    return (
      <ModuleShell title={title} subtitle="Priorizacion de trabajos pendientes y reprogramados" icon={CalendarClock}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Metric label="Backlog total" value={backlog.length} />
          <Metric label="Criticos" value={backlog.filter(ot => ot.criticidad === 'critica').length} tone="text-red-600" />
          <Metric label="HH estimadas" value={backlog.reduce((sum, ot) => sum + ot.hhEstimadas, 0)} />
          <Metric label="En espera" value={backlog.filter(ot => ot.estado === 'en_espera').length} tone="text-amber-600" />
        </div>
        <Card className="border-slate-200/80 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-slate-500">OT</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500">Equipo</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500">Estado</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500">Criticidad</th>
                <th className="px-4 py-3 text-left text-xs text-slate-500">Tecnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backlog.map(ot => (
                <tr key={ot.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{ot.numero}</td>
                  <td className="px-4 py-3 text-slate-600">{ot.equipo}</td>
                  <td className="px-4 py-3"><StatusBadge type="estadoOT" value={ot.estado} /></td>
                  <td className="px-4 py-3"><StatusBadge type="criticidad" value={ot.criticidad} /></td>
                  <td className="px-4 py-3 text-slate-600">{ot.tecnicoAsignado || 'Sin asignar'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </ModuleShell>
    );
  }

  if (isChecklists) {
    return (
      <ModuleShell title={title} subtitle="Pautas de mantenimiento y checklists reutilizables" icon={CheckSquare} action={<Button onClick={() => setModal(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2"><Plus className="w-4 h-4" /> Nueva pauta</Button>}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cmms.pautas.map(pauta => (
            <Card key={pauta.id} className="border-slate-200/80">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{pauta.codigo} · {pauta.nombre}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 text-xs text-slate-500"><span>{pauta.equipoTipo}</span><span>{pauta.frecuencia}</span><span>{pauta.duracionHoras}h</span></div>
                <div className="space-y-2">
                  {pauta.tareas.map(tarea => <div key={tarea.id} className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">{tarea.descripcion}</div>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <CrudDialog open={modal} setOpen={setModal} title="Nueva pauta" nombre={nombre} setNombre={setNombre} detalle={detalle} setDetalle={setDetalle} detallePlaceholder="Tipo de equipo" onSave={guardar} />
      </ModuleShell>
    );
  }

  if (isKardex) {
    return (
      <ModuleShell title={title} subtitle="Trazabilidad de entradas, salidas, reservas y ajustes" icon={Database}>
        <Card className="border-slate-200/80 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Fecha', 'Codigo', 'Descripcion', 'Tipo', 'Cantidad', 'Referencia', 'Stock'].map(h => <th key={h} className="px-4 py-3 text-left text-xs text-slate-500">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cmms.kardex.map(mov => (
                <tr key={mov.id}>
                  <td className="px-4 py-3 text-xs text-slate-500">{mov.fecha.split('T')[0]}</td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{mov.codigoSAP}</td>
                  <td className="px-4 py-3 text-slate-600">{mov.descripcion}</td>
                  <td className="px-4 py-3"><span className={cn('rounded-full px-2 py-0.5 text-xs', mov.tipo === 'entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{mov.tipo}</span></td>
                  <td className="px-4 py-3 font-semibold">{mov.cantidad}</td>
                  <td className="px-4 py-3 text-slate-500">{mov.referencia}</td>
                  <td className="px-4 py-3 font-semibold">{mov.stockResultante}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </ModuleShell>
    );
  }

  if (isDocumentos) {
    return (
      <ModuleShell title={title} subtitle="Repositorio documental enlazado a carpetas SharePoint" icon={FolderSymlink} action={<Button onClick={() => setModal(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2"><Plus className="w-4 h-4" /> Enlazar</Button>}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cmms.documentos.map(doc => (
            <Card key={doc.id} className="border-slate-200/80">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{doc.nombre}</p>
                    <p className="text-xs text-slate-500">{doc.tipo} · {doc.entidad} · {doc.version}</p>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">{doc.sharepointFolder}</p>
                    <a className="text-xs text-cyan-700 mt-2 inline-block" href={doc.url} target="_blank">Abrir SharePoint</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <CrudDialog open={modal} setOpen={setModal} title="Enlazar documento" nombre={nombre} setNombre={setNombre} detalle={detalle} setDetalle={setDetalle} detallePlaceholder="Entidad relacionada" onSave={guardar} />
      </ModuleShell>
    );
  }

  if (isUsuarios) {
    return (
      <ModuleShell title={title} subtitle="Roles, permisos y usuarios del CMMS" icon={Users} action={<Button onClick={() => setModal(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2"><Plus className="w-4 h-4" /> Usuario</Button>}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cmms.usuarios.map(usuario => (
            <Card key={usuario.id} className="border-slate-200/80">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{usuario.nombre.split(' ').map(p => p[0]).join('').slice(0, 2)}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{usuario.nombre}</p>
                    <p className="text-xs text-slate-500">{usuario.rol}</p>
                    <p className="text-[10px] text-slate-400">{usuario.permisos.length} permisos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <CrudDialog open={modal} setOpen={setModal} title="Nuevo usuario" nombre={nombre} setNombre={setNombre} detalle={detalle} setDetalle={setDetalle} detallePlaceholder="Rol" onSave={guardar} />
      </ModuleShell>
    );
  }

  if (isConfig) {
    return (
      <ModuleShell title={title} subtitle="Parametros maestros e integraciones" icon={Settings}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ConfigCard icon={FolderSymlink} title="SharePoint" text="/CMMS/Activos, /CMMS/Pautas, /CMMS/Evidencias" />
          <ConfigCard icon={ShieldCheck} title="Permisos" text="Mantenimiento, Bodega, Planificacion, Reportes" />
          <ConfigCard icon={Database} title="Persistencia demo" text="Los cambios se guardan en localStorage" />
        </div>
        <Card className="border-slate-200/80">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Restaurar datos demo</p>
              <p className="text-xs text-slate-500">Limpia cambios locales y vuelve a la carga inicial.</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={cmms.resetDemo}><RotateCcw className="w-4 h-4" /> Restaurar</Button>
          </CardContent>
        </Card>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title={title} subtitle="Modulo operativo CMMS" icon={Settings}>
      <Card className="border-slate-200/80"><CardContent className="p-6 text-sm text-slate-500">Modulo listo para configurar.</CardContent></Card>
    </ModuleShell>
  );
}

function ModuleShell({ title, subtitle, icon: Icon, action, children }: { title: string; subtitle: string; icon: ElementType; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-slate-500" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value, tone = 'text-slate-900' }: { label: string; value: number | string; tone?: string }) {
  return (
    <Card className="border-slate-200/80">
      <CardContent className="p-4">
        <p className={cn('text-2xl font-bold', tone)}>{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function ConfigCard({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <Card className="border-slate-200/80">
      <CardContent className="p-4">
        <Icon className="w-5 h-5 text-cyan-700 mb-3" />
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{text}</p>
      </CardContent>
    </Card>
  );
}

function CrudDialog(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  nombre: string;
  setNombre: (value: string) => void;
  detalle: string;
  setDetalle: (value: string) => void;
  detallePlaceholder: string;
  onSave: () => void;
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>Complete los datos principales del registro.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={props.nombre} onChange={e => props.setNombre(e.target.value)} placeholder="Nombre" />
          <Textarea value={props.detalle} onChange={e => props.setDetalle(e.target.value)} placeholder={props.detallePlaceholder} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.setOpen(false)}>Cancelar</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={props.onSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
