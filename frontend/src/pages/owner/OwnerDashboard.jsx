
import { useEffect, useState } from 'react';
import {
  Star,
  Users,
  TrendingUp,
  Store,
  MapPin,
} from 'lucide-react';

import OwnerLayout from '../../components/OwnerLayout';
import api from '../../services/api';

function OwnerDashboard() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/owner/dashboard');
      setStore(response.store || null);
    } catch (err) {
      setError(err.message || 'Unable to load store dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    api.get('/owner/dashboard')
      .then((response) => {
        if (isMounted) {
          setStore(response.store || null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load store dashboard.');
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

  const ratingDistribution = store
    ? [
        { stars: 5, count: Number(store.five_star_ratings || 0) },
        { stars: 4, count: Number(store.four_star_ratings || 0) },
        { stars: 3, count: Number(store.three_star_ratings || 0) },
        { stars: 2, count: Number(store.two_star_ratings || 0) },
        { stars: 1, count: Number(store.one_star_ratings || 0) },
      ]
    : [];

  const stats = store
    ? [
        {
          label: 'Average Rating',
          value: Number(store.average_rating || 0).toFixed(1),
          icon: Star,
          color: 'bg-amber-50 text-amber-600',
          description: 'Overall customer rating',
        },
        {
          label: 'Total Ratings',
          value: Number(store.total_ratings || 0),
          icon: Users,
          color: 'bg-indigo-50 text-indigo-600',
          description: 'Customers who rated your store',
        },
        {
          label: 'Five-Star Ratings',
          value: Number(store.five_star_ratings || 0),
          icon: TrendingUp,
          color: 'bg-green-50 text-green-600',
          description: 'Customers who gave 5 stars',
        },
      ]
    : [];

  const averageRating = Number(store?.average_rating || 0);
  const totalRatings = Number(store?.total_ratings || 0);

  return (
    <OwnerLayout
      title="Store Dashboard"
      subtitle="Monitor your store's customer feedback and performance."
    >
      {loading ? (
        <div className="flex min-h-80 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading your store dashboard...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">
            Unable to load dashboard
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : !store ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-800">
            No store has been assigned to your account.
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Please contact your System Administrator.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="text-sm font-medium text-indigo-600">
              STORE PERFORMANCE
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Welcome, Store Owner!
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Here's an overview of your store's customer ratings.
            </p>
          </div>

          {/* Assigned store */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Store size={27} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Your Assigned Store
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {store.name}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} />
                  {store.address}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>

                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                      <Icon size={23} />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Rating overview */}
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Overall Store Rating
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Average rating given by all customers.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-slate-900">
                  {averageRating.toFixed(1)}
                </p>

                <div className="mt-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={25}
                      className={
                        star <= Math.round(averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }
                    />
                  ))}
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Based on {totalRatings} ratings
                </p>
              </div>
            </div>

            {/* Rating distribution */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Rating Distribution
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Breakdown of customer ratings.
              </p>

              <div className="mt-7 space-y-5">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <span className="flex w-12 items-center gap-1 text-sm font-medium text-slate-600">
                      {item.stars}
                      <Star
                        size={14}
                        className="fill-amber-400 text-amber-400"
                      />
                    </span>

                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{
                          width: `${
                            totalRatings > 0
                              ? (item.count / totalRatings) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <span className="w-8 text-right text-sm text-slate-500">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </OwnerLayout>
  );
}

export default OwnerDashboard;