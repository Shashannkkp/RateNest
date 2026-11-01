
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Star,
  ArrowUpDown,
  Users,
  MessageSquare,
} from 'lucide-react';

import OwnerLayout from '../../components/OwnerLayout';
import api from '../../services/api';

function OwnerRatings() {
  const [ratings, setRatings] = useState([]);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    api.get('/owner/ratings')
      .then((response) => {
        if (isMounted) {
          setRatings(response.ratings || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load customer ratings.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/owner/ratings');
      setRatings(response.ratings || []);
    } catch (err) {
      setError(err.message || 'Unable to load customer ratings.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRatings = useMemo(() => {
    let result = ratings.filter((item) =>
      `${item.user_name} ${item.user_email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    if (ratingFilter !== 'all') {
      result = result.filter(
        (item) => Number(item.rating) === Number(ratingFilter)
      );
    }

    if (sortOrder === 'newest') {
      result.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );
    } else if (sortOrder === 'oldest') {
      result.sort(
        (a, b) => new Date(a.updated_at) - new Date(b.updated_at)
      );
    } else if (sortOrder === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOrder === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [ratings, search, ratingFilter, sortOrder]);

  const averageRating = ratings.length
    ? (
        ratings.reduce((sum, item) => sum + Number(item.rating), 0) /
        ratings.length
      ).toFixed(1)
    : '0.0';

  return (
    <OwnerLayout
      title="Customer Ratings"
      subtitle="View feedback submitted by customers for your store."
    >
      <div className="mb-7 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Ratings
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {ratings.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={23} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Customer feedback received
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Average Rating
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {averageRating} / 5
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Star size={23} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Average of all customer ratings
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            All Customer Ratings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Search and filter your customer feedback.
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
              placeholder="Search customers..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 sm:w-64"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>

          <div className="relative">
            <ArrowUpDown
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <MessageSquare size={18} className="text-indigo-600" />

          <h3 className="font-semibold text-slate-800">
            Customer Feedback
          </h3>

          <span className="ml-auto rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {filteredRatings.length} results
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="mt-4 text-sm text-slate-500">
                Loading customer ratings...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="py-14 text-center">
            <p className="font-semibold text-red-600">
              Unable to load customer ratings
            </p>
            <p className="mt-2 text-sm text-slate-500">{error}</p>

            <button
              type="button"
              onClick={fetchRatings}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredRatings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4">Date Submitted</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRatings.map((item) => (
                  <tr key={item.user_id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.user_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.user_email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={15}
                              className={
                                star <= Number(item.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }
                            />
                          ))}
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          {item.rating}/5
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {new Date(item.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center">
            <MessageSquare size={32} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">
              No ratings found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or rating filter.
            </p>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}

export default OwnerRatings;
