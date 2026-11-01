
import { useEffect, useState } from 'react';
import {
  Search,
  ArrowUpDown,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';

function AdminRatings() {
  const [ratings, setRatings] = useState([]);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [sortNewest, setSortNewest] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    fiveStarRatings: 0,
  });

  const [pagination, setPagination] = useState({
    totalRatings: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchRatings = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          search,
          sortBy: 'created_at',
          order: sortNewest ? 'desc' : 'asc',
          page: String(currentPage),
          limit: '10',
        });

        if (ratingFilter !== 'ALL') {
          params.set('rating', ratingFilter);
        }

        const response = await api.get(
          `/admin/ratings?${params.toString()}`
        );

        if (isActive) {
          setRatings(response.ratings || []);
          setPagination(response.pagination || {
            totalRatings: 0,
            currentPage: 1,
            totalPages: 1,
            limit: 10,
          });
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || 'Unable to load ratings.');
          setRatings([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchRatings();

    return () => {
      isActive = false;
    };
  }, [search, ratingFilter, sortNewest, currentPage]);

  useEffect(() => {
    let isActive = true;

    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');

        if (isActive) {
          const distribution = response.ratingDistribution || [];
          const fiveStar = distribution.find(
            (item) => Number(item.rating) === 5
          );

          setStats({
            totalRatings: Number(response.stats?.totalRatings || 0),
            averageRating: Number(response.stats?.averageRating || 0),
            fiveStarRatings: Number(fiveStar?.count || 0),
          });
        }
      } catch (err) {
        console.error('Unable to load rating statistics:', err.message);
      }
    };

    fetchStats();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRatingFilter = (value) => {
    setRatingFilter(value);
    setCurrentPage(1);
  };

  return (
    <AdminLayout
      title="Ratings Management"
      subtitle="Review customer ratings and monitor feedback submitted across stores."
    >
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Total Ratings</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {stats.totalRatings}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Average Rating</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {stats.averageRating.toFixed(1)} / 5
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Five-Star Ratings</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {stats.fiveStarRatings}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">All Ratings</h3>
            <p className="mt-1 text-[10px] text-slate-400">
              {pagination.totalRatings} matching ratings
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search ratings..."
                className="w-full bg-transparent text-xs outline-none sm:w-40"
              />
            </label>

            <select
              value={ratingFilter}
              onChange={(e) => handleRatingFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >
              <option value="ALL">All ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <button
              onClick={() => setSortNewest((value) => !value)}
              className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <ArrowUpDown size={14} />
              {sortNewest ? 'Newest first' : 'Oldest first'}
            </button>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Submitted Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-5 py-10 text-center text-xs text-slate-400">
                    Loading ratings...
                  </td>
                </tr>
              ) : ratings.length > 0 ? (
                ratings.map((item) => (
                  <tr key={item.id} className="text-xs text-slate-500">
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {item.user_name}
                    </td>

                    <td className="px-5 py-4">{item.store_name}</td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <Star size={14} fill="currentColor" />
                        {Number(item.rating).toFixed(1)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
                        : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-5 py-10 text-center text-xs text-slate-400">
                    No matching ratings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row">
          <p className="text-xs text-slate-500">
            Page {pagination.currentPage} of {Math.max(pagination.totalPages, 1)}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((page) => page - 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <button
              disabled={currentPage >= pagination.totalPages || loading}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminRatings;
