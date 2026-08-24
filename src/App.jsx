import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Training from './pages/Training';
import Logbook from './pages/Logbook';
import Nutrition from './pages/Nutrition';
import Devices from './pages/Devices';

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
              <Route path="/logbuch" element={<Logbook />} />
              <Route path="/ernaehrung" element={<Nutrition />} />
              <Route path="/geraete" element={<Devices />} />

              <Route path="/training/:tab" element={<Training />} />
              <Route path="/training" element={<Training />} />

              {/* Alte Direktlinks bleiben funktionsfähig und führen zum jeweiligen Trainings-Tab. */}
              <Route path="/plan" element={<Navigate to="/training/gym" replace />} />
              <Route path="/laufplan" element={<Navigate to="/training/laufen" replace />} />
              <Route path="/basketball" element={<Navigate to="/training/basketball" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </Gate>
    </AppProvider>
  );
}
