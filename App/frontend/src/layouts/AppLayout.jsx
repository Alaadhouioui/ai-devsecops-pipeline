import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, Database, Gauge, GitBranch, LogOut, RadioTower, Shield, Wind } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/modules', label: 'Monitoring', icon: RadioTower },
  { to: '/security', label: 'AI Security', icon: Shield },
  { to: '/logs', label: 'Logs', icon: Database },
  { to: '/devsecops', label: 'DevSecOps', icon: GitBranch }
];

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logoutSession } = useAuth();

  function logout() {
    logoutSession();
    navigate('/login');
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
      <aside className="glass sticky top-0 z-20 h-auto border-r border-cyan-200/10 p-5 lg:h-screen">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10">
            <Wind className="h-6 w-6 text-cyan-200" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">AeroSec Tower</h1>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">I-TWR Lab</p>
          </div>
        </div>

        <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-w-max items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  isActive ? 'bg-cyan-300/15 text-cyan-100 shadow-glow' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm text-cyan-100">
            <Bell className="h-4 w-4" />
            {user?.name || 'Demo User'}
          </div>
          <p className="mt-2 text-xs text-slate-400">{user?.role || 'Operator'} access profile</p>
          <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="grid-bg p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
