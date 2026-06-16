import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { MantenimientoOT } from '@/pages/MantenimientoOT';
import { MantenimientoSM } from '@/pages/MantenimientoSM';
import { Activos } from '@/pages/Activos';
import { Bodega } from '@/pages/Bodega';
import { Planificacion } from '@/pages/Planificacion';
import { Reportes } from '@/pages/Reportes';
import { Tecnicos } from '@/pages/Tecnicos';
import { Placeholder } from '@/pages/Placeholder';
import { Usuarios } from '@/pages/Usuarios';
import { CmmsProvider } from '@/context/CmmsContext';

function App() {
  return (
    <CmmsProvider>
      <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mantenimiento" element={<MantenimientoOT />} />
          <Route path="/mantenimiento/ot" element={<MantenimientoOT />} />
          <Route path="/mantenimiento/sm" element={<MantenimientoSM />} />
          <Route path="/mantenimiento/backlog" element={<Placeholder title="Backlog de Mantenimiento" />} />
          <Route path="/mantenimiento/checklists" element={<Placeholder title="Checklists" />} />
          <Route path="/activos" element={<Activos />} />
          <Route path="/activos/maestro" element={<Activos />} />
          <Route path="/activos/ficha" element={<Activos />} />
          <Route path="/bodega" element={<Bodega />} />
          <Route path="/bodega/stock" element={<Bodega />} />
          <Route path="/bodega/solicitudes" element={<Bodega />} />
          <Route path="/bodega/kardex" element={<Placeholder title="Kardex de Movimientos" />} />
          <Route path="/bodega/criticos" element={<Bodega />} />
          <Route path="/planificacion" element={<Planificacion />} />
          <Route path="/planificacion/semanal" element={<Planificacion />} />
          <Route path="/planificacion/mensual" element={<Planificacion />} />
          <Route path="/planificacion/asignacion" element={<Planificacion />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/tecnicos" element={<Tecnicos />} />
          <Route path="/documentos" element={<Placeholder title="Documentos" />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracion" element={<Placeholder title="Configuración" />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </CmmsProvider>
  );
}

export default App;
