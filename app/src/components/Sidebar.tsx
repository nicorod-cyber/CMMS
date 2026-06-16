import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCmms } from '@/context/CmmsContext';
import {
  LayoutDashboard, Wrench, Package, Truck, CalendarDays,
  BarChart3, ChevronLeft, ChevronRight, Pickaxe, Settings,
  FileText, Users, ShieldCheck, ChevronDown
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
  permission?: string;
  subItems?: { label: string; path: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  {
    label: 'Operaciones',
    icon: Wrench,
    path: '/mantenimiento',
    badge: 8,
    permission: 'mantenimiento.ver',
    subItems: [
      { label: 'Órdenes de Trabajo', path: '/mantenimiento/ot' },
      { label: 'Solicitudes SM', path: '/mantenimiento/sm' },
      { label: 'Backlog', path: '/mantenimiento/backlog' },
      { label: 'Checklists', path: '/mantenimiento/checklists' },
    ]
  },
  {
    label: 'Activos',
    icon: Truck,
    path: '/activos',
  },
  {
    label: 'Técnicos',
    icon: ShieldCheck,
    path: '/tecnicos',
    permission: 'mantenimiento.ver',
  },
  {
    label: 'Bodega',
    icon: Package,
    path: '/bodega',
    badge: 6,
    permission: 'bodega.ver',
    subItems: [
      { label: 'Stock', path: '/bodega/stock' },
      { label: 'Solicitudes SR', path: '/bodega/solicitudes' },
      { label: 'Kardex', path: '/bodega/kardex' },
      { label: 'Materiales Críticos', path: '/bodega/criticos' },
    ]
  },
  {
    label: 'Planificación',
    icon: CalendarDays,
    path: '/planificacion',
    permission: 'planificacion.ver',
    subItems: [
      { label: 'Semanal', path: '/planificacion/semanal' },
      { label: 'Mensual', path: '/planificacion/mensual' },
      { label: 'Asignación', path: '/planificacion/asignacion' },
    ]
  },
  { label: 'Reportes', icon: BarChart3, path: '/reportes', permission: 'reportes.ver' },
];

const bottomNavItems: NavItem[] = [
  { label: 'Documentos', icon: FileText, path: '/documentos', permission: 'documentos.ver' },
  { label: 'Usuarios', icon: Users, path: '/usuarios', permission: 'usuarios.ver' },
  { label: 'Configuración', icon: Settings, path: '/configuracion', permission: 'configuracion.ver' },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useCmms();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    '/mantenimiento': true,
  });

  const toggleSubmenu = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMenus(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const visibleNavItems = navItems.filter(item => !item.permission || currentUser.permisos.includes(item.permission));
  const visibleBottomNavItems = bottomNavItems.filter(item => !item.permission || currentUser.permisos.includes(item.permission));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 264 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-noche text-blanco-puro z-50 flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-blanco-puro/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rojo-tronadura to-azul-petroleo flex items-center justify-center shrink-0 shadow-lg shadow-rojo-tronadura/30">
            <Pickaxe className="w-5 h-5 text-blanco-puro" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <h1 className="text-sm font-bold tracking-tight whitespace-nowrap">COM MINERO</h1>
                <p className="text-[10px] text-gris-corporativo/70 whitespace-nowrap">Control Operacional</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1 scrollbar-thin">
        {visibleNavItems.map((item) => {
          const active = isActive(item.path);
          const expanded = expandedMenus[item.path];

          return (
            <div key={item.path}>
              <button
                onClick={(e) => {
                  if (item.subItems && !collapsed) {
                    toggleSubmenu(item.path, e);
                  } else {
                    navigate(item.path);
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                  active
                    ? 'bg-rojo-tronadura/20 text-rojo-tronadura'
                    : 'text-gris-corporativo/70 hover:bg-gris-corporativo/20 hover:text-blanco-puro'
                )}
              >
                <item.icon className={cn('w-5 h-5 shrink-0', active && 'text-rojo-tronadura')} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 text-left whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && !collapsed && (
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                    active ? 'bg-rojo-tronadura text-blanco-puro' : 'bg-gris-corporativo text-blanco-puro'
                  )}>
                    {item.badge}
                  </span>
                )}
                {item.subItems && !collapsed && (
                  <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5 text-gris-corporativo/60" />
                  </motion.div>
                )}
              </button>

              {/* Submenu */}
              <AnimatePresence>
                {item.subItems && expanded && !collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-6 pl-3 border-l border-blanco-puro/10 space-y-0.5 mt-0.5">
                      {item.subItems.map((sub) => (
                        <button
                          key={sub.path}
                          onClick={() => navigate(sub.path)}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-md text-xs transition-colors whitespace-nowrap overflow-hidden',
                            location.pathname === sub.path
                              ? 'text-rojo-tronadura bg-rojo-tronadura/10 font-medium'
                              : 'text-gris-corporativo/70 hover:text-blanco-puro hover:bg-gris-corporativo/20'
                          )}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-2 py-2 space-y-1 border-t border-blanco-puro/10 shrink-0">
        {visibleBottomNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
              isActive(item.path)
                ? 'bg-rojo-tronadura/20 text-rojo-tronadura'
                : 'text-gris-corporativo/70 hover:bg-noche/20 hover:text-blanco-puro'
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>

      {/* User & Toggle */}
      <div className="px-2 py-2 border-t border-blanco-puro/10 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-azul-petroleo to-azul-petroleo/80 flex items-center justify-center text-xs font-bold shrink-0">
            {currentUser.nombre.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-xs font-medium truncate">{currentUser.nombre}</p>
                <p className="text-[10px] text-gris-corporativo/70 truncate">{currentUser.rol}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className="ml-auto p-1 rounded hover:bg-noche/30 transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
