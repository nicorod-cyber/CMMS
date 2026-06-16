import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Building2, ChevronDown, Command,
  AlertTriangle, Clock, CheckCircle2, Wrench, X, Truck, Package, Inbox, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  alertas, faenas, ordenesTrabajo, equipos,
  repuestos, solicitudesMantenimiento, tecnicos
} from '@/data/mockData';
import { buildSearch, findFaenaIdByText, matchesBodegaFaena, matchesFaena } from '@/lib/filters';
import type { Alerta } from '@/types';

const breadcrumbLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/mantenimiento': 'Órdenes de Trabajo',
  '/mantenimiento/ot': 'Órdenes de Trabajo',
  '/mantenimiento/sm': 'Solicitudes SM',
  '/mantenimiento/backlog': 'Backlog',
  '/mantenimiento/checklists': 'Checklists',
  '/activos': 'Maestro de Activos',
  '/activos/maestro': 'Maestro de Activos',
  '/activos/ficha': 'Ficha 360°',
  '/bodega': 'Stock',
  '/bodega/stock': 'Stock',
  '/bodega/solicitudes': 'Solicitudes SR',
  '/bodega/kardex': 'Kardex',
  '/bodega/criticos': 'Materiales Críticos',
  '/planificacion': 'Planificación',
  '/planificacion/semanal': 'Planificación Semanal',
  '/planificacion/mensual': 'Planificación Mensual',
  '/planificacion/asignacion': 'Asignación',
  '/reportes': 'Reportes',
  '/documentos': 'Documentos',
  '/usuarios': 'Gestión de Usuarios',
  '/configuracion': 'Configuración',
};

