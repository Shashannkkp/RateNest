
import { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Store,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const statCards = [
  {
    title: 'Total Users',
    key: 'totalUsers',
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Total Stores',
    key: 'totalStores',
    icon: Store,
    color: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'Total Ratings',
    key: 'totalRatings',
    icon: Star,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    title: 'Average Rating',
    key: 'averageRating',
    icon: Activity,
    color: 'bg-green-50 text-green-600',
  },
];

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard', active: true },
  { label: 'Users', icon: Users, href: '/admin/users' },
  { label: 'Stores', icon: Store, href: '/admin/stores' },
  { label: 'Ratings', icon: Star, href: '/admin/ratings' },
];

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString('en-IN');
};

const formatDate = (date) => {
  if (!date) return 'N/A';

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0,
  });

  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [recentRatings, setRecentRatings] = useState([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(true);

  const [dashboardError, setDashboardError] = useState('');
  const [ratingsError, setRatingsError] = useState('');

  const navigate = useNavigate();

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError('');

        const response = await api.get('/admin/dashboard');

        setStats({
          totalUsers: response.stats?.totalUsers ?? 0,
          totalStores: response.stats?.totalStores ?? 0,
          totalRatings: response.stats?.totalRatings ?? 0,
          averageRating: response.stats?.averageRating ?? 0,
        });

        setRatingDistribution(response.ratingDistribution || []);
      } catch (error) {
        setDashboardError(error.message);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch the latest five ratings
  useEffect(() => {
    let isActive = true;

    const fetchRecentRatings = async () => {
      try {
        setRatingsLoading(true);
        setRatingsError('');

        const query = new URLSearchParams({
          search: search.trim(),
          sortBy: 'created_at',
          order: 'desc',
          page: '1',
          limit: '5',
        });

        const response = await api.get(`/admin/ratings?${query.toString()}`);

        if (isActive) {
          setRecentRatings(response.ratings || []);
        }
      } catch (error) {
        if (isActive) {
          setRatingsError(error.message);
        }
      } finally {
        if (isActive) {
          setRatingsLoading(false);
        }
      }
    };

    fetchRecentRatings();

    return () => {
      isActive = false;
    };
  }, [search]);

  const handleLogout = () => {
    localStorage.removeItem('ratenest_token');
    localStorage.removeItem('ratenest_user');
    navigate('/login', { replace: true });
  };

  const maximumRatingCount = Math.max(
    1,
    ...ratingDistribution.map((item) => Number(item.count || 0))
  );

  const platformActivity = [
    {
      title: 'Registered users',
      description: 'People using RateNest',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Listed stores',
      description: 'Stores available to rate',
      value: stats.totalStores,
      icon: Store,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      title: 'Customer ratings',
      description: 'Total submitted ratings',
      value: stats.totalRatings,
      icon: Star,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-slate-100 bg-white px-4 py-6 transition-transform duration-300 md:relative md:translate-x-0 ${
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
            className="ml-auto text-slate-500 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="mb-3 mt-12 px-3 text-[10px] font-bold tracking-[1.5px] text-slate-400">
          MAIN MENU
        </div>

        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition ${
                  item.active
                    ? 'bg-indigo-50 font-semibold text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <Icon size={19} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="mb-3 mt-9 px-3 text-[10px] font-bold tracking-[1.5px] text-slate-400">
          PREFERENCES
        </div>

        <nav className="flex flex-col gap-1">
          <a
            href="#settings"
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600"
          >
            <Settings size={19} />
            Settings
          </a>

          <a
            href="#help"
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600"
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
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Header */}
        <header className="flex h-[76px] shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="text-slate-600 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="mb-1 text-[10px] text-slate-400">
                Pages / Dashboard
              </p>
              <h1 className="text-lg font-bold text-slate-800">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <label className="hidden h-10 w-52 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 md:flex">
              <Search size={17} />
              <input
  type="search"
  placeholder="Search ratings..."
  value={search}
  onChange={(event) => setSearch(event.target.value)}
  className="w-full min-w-0 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
/>
            </label>

            <button
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

        {/* Scrollable dashboard content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">

          {/* Welcome */}
          <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[1.6px] text-indigo-600">
                OVERVIEW
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                Welcome back, Admin 👋
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Here's what's happening with your RateNest platform.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-500">
              <Activity size={16} />
              Live platform statistics
            </div>
          </section>

          {/* Dashboard error */}
          {dashboardError && (
            <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
              Unable to load dashboard statistics: {dashboardError}
            </div>
          )}

          {/* Statistics */}
          <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              const value = stats[stat.key];

              return (
                <article
                  key={stat.title}
                  className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/50"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                      <Icon size={21} />
                    </div>

                    <button
                      className="text-slate-300"
                      aria-label={`More about ${stat.title}`}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <p className="mt-4 text-xs font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-800">
                    {dashboardLoading
                      ? '...'
                      : stat.key === 'averageRating'
                        ? Number(value).toFixed(2)
                        : formatNumber(value)}
                  </h3>

                  <div className="mt-3 text-[10px] text-slate-400">
                    Live data from PostgreSQL
                  </div>
                </article>
              );
            })}
          </section>

          {/* Rating and activity cards */}
          <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-2">

            {/* Rating distribution */}
            <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Rating Distribution
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Customer feedback across all stores
                  </p>
                </div>

                <button className="text-slate-400" aria-label="Rating options">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-7 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="flex flex-col items-center justify-center">
                  <strong className="text-5xl font-bold tracking-tight text-slate-800">
                    {dashboardLoading
                      ? '...'
                      : Number(stats.averageRating).toFixed(2)}
                  </strong>

                  <div className="mt-2 flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={16}
                        fill="currentColor"
                      />
                    ))}
                  </div>

                  <p className="mt-2 text-[10px] text-slate-400">
                    Average platform rating
                  </p>
                </div>

                <div className="flex flex-col justify-center gap-3">
                  {ratingDistribution.map((item) => {
                    const count = Number(item.count || 0);
                    const width = (count / maximumRatingCount) * 100;

                    return (
                      <div
                        key={item.rating}
                        className="grid grid-cols-[25px_1fr_40px] items-center gap-2"
                      >
                        <span className="text-[10px] text-slate-500">
                          {item.rating} ★
                        </span>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>

                        <span className="text-right text-[10px] text-slate-400">
                          {formatNumber(count)}
                        </span>
                      </div>
                    );
                  })}

                  {!dashboardLoading && ratingDistribution.length === 0 && (
                    <p className="text-center text-xs text-slate-400">
                      No ratings available yet.
                    </p>
                  )}
                </div>
              </div>
            </article>

            {/* Platform activity */}
            <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Platform Activity
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Current platform summary
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1.5 text-[9px] font-semibold text-green-600">
                  Live overview
                </span>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {platformActivity.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 py-4"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-700">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {item.description}
                        </p>
                      </div>

                      <strong className="text-sm text-slate-800">
                        {dashboardLoading ? '...' : formatNumber(item.value)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          {/* Recent ratings */}
          <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm shadow-slate-100/50">
            <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Recent Ratings
                </h3>

                <p className="mt-1 text-[10px] text-slate-400">
                  Latest customer feedback across stores
                </p>
              </div>

              <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 sm:w-52">
                <Search size={16} />

                <input
                  type="search"
                  placeholder="Search ratings..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full min-w-0 bg-transparent text-[11px] outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            {ratingsError && (
              <div className="mx-5 mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                Unable to load recent ratings: {ratingsError}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Store</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentRatings.map((rating) => (
                    <tr key={rating.id} className="text-[10px] text-slate-500">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                            {rating.user_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-700">
                              {rating.user_name}
                            </p>

                            <p className="mt-1 text-[9px] text-slate-400">
                              {rating.user_email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        {rating.store_name}
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                          <Star size={14} fill="currentColor" />
                          {Number(rating.rating).toFixed(1)}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        {formatDate(rating.created_at)}
                      </td>

                      <td className="px-5 py-3">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-semibold text-green-600">
                          Published
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!ratingsLoading && recentRatings.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-10 text-center text-xs text-slate-400"
                      >
                        No matching ratings found.
                      </td>
                    </tr>
                  )}

                  {ratingsLoading && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-10 text-center text-xs text-slate-400"
                      >
                        Loading recent ratings...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-5 py-3 text-[9px] text-slate-400 sm:flex-row">
              <span>
                Showing {recentRatings.length} recent ratings
              </span>
              <span>Data retrieved from PostgreSQL</span>
            </div>
          </section>

          {/* Footer */}
          <footer className="flex flex-col justify-between gap-2 py-5 text-[9px] text-slate-400 sm:flex-row">
            <span>© 2026 RateNest. All rights reserved.</span>
            <span>Discover. Rate. Connect.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
