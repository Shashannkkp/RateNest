
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  LockKeyhole,
  LogOut,
  UserRound,
} from 'lucide-react';

function UserLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  const navigation = [
    { label: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { label: 'Browse Stores', href: '/user/stores', icon: Store },
    { label: 'Change Password', href: '/user/change-password', icon: LockKeyhole },
  ];

  const handleLogout = () => {
    localStorage.removeItem('ratenest_token');
    localStorage.removeItem('ratenest_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">RateNest</h1>
            <p className="text-xs text-slate-500">Better choices, together.</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <UserRound size={20} className="text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Normal User</p>
              <p className="text-xs text-slate-500">USER</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center border-b border-slate-200 bg-white px-5 sm:px-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-5 sm:p-8">
          {children}
        </section>
      </main>
    </div>
  );
}

export default UserLayout;
