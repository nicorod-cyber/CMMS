import { useState } from 'react';
import { Plus, Pencil, ShieldCheck } from 'lucide-react';
import { useCmms } from '@/context/CmmsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';

const permisoOptions = [
  'mantenimiento.ver',
  'mantenimiento.editar',
  'bodega.ver',
  'bodega.editar',
  'planificacion.ver',
  'reportes.ver',
  'documentos.ver',
  'usuarios.ver',
  'usuarios.editar',
  'usuarios.crear',
  'configuracion.ver',
];

export function Usuarios() {
  const cmms = useCmms();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');
  const [permisos, setPermisos] = useState<string[]>([]);

  const isAdmin = cmms.hasPermission('usuarios.editar') || cmms.hasPermission('usuarios.crear');
  const canView = cmms.hasPermission('usuarios.ver');

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setRol('');
    setPermisos([]);
    setEditingId(null);
  };

  const changeSession = (id: string) => {
    cmms.setCurrentUser(id);
  };

  const openEdit = (id: string) => {
    const user = cmms.usuarios.find(u => u.id === id);
    if (!user) return;
    setEditingId(id);
    setNombre(user.nombre);
    setEmail(user.email);
    setRol(user.rol);
    setPermisos(user.permisos);
    setModalOpen(true);
  };

  const openNew = () => {
    resetForm();
    setModalOpen(true);
  };

  const saveUser = () => {
    const trimmedNombre = nombre.trim();
    const trimmedEmail = email.trim();
    const trimmedRol = rol.trim();
    if (!trimmedNombre || !trimmedEmail || !trimmedRol || !isAdmin) return;

    if (editingId) {
      cmms.updateUsuario(editingId, { nombre: trimmedNombre, email: trimmedEmail, rol: trimmedRol, permisos });
    } else {
      cmms.addUsuario({ nombre: trimmedNombre, email: trimmedEmail, rol: trimmedRol, permisos });
    }
    setModalOpen(false);
    resetForm();
  };

  const togglePermiso = (permiso: string) => {
    setPermisos(prev => prev.includes(permiso) ? prev.filter(p => p !== permiso) : [...prev, permiso]);
  };

  if (!canView) {
    return (
      <div className="space-y-6">
        <Card className="border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-sm">Acceso denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">No tiene permisos para administrar usuarios. Solicite acceso a un administrador.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-500" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de usuarios</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Administre roles, perfiles y permisos del CMMS.</p>
        </div>
        <Button onClick={openNew} disabled={!isAdmin} className="bg-rojo-tronadura hover:bg-rojo-tronadura/90 text-white gap-2">
          <Plus className="w-4 h-4" /> Nuevo usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
        <Card className="border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-sm">Perfil actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{cmms.currentUser.nombre}</p>
              <p className="text-xs text-slate-500">{cmms.currentUser.email}</p>
              <p className="text-xs text-slate-500">{cmms.currentUser.rol}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Permisos asignados</p>
              <div className="flex flex-wrap gap-2">
                {cmms.currentUser.permisos.map(p => (
                  <span key={p} className="rounded-full bg-slate-100 text-slate-700 px-2 py-1 text-[11px]">{p}</span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Usuarios disponibles</p>
              <div className="grid gap-2">
                {cmms.usuarios.map(user => (
                  <button
                    key={user.id}
                    onClick={() => openEdit(user.id)}
                    className={cn(
                      'w-full text-left rounded-xl border px-4 py-3 transition-colors',
                      user.id === cmms.currentUser.id ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                    disabled={!isAdmin}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.nombre}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">{user.permisos.length} permisos</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cambiar sesión</p>
              <div className="grid gap-2">
                {cmms.usuarios.map(user => (
                  <button
                    key={`session-${user.id}`}
                    type="button"
                    onClick={() => changeSession(user.id)}
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                      user.id === cmms.currentUser.id ? 'border-rojo-tronadura bg-rojo-tronadura/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.nombre}</p>
                        <p className="text-xs text-slate-500">{user.rol}</p>
                      </div>
                      {user.id === cmms.currentUser.id && (
                        <span className="text-[10px] text-rojo-tronadura font-semibold">Activo</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle className="text-sm">Usuarios del sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {cmms.usuarios.map(usuario => (
                  <div key={usuario.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{usuario.nombre}</p>
                        <p className="text-xs text-slate-500">{usuario.email}</p>
                        <p className="text-xs text-slate-500">{usuario.rol}</p>
                      </div>
                      <Button variant="outline" onClick={() => openEdit(usuario.id)} disabled={!isAdmin} className="gap-2">
                        <Pencil className="w-4 h-4" /> Editar
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {usuario.permisos.map(permiso => (
                        <StatusBadge key={permiso} type="tag" value={permiso} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle className="text-sm">Reglas de acceso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Un usuario con permiso <strong>usuarios.ver</strong> puede ver este módulo.</p>
              <p>Los permisos <strong>usuarios.crear</strong> y <strong>usuarios.editar</strong> habilitan la creación y edición de perfiles.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar usuario' : 'Crear usuario'}</DialogTitle>
            <DialogDescription>Administre nombre, email, rol y permisos.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Ana Pérez" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email corporativo</Label>
              <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ana.perez@minera.cl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Input id="rol" value={rol} onChange={e => setRol(e.target.value)} placeholder="Planificador, Bodeguero, Técnico" />
            </div>

            <div className="space-y-2">
              <Label>Permisos</Label>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {permisoOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => togglePermiso(option)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                      permisos.includes(option)
                        ? 'border-rojo-tronadura bg-rojo-tronadura/10 text-rojo-tronadura'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permissions-summary">Resumen</Label>
              <Textarea id="permissions-summary" value={permisos.join(', ')} readOnly className="h-24" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button className="bg-rojo-tronadura hover:bg-rojo-tronadura/90 text-white" onClick={saveUser} disabled={!isAdmin || !nombre || !email || !rol}>
              {editingId ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
