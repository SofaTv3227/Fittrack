import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, User, Dumbbell, NotebookPen, Apple, Watch, Flame } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/profil', label: 'Profil', icon: User },
  { to: '/training', label: 'Training', icon: Dumbbell },
  { to: '/logbuch', label: 'Logbuch', icon: NotebookPen },
  { to: '/ernaehrung', label: 'Ernährung', icon: Apple },
  { to: '/geraete', label: 'Geräte', icon: Watch },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:flex md:flex-col w-[240px] shrink-0 border-r p-5 gap-1"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-8 px-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
            <Flame size={20} color="#1a0e05" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">FitTrack</span>
        </div>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`
            }
            style={({ isActive }) => ({ background: isActive ? 'var(--accent-soft)' : 'transparent' })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <div className="mt-auto px-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          Alle Daten lokal gespeichert · offline verfügbar
        </div>
      </aside>

      <main className="flex-1 content-area p-4 md:p-8 max-w-[1200px] w-full mx-auto">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center py-2 border-t z-20"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
