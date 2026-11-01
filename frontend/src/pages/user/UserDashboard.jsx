
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Store,
  Star,
  LockKeyhole,
  LogOut,
  Search,
  Menu,
  X,
  MapPin,
  ArrowUpDown,
  UserRound,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';

function UserDashboard() {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedRating, setSelectedRating] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(true);
  const [submittingStore, setSubmittingStore] = useState(null);
  const [error, setError] = useState('');

  const [user] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('ratenest_user') || '{}');
  } catch {
    return {};
  }
});

  // Load stores from the backend.
  useEffect(() => {
    let isActive = true;

    const fetchStores = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set('search', search.trim());
        }

        const query = params.toString();
        const response = await api.get(
          `/stores${query ? `?${query}` : ''}`
        );

        if (isActive) {
          setStores(response.stores || []);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || 'Unable to load stores.');
          setStores([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchStores();

    return () => {
      isActive = false;
    };
  }, [search]);

  // Update the displayed stores whenever the user sorts them.
  const filteredStores = useMemo(() => {
    const result = [...stores];

    if (sortOrder === 'highest') {
      result.sort(
        (a, b) =>
          Number(b.average_rating || 0) -
          Number(a.average_rating || 0)
      );
    }

    if (sortOrder === 'lowest') {
      result.sort(
        (a, b) =>
          Number(a.average_rating || 0) -
          Number(b.average_rating || 0)
      );
    }

    if (sortOrder === 'name') {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [stores, sortOrder]);

  const ratedStores = stores.filter(
    (store) => store.my_rating !== null && store.my_rating !== undefined
  ).length;

  // Submit a new rating or update an existing rating.
  const handleRatingSubmit = async (storeId) => {
    const rating = selectedRating[storeId];

    if (!rating) {
      setMessageType('error');
      setMessage('Please select a rating before submitting.');
      return;
    }

    try {
      setSubmittingStore(storeId);
      setMessage('');

      await api.post(`/ratings/${storeId}`, {
        rating: Number(rating),
      });

      // Reload store information so the average and personal rating
      // reflect the latest database values.
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set('search', search.trim());
      }

      const query = params.toString();
      const response = await api.get(
        `/stores${query ? `?${query}` : ''}`
      );

      setStores(response.stores || []);

      setSelectedRating((previous) => {
        const updated = { ...previous };
        delete updated[storeId];
        return updated;
      });

      setMessageType('success');
      setMessage('Your rating has been saved successfully!');
    } catch (err) {
      setMessageType('error');
      setMessage(err.message || 'Unable to save your rating.');
    } finally {
      setSubmittingStore(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ratenest_token');
    localStorage.removeItem('ratenest_user');
    navigate('/login');
  };

  const navigation = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/user/dashboard',
    },
    {
      label: 'Browse Stores',
      icon: Store,
      href: '/user/stores',
    },
    {
      label: 'Change Password',
      icon: LockKeyhole,
      href: '/user/change-password',
    },
  ];

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Store size={22} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            RateNest
          </h1>
          <p className="text-xs text-slate-500">
            Better choices, together.
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <UserRound size={20} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user.name || 'Normal User'}
            </p>
            <p className="text-xs text-slate-500">USER</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={19} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 lg:block">
        {sidebar}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />

          <aside className="relative h-full w-72 max-w-[85vw] shadow-xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-5 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>

            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                User Dashboard
              </h2>
              <p className="hidden text-sm text-slate-500 sm:block">
                Discover stores and share your experience.
              </p>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <UserRound size={20} />
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-indigo-600">
              GOOD STORES. BETTER CHOICES.
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Explore stores, check customer ratings, and share your feedback.
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                messageType === 'success'
                  ? 'border-indigo-100 bg-indigo-50 text-indigo-700'
                  : 'border-red-100 bg-red-50 text-red-700'
              }`}
            >
              {message}

              <button
                onClick={() => setMessage('')}
                aria-label="Dismiss message"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Available Stores
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? '—' : stores.length}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Store size={23} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Stores available to explore
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Stores Rated By You
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? '—' : ratedStores}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <Star size={23} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Your submitted store ratings
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Explore Stores
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search stores and submit your ratings.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search stores..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
                />
              </div>

              <div className="relative">
                <ArrowUpDown
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-8 text-sm text-slate-700 outline-none focus:border-indigo-500 sm:w-48"
                >
                  <option value="default">Default order</option>
                  <option value="name">Store name</option>
                  <option value="highest">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center text-sm text-slate-500">
                Loading stores...
              </div>
            ) : filteredStores.length > 0 ? (
              filteredStores.map((store) => {
                const averageRating = Number(store.average_rating || 0);
                const totalRatings = Number(store.total_ratings || 0);
                const myRating = store.my_rating ?? null;
                const currentSelection =
                  selectedRating[store.id] ?? myRating ?? 0;

                return (
                  <div
                    key={store.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                          {store.name}
                        </h3>

                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <MapPin size={16} className="shrink-0" />
                          {store.address}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                            <Star size={15} className="fill-amber-400 text-amber-400" />
                            {averageRating.toFixed(1)} / 5
                          </span>

                          <span className="text-xs text-slate-500">
                            {totalRatings} customer ratings
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 lg:w-64 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {myRating ? 'Update your rating' : 'Rate this store'}
                        </p>

                        <div className="mt-3 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              disabled={submittingStore === store.id}
                              onClick={() =>
                                setSelectedRating((previous) => ({
                                  ...previous,
                                  [store.id]: rating,
                                }))
                              }
                              aria-label={`Rate ${rating} out of 5`}
                              className="rounded-md p-1 transition hover:scale-110 disabled:cursor-not-allowed"
                            >
                              <Star
                                size={23}
                                className={
                                  rating <= currentSelection
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }
                              />
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRatingSubmit(store.id)}
                          disabled={
                            !selectedRating[store.id] ||
                            submittingStore === store.id
                          }
                          className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                        >
                          {submittingStore === store.id
                            ? 'Saving...'
                            : myRating
                              ? 'Update Rating'
                              : 'Submit Rating'}
                        </button>

                        {myRating && (
                          <p className="mt-2 text-xs text-slate-500">
                            Your current rating: {myRating} / 5
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
                <Store size={32} className="mx-auto text-slate-300" />

                <p className="mt-3 font-semibold text-slate-700">
                  No stores found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try searching with another store name or address.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;
