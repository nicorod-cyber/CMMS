import { cn } from '@/lib/utils';
import type { Criticidad, EstadoOT, EstadoSM, EstadoRepuesto, EstadoSR } from '@/types';

const criticidadConfig: Record<Criticidad, { label: string; className: string; dot: string }> = {
  baja: { label: 'Baja', className: 'bg-verde-seguridad/15 text-verde-seguridad border-verde-seguridad/40', dot: 'bg-verde-seguridad' },
  media: { label: 'Media', className: 'bg-ambar-faena/15 text-ambar-faena border-ambar-faena/40', dot: 'bg-ambar-faena' },
  alta: { label: 'Alta', className: 'bg-ambar-faena/20 text-ambar-faena border-ambar-faena/50', dot: 'bg-ambar-faena' },
  critica: { label: 'Crítica', className: 'bg-rojo-tronadura/15 text-rojo-tronadura border-rojo-tronadura/40', dot: 'bg-rojo-tronadura' },
};

const estadoOTConfig: Record<EstadoOT, { label: string; className: string }> = {
  abierta: { label: 'Abierta', className: 'bg-ambar-faena/15 text-ambar-faena border-ambar-faena/40' },
  en_progreso: { label: 'En Progreso', className: 'bg-ambar-faena/15 text-ambar-faena border-ambar-faena/40' },
  en_espera: { label: 'En Espera', className: 'bg-ambar-faena/15 text-ambar-faena border-ambar-faena/40' },
  completada: { label: 'Completada', className: 'bg-verde-seguridad/15 text-verde-seguridad border-verde-seguridad/40' },
  validada: { label: 'Validada', className: 'bg-azul-petroleo/15 text-azul-petroleo border-azul-petroleo/40' },
  cerrada: { label: 'Cerrada', className: 'bg-verde-seguridad/15 text-verde-seguridad border-verde-seguridad/40' },
  reprogramada: { label: 'Reprog.', className: 'bg-indigo-tecnico/15 text-indigo-tecnico border-indigo-tecnico/40' },
};

const estadoSMConfig: Record<EstadoSM, { label: string; className: string }> = {
  nueva: { label: 'Nueva', className: 'bg-acero-claro text-noche border-gris-corporativo' },
  en_revision: { label: 'En Revisión', className: 'bg-ambar-faena/15 text-ambar-faena border-ambar-faena/40' },
  aprobada: { label: 'Aprobada', className: 'bg-verde-seguridad/15 text-verde-seguridad border-verde-seguridad/40' },
  rechazada: { label: 'Rechazada', className: 'bg-rojo-tronadura/15 text-rojo-tronadura border-rojo-tronadura/40' },
  convertida: { label: 'Convertida', className: 'bg-indigo-tecnico/15 text-indigo-tecnico border-indigo-tecnico/40' },
};

const estadoSRConfig: Record<"pendiente" | "aprobada" | "en_preparacion" | "despachada" | "entregada" | "rechazada", { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-ambar-faena/15 text-ambar-faena border-ambar-faena/40' },
  aprobada: { label: 'Aprobada', className: 'bg-verde-seguridad/15 text-verde-seguridad border-verde-seguridad/40' },
  en_preparacion: { label: 'En Preparación', className: 'bg-blue-600/10 text-blue-600 border-blue-200' },
  despachada: { label: 'Despachada', className: 'bg-azul-petroleo/15 text-azul-petroleo border-azul-petroleo/40' },
  entregada: { label: 'Entregada', className: 'bg-verde-seguridad/15 text-verde-seguridad border-verde-seguridad/40' },
  rechazada: { label: 'Rechazada', className: 'bg-rojo-tronadura/15 text-rojo-tronadura border-rojo-tronadura/40' },
};

const estadoRepuestoConfig: Record<EstadoRepuesto, { label: string; className: string }> = {
  disponible: { label: 'Disponible', className: 'bg-verde-seguridad/15 text-verde-seguridad border-verde-seguridad/40' },
  bajo_stock: { label: 'Bajo Stock', className: 'bg-ambar-faena/15 text-ambar-faena border-ambar-faena/40' },
  sin_stock: { label: 'Sin Stock', className: 'bg-rojo-tronadura/15 text-rojo-tronadura border-rojo-tronadura/40' },
  en_transito: { label: 'En Tránsito', className: 'bg-azul-petroleo/15 text-azul-petroleo border-azul-petroleo/40' },
};

interface StatusBadgeProps {
  type: 'criticidad' | 'estadoOT' | 'estadoSM' | 'estadoSR' | 'estadoRepuesto' | 'tag';
  value: Criticidad | EstadoOT | EstadoSM | EstadoSR | EstadoRepuesto | string;
  showDot?: boolean;
  className?: string;
}

interface TagBadgeProps {
  type: 'tag';
  value: string;
  showDot?: boolean;
  className?: string;
}

export type StatusBadgeTypes = StatusBadgeProps | TagBadgeProps;

export function StatusBadge({ type, value, showDot = true, className }: StatusBadgeProps) {
  let config: { label: string; className: string; dot?: string } | undefined;

  if (type === 'criticidad') config = criticidadConfig[value as Criticidad];
  else if (type === 'estadoOT') config = estadoOTConfig[value as EstadoOT];
  else if (type === 'estadoSM') config = estadoSMConfig[value as EstadoSM];
  else if (type === 'estadoSR') config = estadoSRConfig[value as keyof typeof estadoSRConfig];
  else if (type === 'estadoRepuesto') config = estadoRepuestoConfig[value as EstadoRepuesto];
  else if (type === 'tag') config = { label: value as string, className: 'bg-slate-100 text-slate-700 border-slate-200' };

  if (!config) return null;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border',
      config.className,
      className
    )}>
      {showDot && config.dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      )}
      {config.label}
    </span>
  );
}

export function EstadoOperativoBadge({ estado }: { estado: string }) {
  const configs: Record<string, { label: string; className: string; dot: string }> = {
    disponible: { label: 'Disponible', className: 'bg-verde-seguridad/15 text-verde-seguridad border-verde-seguridad/40', dot: 'bg-verde-seguridad' },
    en_mantenimiento: { label: 'En Mant.', className: 'bg-ambar-faena/20 text-ambar-faena border-ambar-faena/40', dot: 'bg-ambar-faena' },
    detenido: { label: 'Detenido', className: 'bg-rojo-tronadura/15 text-rojo-tronadura border-rojo-tronadura/40', dot: 'bg-rojo-tronadura' },
    operando: { label: 'Operando', className: 'bg-azul-petroleo/15 text-azul-petroleo border-azul-petroleo/40', dot: 'bg-azul-petroleo' },
  };
  const cfg = configs[estado] || configs.disponible;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-md border', cfg.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