export function Topbar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [faenaOpen, setFaenaOpen] = useState(false);
  const [faenaSelected, setFaenaSelected] = useState(faenas[0]);
  const [notificaciones, setNotificaciones] = useState(alertas);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const faenaRef = useRef<HTMLDivElement>(null);

  const breadcrumbLabel = breadcrumbLabels[location.pathname] ?? 'Dashboard';
  const selectedFaenaId = searchParams.get('faena') ?? faenaSelected.id;
  const alertasNoLeidas = notificaciones.filter(a => !a.leida);

  useEffect(() => {
    const faenaUrl = searchParams.get('faena');
    const faena = faenas.find(f => f.id === faenaUrl) ?? faenas[0];
    setFaenaSelected(faena);
  }, [searchParams]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (faenaRef.current && !faenaRef.current.contains(e.target as Node)) setFaenaOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'critica': return <AlertTriangle className="w-4 h-4 text-rojo-tronadura" />;
      case 'advertencia': return <Clock className="w-4 h-4 text-ambar-faena" />;
      case 'info': return <CheckCircle2 className="w-4 h-4 text-azul-petroleo" />;
      default: return <Wrench className="w-4 h-4 text-gris-corporativo/70" />;
    }
  };

  const normalizedSearch = searchQuery.toLowerCase().trim();

  const otResults = normalizedSearch.length > 1
    ? ordenesTrabajo.filter(ot =>
        matchesFaena(ot.faena, selectedFaenaId) &&
        (ot.numero.toLowerCase().includes(normalizedSearch) ||
        ot.equipo.toLowerCase().includes(normalizedSearch) ||
        ot.descripcion.toLowerCase().includes(normalizedSearch) ||
        (ot.tecnicoAsignado ?? '').toLowerCase().includes(normalizedSearch))
      ).slice(0, 3)
    : [];

  const smResults = normalizedSearch.length > 1
    ? solicitudesMantenimiento.filter(sm =>
        matchesFaena(sm.faena, selectedFaenaId) &&
        (sm.numero.toLowerCase().includes(normalizedSearch) ||
        sm.equipo.toLowerCase().includes(normalizedSearch) ||
        sm.tipoFalla.toLowerCase().includes(normalizedSearch) ||
        sm.solicitante.toLowerCase().includes(normalizedSearch))
      ).slice(0, 3)
    : [];

  const eqResults = normalizedSearch.length > 1
    ? equipos.filter(eq =>
        matchesFaena(eq.faena, selectedFaenaId) &&
        (eq.nombre.toLowerCase().includes(normalizedSearch) ||
        eq.codigo.toLowerCase().includes(normalizedSearch) ||
        eq.marca.toLowerCase().includes(normalizedSearch) ||
        eq.modelo.toLowerCase().includes(normalizedSearch))
      ).slice(0, 2)
    : [];

  const repuestoResults = normalizedSearch.length > 1
    ? repuestos.filter(r =>
        matchesBodegaFaena(r.bodega, selectedFaenaId) &&
        (r.codigoSAP.toLowerCase().includes(normalizedSearch) ||
        r.descripcion.toLowerCase().includes(normalizedSearch))
      ).slice(0, 3)
    : [];

  const tecnicoResults = normalizedSearch.length > 1
    ? tecnicos.filter(t =>
        matchesFaena(t.faena, selectedFaenaId) &&
        (t.nombre.toLowerCase().includes(normalizedSearch) ||
        t.especialidad.toLowerCase().includes(normalizedSearch))
      ).slice(0, 2)
    : [];

  const searchResults = [...otResults, ...smResults, ...eqResults, ...repuestoResults, ...tecnicoResults];

  const navigateTo = (pathname: string, params: Record<string, string | null | undefined> = {}) => {
    navigate(buildSearch(pathname, { faena: selectedFaenaId, ...params }));
  };

  const navigateFromSearch = (pathname: string, params: Record<string, string | null | undefined> = {}) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigateTo(pathname, params);
  };

  const submitSearch = () => {
    const value = searchQuery.trim();
    if (!value) return;

    if (otResults[0]) {
      navigateFromSearch('/mantenimiento/ot', { search: otResults[0].numero, vista: 'tabla' });
      return;
    }

    if (smResults[0]) {
      navigateFromSearch('/mantenimiento/sm', { search: smResults[0].numero });
      return;
    }

    if (eqResults[0]) {
      navigateFromSearch('/activos/maestro', { search: eqResults[0].codigo });
      return;
    }

    if (repuestoResults[0]) {
      navigateFromSearch('/bodega/stock', { search: repuestoResults[0].codigoSAP });
      return;
    }

    if (tecnicoResults[0]) {
      navigateFromSearch('/mantenimiento/ot', { search: tecnicoResults[0].nombre, vista: 'tabla' });
      return;
    }

    navigateFromSearch(location.pathname, { search: value });
  };

  const selectFaena = (faena: typeof faenas[number]) => {
    const params = new URLSearchParams(location.search);
    params.set('faena', faena.id);
    setFaenaSelected(faena);
    setFaenaOpen(false);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const getNotificationRoute = (alerta: Alerta): { pathname: string; params: Record<string, string | null | undefined> } => {
    if (alerta.entidadTipo === 'ot') {
      const ot = ordenesTrabajo.find(o => o.id === alerta.entidadId || o.numero === alerta.entidadId);
      return { pathname: '/mantenimiento/ot', params: { search: ot?.numero ?? '', vista: 'tabla', filtro: alerta.titulo.includes('Backlog') ? 'abiertas' : undefined } };
    }

    if (alerta.entidadTipo === 'sm') {
      const sm = solicitudesMantenimiento.find(s => s.id === alerta.entidadId || s.numero === alerta.entidadId);
      return { pathname: '/mantenimiento/sm', params: { search: sm?.numero ?? '' } };
    }

    if (alerta.entidadTipo === 'equipo') {
      const equipo = equipos.find(e => e.id === alerta.entidadId || e.codigo === alerta.entidadId);
      return { pathname: '/activos/maestro', params: { search: equipo?.codigo ?? '', estado: equipo?.estadoOperativo ?? undefined } };
    }

    if (alerta.entidadTipo === 'repuesto') {
      return { pathname: '/bodega/stock', params: { search: alerta.entidadId ?? '' } };
    }

    if (alerta.titulo.includes('Disponibilidad')) {
      return { pathname: '/activos/maestro', params: {} };
    }

    return { pathname: '/', params: {} };
  };

  const openNotification = (alerta: Alerta) => {
    setNotificaciones(prev => prev.map(item => item.id === alerta.id ? { ...item, leida: true } : item));
    setNotifOpen(false);

    const route = getNotificationRoute(alerta);
    const alertaFaenaId = findFaenaIdByText(alerta.faena) ?? selectedFaenaId;
    navigate(buildSearch(route.pathname, { faena: alertaFaenaId, ...route.params }));
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-blanco-puro/90 backdrop-blur-md border-b border-gris-corporativo/20 z-40 flex items-center px-6 gap-4 transition-all duration-250',
        sidebarCollapsed ? 'left-[72px]' : 'left-[264px]'
      )}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gris-corporativo min-w-0">
        <span className="text-gris-corporativo/70">Inicio</span>
        <span className="text-gris-corporativo/50">/</span>
        <span className="font-medium text-noche truncate">{breadcrumbLabel}</span>
      </div>

      <div className="flex-1" />

      {/* Global Search */}
      <div ref={searchRef} className="relative">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-acero-claro border border-gris-corporativo/40 rounded-lg text-sm text-noche hover:bg-blanco-puro transition-colors w-64"
        >
          <Search className="w-4 h-4 text-gris-corporativo/60" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-acero-claro border border-gris-corporativo rounded text-[10px] font-mono text-noche">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-[420px] bg-blanco-puro rounded-xl shadow-2xl border border-gris-corporativo/20 overflow-hidden z-50"
            >
              <div className="flex items-center gap-2 p-3 border-b border-gris-corporativo/10">
                <Search className="w-4 h-4 text-gris-corporativo/60" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                  placeholder="Buscar OT, equipo, repuesto, código SAP..."
                  className="flex-1 text-sm outline-none bg-transparent placeholder:text-gris-corporativo/60"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-4 h-4 text-gris-corporativo/60 hover:text-gris-corporativo" />
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchQuery.length <= 1 ? (
                  <div className="p-6 text-center text-sm text-gris-corporativo/70">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gris-corporativo/50" />
                    <p>Busque por número de OT, equipo,</p>
                    <p>código SAP o nombre de técnico</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gris-corporativo/70">No se encontraron resultados</div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-[10px] font-bold text-gris-corporativo/70 uppercase tracking-wider">Resultados</div>
                    {otResults.length > 0 && (
                      <>
                        <div className="px-3 py-1 text-[10px] text-gris-corporativo/70 uppercase">Órdenes de Trabajo</div>
                        {otResults.map(ot => (
                          <button
                            key={ot.id}
                            onClick={() => navigateFromSearch('/mantenimiento/ot', { search: ot.numero, vista: 'tabla' })}
                            className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-acero-claro transition-colors text-left"
                          >
                            <Wrench className="w-4 h-4 text-azul-petroleo mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-noche">{ot.numero}</p>
                              <p className="text-xs text-gris-corporativo/70 truncate">{ot.equipo} · {ot.descripcion.slice(0, 50)}...</p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                    {smResults.length > 0 && (
                      <>
                        <div className="px-3 py-1 text-[10px] text-gris-corporativo/70 uppercase">Solicitudes SM</div>
                        {smResults.map(sm => (
                          <button
                            key={sm.id}
                            onClick={() => navigateFromSearch('/mantenimiento/sm', { search: sm.numero })}
                            className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-acero-claro transition-colors text-left"
                          >
                            <Inbox className="w-4 h-4 text-indigo-tecnico mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-noche">{sm.numero}</p>
                              <p className="text-xs text-gris-corporativo/70 truncate">{sm.equipo} · {sm.tipoFalla}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                    {eqResults.length > 0 && (
                      <>
                        <div className="px-3 py-1 text-[10px] text-gris-corporativo/70 uppercase">Equipos</div>
                        {eqResults.map(eq => (
                          <button
                            key={eq.id}
                            onClick={() => navigateFromSearch('/activos/maestro', { search: eq.codigo })}
                            className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-acero-claro transition-colors text-left"
                          >
                            <Truck className="w-4 h-4 text-gris-corporativo/70 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-noche">{eq.codigo}</p>
                              <p className="text-xs text-gris-corporativo/70 truncate">{eq.nombre} · {eq.faena}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                    {repuestoResults.length > 0 && (
                      <>
                        <div className="px-3 py-1 text-[10px] text-gris-corporativo/70 uppercase">Repuestos</div>
                        {repuestoResults.map(r => (
                          <button
                            key={r.codigoSAP}
                            onClick={() => navigateFromSearch('/bodega/stock', { search: r.codigoSAP })}
                            className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-acero-claro transition-colors text-left"
                          >
                            <Package className="w-4 h-4 text-ambar-faena mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-noche">{r.codigoSAP}</p>
                              <p className="text-xs text-gris-corporativo/70 truncate">{r.descripcion} · {r.bodega}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                    {tecnicoResults.length > 0 && (
                      <>
                        <div className="px-3 py-1 text-[10px] text-gris-corporativo/70 uppercase">Técnicos</div>
                        {tecnicoResults.map(t => (
                          <button
                            key={t.nombre}
                            onClick={() => navigateFromSearch('/mantenimiento/ot', { search: t.nombre, vista: 'tabla' })}
                            className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-acero-claro transition-colors text-left"
                          >
                            <User className="w-4 h-4 text-gris-corporativo/70 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-noche">{t.nombre}</p>
                              <p className="text-xs text-gris-corporativo/70 truncate">{t.especialidad} · {t.faena}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Faena Selector */}
      <div ref={faenaRef} className="relative">
        <button
          onClick={() => setFaenaOpen(!faenaOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-acero-claro border border-gris-corporativo/30 rounded-lg text-sm hover:bg-blanco-puro transition-colors"
        >
          <Building2 className="w-4 h-4 text-gris-corporativo/70" />
          <span className="text-noche font-medium hidden sm:inline">{faenaSelected.nombre}</span>
          <ChevronDown className={cn('w-3.5 h-3.5 text-gris-corporativo/60 transition-transform', faenaOpen && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {faenaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute right-0 top-full mt-2 w-56 bg-blanco-puro rounded-xl shadow-xl border border-gris-corporativo/20 overflow-hidden z-50"
            >
              {faenas.map(f => (
                <button
                  key={f.id}
                  onClick={() => selectFaena(f)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-acero-claro',
                    faenaSelected.id === f.id && 'bg-azul-petroleo/10 text-azul-petroleo font-medium'
                  )}
                >
                  <p>{f.nombre}</p>
                  <p className="text-xs text-gris-corporativo/70">{f.ubicacion}</p>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-lg hover:bg-acero-claro transition-colors"
        >
          <Bell className="w-5 h-5 text-gris-corporativo" />
          {alertasNoLeidas.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rojo-tronadura text-blanco-puro text-[10px] font-bold rounded-full flex items-center justify-center">
              {alertasNoLeidas.length}
            </span>
          )}
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              className="absolute right-0 top-full mt-2 w-[380px] bg-blanco-puro rounded-xl shadow-2xl border border-gris-corporativo/20 overflow-hidden z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gris-corporativo/10">
                <h3 className="font-semibold text-sm">Alertas y Notificaciones</h3>
                <span className="text-xs text-gris-corporativo/70">{alertasNoLeidas.length} sin leer</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notificaciones.map(a => (
                  <div
                    key={a.id}
                    onClick={() => openNotification(a)}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b border-gris-corporativo/10 cursor-pointer hover:bg-acero-claro transition-colors',
                      !a.leida && 'bg-rojo-tronadura/10'
                    )}
                  >
                    <div className="mt-0.5 shrink-0">{getAlertIcon(a.tipo)}</div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm font-medium', !a.leida ? 'text-noche' : 'text-gris-corporativo')}>
                        {a.titulo}
                      </p>
                      <p className="text-xs text-gris-corporativo/70 line-clamp-2 mt-0.5">{a.mensaje}</p>
                      <p className="text-[10px] text-gris-corporativo/60 mt-1">{a.faena} · {a.fecha.split('T')[0]}</p>
                    </div>
                    {!a.leida && <span className="w-2 h-2 bg-rojo-tronadura rounded-full shrink-0 mt-1.5" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
