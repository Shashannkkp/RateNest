
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Store,
  Star,
  MapPin,
  ArrowUpDown,
  X,
} from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import api from '../../services/api';

function UserStores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [ratings, setRatings] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingStore, setSubmittingStore] = useState(null);

  // Fetch stores from the backend.
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

  // Sort the stores without changing the original state.
  const filteredStores = useMemo(() => {
    const result = [...stores];

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'highest') {
      result.sort(
        (a, b) =>
          Number(b.average_rating || 0) -
          Number(a.average_rating || 0)
      );
    } else if (sortBy === 'lowest') {
      result.sort(
        (a, b) =>
          Number(a.average_rating || 0) -
          Number(b.average_rating || 0)
      );
    }

    return result;
  }, [stores, sortBy]);

  // Save or update a store rating in the database.
  const submitRating = async (storeId) => {
    const rating = ratings[storeId];

    if (!rating) {
      setMessageType('error');
      setMessage('Please select a rating first.');
      return;
    }

    try {
      setSubmittingStore(storeId);
      setMessage('');

      await api.post(`/ratings/${storeId}`, {
        rating: Number(rating),
      });

      // Refresh store ratings after saving.
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set('search', search.trim());
      }

      const query = params.toString();
      const response = await api.get(
        `/stores${query ? `?${query}` : ''}`
      );

      setStores(response.stores || []);

      setRatings((previous) => {
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

  return (
    <UserLayout
      title="Browse Stores"
      subtitle="Discover stores and share your experience."
    >
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            All Stores
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Explore stores and see what other customers think.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search stores..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 sm:w-64"
            />
          </div>

          <div className="relative">
            <ArrowUpDown
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-8 text-sm outline-none focus:border-indigo-500 sm:w-48"
            >
              <option value="default">Default order</option>
              <option value="name">Store name</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
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
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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

            const currentRating =
              ratings[store.id] ?? myRating ?? 0;

            return (
              <div
                key={store.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900">
                      {store.name}
                    </h3>

                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={16} className="shrink-0" />
                      {store.address}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                        <Star
                          size={15}
                          className="fill-amber-400 text-amber-400"
                        />
                        {averageRating.toFixed(1)} / 5
                      </span>

                      <span className="text-xs text-slate-500">
                        {totalRatings} customer ratings
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 lg:w-64 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {myRating
                        ? 'Update your rating'
                        : 'Rate this store'}
                    </p>

                    <div className="mt-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          disabled={submittingStore === store.id}
                          aria-label={`Rate ${value} out of 5`}
                          onClick={() =>
                            setRatings((previous) => ({
                              ...previous,
                              [store.id]: value,
                            }))
                          }
                          className="rounded-md p-1 transition hover:scale-110 disabled:cursor-not-allowed"
                        >
                          <Star
                            size={23}
                            className={
                              value <= currentRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }
                          />
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={
                        !ratings[store.id] ||
                        submittingStore === store.id
                      }
                      onClick={() => submitRating(store.id)}
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
                        Your rating: {myRating} / 5
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
              Try a different search.
            </p>
          </div>
        )}
      </div>
    </UserLayout>
  );
}

export default UserStores;
