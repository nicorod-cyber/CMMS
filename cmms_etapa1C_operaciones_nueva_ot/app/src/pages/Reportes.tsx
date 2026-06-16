import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Gauge, Clock, Wrench,
  Download, Calendar, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { indicadoresConfiabilidad, disponibilidadPorFaena, ordenesTrabajo } from '@/data/mockData';
import { cn } from '@/lib/utils';

const tipoOTData = [
  { name: 'Correctivo', value: ordenesTrabajo.filter(o => o.tipo === 'correctivo').length, color: '#DC2626' },
  { name: 'Preventivo', value: ordenesTrabajo.filter(o => o.tipo === 'preventivo').length, color: '#16A34A' },
  { name: 'Predictivo', value: ordenesTrabajo.filter(o => o.tipo === 'predictivo').length, color: '#0E7490' },
  { name: 'Mejora', value: ordenesTrabajo.filter(o => o.tipo === 'mejora').length, color: '#4F46E5' },
];

const backlogData = [
  { semana: 'S20', correctivo: 12, preventivo: 8, total: 20 },
  { semana: 'S21', correctivo: 15, preventivo: 6, total: 21 },
  { semana: 'S22', correctivo: 10, preventivo: 7, total: 17 },
  { semana: 'S23', correctivo: 18, preventivo: 5, total: 23 },
  { semana: 'S24', correctivo: 14, preventivo: 9, total: 23 },
  { semana: 'S25', correctivo: 11, preventivo: 10, total: 21 },
  { semana: 'S26', correctivo: 8, preventivo: 7, total: 15 },
];

export function Reportes() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reportes e Indicadores</h1>
          <p className="text-sm text-slate-500 mt-0.5">Dashboard ejecutivo de confiabilidad y mantenimiento</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              <Calendar className="w-4 h-4" />
              Junio 2024
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Disponibilidad Promedio', value: '89.4%', icon: Gauge, color: 'bg-emerald-50', iconColor: 'text-emerald-600', trend: '-2.1%', trendUp: false },
          { label: 'MTBF Promedio', value: '400 hrs', icon: TrendingUp, color: 'bg-blue-50', iconColor: 'text-blue-600', trend: '+12%', trendUp: true },
          { label: 'MTTR Promedio', value: '9.0 hrs', icon: Clock, color: 'bg-amber-50', iconColor: 'text-amber-600', trend: '-0.5 hrs', trendUp: true },
          { label: 'OTs Completadas', value: '67%', icon: Wrench, color: 'bg-cyan-50', iconColor: 'text-cyan-600', trend: '+5%', trendUp: true },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-slate-200/80 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={cn('p-2 rounded-lg', kpi.color)}>
                    <kpi.icon className={cn('w-5 h-5', kpi.iconColor)} />
                  </div>
                  <div className={cn('flex items-center gap-1 text-xs font-medium', kpi.trendUp ? 'text-emerald-600' : 'text-red-600')}>
                    {kpi.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.trend}
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-3">{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disponibilidad por Faena */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-600" /> Disponibilidad por Faena
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={disponibilidadPorFaena} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="faena" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(value: number) => [`${value}%`, 'Disponibilidad']}
                />
                <Bar dataKey="disponibilidad" fill="#0E7490" radius={[6, 6, 0, 0]} name="Disponibilidad" />
                <Bar dataKey="objetivo" fill="#94a3b8" radius={[6, 6, 0, 0]} opacity={0.4} name="Objetivo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tipo de Mantenimiento */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" /> Distribución por Tipo de Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={tipoOTData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {tipoOTData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MTBF y MTTR */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> MTBF y MTTR Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={indicadoresConfiabilidad}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="mtbf" stroke="#0E7490" strokeWidth={2.5} dot={{ r: 4, fill: '#0E7490' }} name="MTBF (hrs)" />
                <Line yAxisId="right" type="monotone" dataKey="mttr" stroke="#DC2626" strokeWidth={2.5} dot={{ r: 4, fill: '#DC2626' }} name="MTTR (hrs)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Backlog */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" /> Backlog Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={backlogData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="correctivo" stackId="1" stroke="#DC2626" fill="#DC2626" fillOpacity={0.2} name="Correctivo" />
                <Area type="monotone" dataKey="preventivo" stackId="1" stroke="#16A34A" fill="#16A34A" fillOpacity={0.2} name="Preventivo" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Disponibilidad Histórica */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-600" /> Disponibilidad Histórica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={indicadoresConfiabilidad}>
              <defs>
                <linearGradient id="dispGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[85, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Disponibilidad']} />
              <Area type="monotone" dataKey="disponibilidad" stroke="#16A34A" strokeWidth={2.5} fill="url(#dispGrad)" name="Disponibilidad (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
