
import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  X,
  ArrowUpDown,
  Star,
  ChevronLeft,
  ChevronRight,
  UserRound,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);

  const [search, setSearch] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const [pagination, setPagination] = useState({
    totalStores: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  // Load stores from the backend.
  useEffect(() => {
    let isActive = true;

    const fetchStores = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          search,
          sortBy: 'name',
          order: sortAscending ? 'asc' : 'desc',
          page: String(currentPage),
          limit: '10',
        });

        const response = await api.get(
          `/admin/stores?${params.toString()}`
        );

        if (isActive) {
          setStores(response.stores || []);
          setPagination(response.pagination || {
            totalStores: 0,
            currentPage: 1,
            totalPages: 1,
            limit: 10,
          });
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
  }, [search, sortAscending, currentPage]);

  useEffect(() => {
    let isActive = true;

    const fetchOwners = async () => {
      try {
        const params = new URLSearchParams({
          role: 'STORE_OWNER',
          sortBy: 'name',
          order: 'asc',
          page: '1',
          limit: '100',
        });

        const response = await api.get(
          `/admin/users?${params.toString()}`
        );

        if (isActive) {
          setOwners(response.users || []);
        }
      } catch (err) {
        if (isActive) {
          console.error('Unable to load Store Owners:', err.message);
        }
      }
    };

    fetchOwners();

    return () => {
      isActive = false;
    };
  }, []);

  const refreshStores = async () => {
    const params = new URLSearchParams({
      search,
      sortBy: 'name',
      order: sortAscending ? 'asc' : 'desc',
      page: String(currentPage),
      limit: '10',
    });

    const response = await api.get(
      `/admin/stores?${params.toString()}`
    );

    setStores(response.stores || []);
    setPagination(response.pagination || {
      totalStores: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 10,
    });
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError('');
    setForm({
      name: '',
      email: '',
      address: '',
      ownerId: '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccess('');

    const name = form.name.trim();
    const email = form.email.trim();
    const address = form.address.trim();

    if (!name || !email || !address) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (address.length > 400) {
      setFormError('Address cannot exceed 400 characters.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post('/admin/stores', {
        name,
        email,
        address,
      });

      const createdStore = response.store || response.data?.store;

      if (form.ownerId) {
        if (!createdStore?.id) {
          throw new Error(
            'Store was created, but its ID was not returned. Owner assignment could not be completed.'
          );
        }

        try {
          await api.put(
            `/admin/stores/${createdStore.id}/owner`,
            { ownerId: Number(form.ownerId) }
          );
        } catch (assignmentError) {
          setSuccess('Store created, but owner assignment failed.');
          setFormError(assignmentError.message);
          await refreshStores();
          return;
        }
      }

      closeForm();
      setCurrentPage(1);
      setSearch('');

      await refreshStores();

      setSuccess(
        form.ownerId
          ? 'Store created and Store Owner assigned successfully.'
          : 'Store created successfully.'
      );
    } catch (err) {
      setFormError(err.message || 'Unable to create store.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratedStores = stores.filter(
    (store) => Number(store.average_rating ?? store.rating ?? 0) > 0
  ).length;

  const pageAverageRating = stores.length
    ? stores.reduce(
        (sum, store) =>
          sum + Number(store.average_rating ?? store.rating ?? 0),
        0
      ) / stores.length
    : 0;

  return (
    <AdminLayout
      title="Store Management"
      subtitle="Create stores and manage store information across RateNest."
    >
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Total Stores</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {pagination.totalStores}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Rated Stores (Current Page)</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {ratedStores}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Average Rating (Current Page)</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {pageAverageRating.toFixed(1)}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">All Stores</h3>
            <p className="mt-1 text-[10px] text-slate-400">
              {pagination.totalStores} total stores
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search stores..."
                className="w-full bg-transparent text-xs outline-none sm:w-40"
              />
            </label>

            <button
              onClick={() => {
                setFormError('');
                setShowForm(true);
              }}
              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={16} />
              Add Store
            </button>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">
                  <button
                    onClick={() => setSortAscending((value) => !value)}
                    className="flex items-center gap-1"
                  >
                    Store <ArrowUpDown size={13} />
                  </button>
                </th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Address</th>
                <th className="px-5 py-3">Average Rating</th>
                <th className="px-5 py-3">Store Owner</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-xs text-slate-400">
                    Loading stores...
                  </td>
                </tr>
              ) : stores.length > 0 ? (
                stores.map((store) => {
                  const rating = Number(
                    store.average_rating ?? store.rating ?? 0
                  );

                  return (
                    <tr key={store.id} className="text-xs text-slate-500">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <span className="text-sm font-bold">
                              {store.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-slate-700">
                            {store.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">{store.email}</td>
                      <td className="px-5 py-4">{store.address}</td>

                      <td className="px-5 py-4">
                        {rating > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                            <Star size={14} fill="currentColor" />
                            {rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-400">No ratings yet</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {store.owner_name || store.owner_email || (
                          <span className="text-slate-400">Not assigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-xs text-slate-400">
                    No stores found.
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

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Add New Store</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Enter the store's information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-600">
                Store Name
                <input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter store name"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-600">
                Store Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="store@example.com"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-600">
                Store Address
                <textarea
                  required
                  maxLength={400}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Enter store address"
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-600">
                Assign Store Owner (Optional)
                <select
                  value={form.ownerId}
                  onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none focus:border-indigo-500"
                >
                  <option value="">No owner assigned</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-[10px] font-normal text-slate-400">
                  Only existing Store Owner accounts are listed here.
                </span>
              </label>

              {owners.length === 0 && (
                <p className="flex items-center gap-2 text-[11px] text-amber-600">
                  <UserRound size={14} />
                  No Store Owner accounts found. You can create one from User Management first.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminStores;
