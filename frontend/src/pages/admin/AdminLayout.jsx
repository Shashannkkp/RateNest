
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  Star,
  Settings,
  CircleHelp,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

function AdminLayout({ title, subtitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Stores', icon: Store, path: '/admin/stores' },
    { label: 'Ratings', icon: Star, path: '/admin/ratings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('ratenest_token');
    localStorage.removeItem('ratenest_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-slate-100 bg-white px-4 py-6 transition-transform md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Store size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-blue-950">
            RateNest
          </span>
          <button
            type="button"
            className="ml-auto text-slate-500 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <p className="mb-3 mt-12 px-3 text-[10px] font-bold tracking-[1.5px] text-slate-400">
          MAIN MENU
        </p>

        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition ${
                    isActive
                      ? 'bg-indigo-50 font-semibold text-indigo-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <p className="mb-3 mt-9 px-3 text-[10px] font-bold tracking-[1.5px] text-slate-400">
          PREFERENCES
        </p>

        <nav className="flex flex-col gap-1">
          <a
            href="#settings"
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
          >
            <Settings size={19} />
            Settings
          </a>
          <a
            href="#help"
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
          >
            <CircleHelp size={19} />
            Help & Support
          </a>
        </nav>

        <div className="mt-auto">
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <ShieldCheck size={21} className="shrink-0 text-indigo-600" />
            <div>
              <p className="text-[11px] font-semibold text-slate-700">
                Secure workspace
              </p>
              <p className="mt-1 text-[9px] text-slate-400">
                Your admin panel is protected
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[76px] shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-slate-600 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="mb-1 text-[10px] text-slate-400">
                Pages / {title}
              </p>
              <h1 className="text-lg font-bold text-slate-800">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-red-500" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-semibold text-slate-700">
                  Administrator
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  System Admin
                </p>
              </div>
              <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-[10px] font-bold tracking-[1.6px] text-indigo-600">
              ADMINISTRATION
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
              {title}
            </h2>
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          </div>

          {children}

          <footer className="flex flex-col justify-between gap-2 py-5 text-[9px] text-slate-400 sm:flex-row">
            <span>© 2026 RateNest. All rights reserved.</span>
            <span>Discover. Rate. Connect.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
