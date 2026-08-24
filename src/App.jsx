import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Plan from './pages/Plan';
import Logbook from './pages/Logbook';
import Nutrition from './pages/Nutrition';
import Devices from './pages/Devices';
import RunningPlan from './pages/RunningPlan';

function Gate({ children }) {
  const { ready } = useApp();
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
        Lade FitTrack…
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <Gate>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/logbuch" element={<Logbook />} />
              <Route path="/ernaehrung" element={<Nutrition />} />
              <Route path="/geraete" element={<Devices />} />
              <Route path="/laufplan" element={<RunningPlan />} />
            </Route>
          </Routes>
        </HashRouter>
      </Gate>
    </AppProvider>
  );
}
