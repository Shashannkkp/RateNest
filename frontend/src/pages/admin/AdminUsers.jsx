import { useEffect, useState } from 'react';
import { Plus, Search, X, ArrowUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortAscending, setSortAscending] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [showForm, setShowForm] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalUsers: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER',
    storeId: '',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams({
          search,
          sortBy,
          order: sortAscending ? 'asc' : 'desc',
          page: String(currentPage),
          limit: '10',
        });

        if (roleFilter !== 'ALL') {
          params.set('role', roleFilter);
        }

        const response = await api.get(`/admin/users?${params.toString()}`);

        if (isActive) {
          setUsers(response.users || []);
          setPagination(response.pagination || {
            totalUsers: 0,
            currentPage: 1,
            totalPages: 1,
            limit: 10,
          });
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || 'Unable to load users.');
          setUsers([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isActive = false;
    };
  }, [search, roleFilter, sortBy, sortAscending, currentPage]);

  useEffect(() => {
    if (!showForm || form.role !== 'STORE_OWNER') {
      return;
    }

    let isActive = true;

    const fetchStores = async () => {
      try {
        setStoresLoading(true);
        setFormError('');

        const response = await api.get('/admin/stores?limit=100');

        if (isActive) {
          setStores(
            (response.stores || []).filter((store) => !store.owner_id)
          );
        }
      } catch (err) {
        if (isActive) {
          setStores([]);
          setFormError(err.message || 'Unable to load available stores.');
        }
      } finally {
        if (isActive) {
          setStoresLoading(false);
        }
      }
    };

    fetchStores();

    return () => {
      isActive = false;
    };
  }, [showForm, form.role]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortAscending((value) => !value);
    } else {
      setSortBy(field);
      setSortAscending(true);
    }
    setCurrentPage(1);
  };

  const sortMark = (field) =>
    sortBy === field ? (sortAscending ? ' ▲' : ' ▼') : '';

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleViewDetails = async (userId) => {
    try {
      setSelectedUser(null);
      setDetailsError('');
      setDetailsLoading(true);

      const response = await api.get(`/admin/users/${userId}`);

      setSelectedUser(response.user);
    } catch (err) {
      setDetailsError(err.message || 'Unable to load user details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedUser(null);
    setDetailsError('');
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      address: '',
      password: '',
      role: 'USER',
      storeId: '',
    });
    setFormError('');
    setStores([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccess('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const address = form.address.trim();

    if (name.length < 20 || name.length > 60) {
      setFormError('Name must be between 20 and 60 characters.');
      return;
    }

    if (!address || address.length > 400) {
      setFormError('Please enter an address of up to 400 characters.');
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordPattern.test(form.password)) {
      setFormError(
        'Password must be 8–16 characters and include an uppercase letter and a special character.'
      );
      return;
    }

    if (form.role === 'STORE_OWNER' && !form.storeId) {
      setFormError('Please select a store for this Store Owner.');
      return;
    }

    try {
      setSubmitting(true);

      const userData = {
        name,
        email,
        address,
        password: form.password,
        role: form.role,
      };

      if (form.role === 'STORE_OWNER') {
        userData.storeId = Number(form.storeId);
      }

      await api.post('/admin/users', userData);

      resetForm();
      setShowForm(false);
      setSearch('');
      setRoleFilter('ALL');
      setCurrentPage(1);
      setSuccess('User created and store assignment completed successfully.');
    } catch (err) {
      setFormError(err.message || 'Unable to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeForm = () => {
    if (submitting) return;

    setShowForm(false);
    resetForm();
  };

  const normalUsers = users.filter((user) => user.role === 'USER').length;
  const storeOwners = users.filter((user) => user.role === 'STORE_OWNER').length;

  const formatDate = (date) => {
    if (!date) return 'Not available';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout
      title="User Management"
      subtitle="View, search, and manage all registered platform users."
    >
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Users', value: pagination.totalUsers },
          { label: 'Normal Users (Current Page)', value: normalUsers },
          { label: 'Store Owners (Current Page)', value: storeOwners },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">All Users</h3>
            <p className="mt-1 text-[10px] text-slate-400">
              {pagination.totalUsers} total users
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, email or address..."
                className="w-full bg-transparent text-xs outline-none sm:w-40"
              />
            </label>

            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >
              <option value="ALL">All roles</option>
              <option value="USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">Admin</option>
            </select>

            <button
              onClick={() => {
                setFormError('');
                setSuccess('');
                setShowForm(true);
              }}
              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={16} />
              Add User
            </button>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1"
                  >
                    User{sortMark('name')} <ArrowUpDown size={13} />
                  </button>
                </th>
                <th className="px-5 py-3">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-1"
                  >
                    Email{sortMark('email')} <ArrowUpDown size={13} />
                  </button>
                </th>
                <th className="px-5 py-3">Address</th>
                <th className="px-5 py-3">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1"
                  >
                    Role{sortMark('role')} <ArrowUpDown size={13} />
                  </button>
                </th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-xs text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="text-xs text-slate-500">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">{user.email}</td>
                    <td className="px-5 py-4">{user.address}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-violet-50 text-violet-700'
                          : user.role === 'STORE_OWNER'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-blue-50 text-blue-700'
                      }`}>
                        {user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleViewDetails(user.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-xs text-slate-400">
                    No users found.
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

      {(detailsLoading || detailsError || selectedUser) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <section className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">User Details</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Account information and associated store details.
                </p>
              </div>
              <button
                onClick={closeDetails}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <p className="py-10 text-center text-sm text-slate-400">
                Loading user details...
              </p>
            ) : detailsError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {detailsError}
              </div>
            ) : selectedUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                    {selectedUser.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{selectedUser.name}</h4>
                    <span className="text-xs text-slate-500">
                      {selectedUser.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Email</p>
                    <p className="mt-1 break-all text-sm text-slate-700">{selectedUser.email}</p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">User ID</p>
                    <p className="mt-1 text-sm text-slate-700">{selectedUser.id}</p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3 sm:col-span-2">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Address</p>
                    <p className="mt-1 break-words text-sm text-slate-700">{selectedUser.address}</p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Role</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {selectedUser.role?.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Joined On</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {formatDate(selectedUser.created_at)}
                    </p>
                  </div>
                </div>

                {selectedUser.role === 'STORE_OWNER' && (
                  <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                    <h4 className="mb-3 text-sm font-bold text-slate-800">Assigned Store</h4>

                    {selectedUser.store_id ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-400">Store Name</p>
                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {selectedUser.store_name}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase text-slate-400">Average Rating</p>
                            <p className="mt-1 text-lg font-bold text-slate-800">
                              {Number(selectedUser.store_average_rating || 0).toFixed(2)} / 5
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase text-slate-400">Total Ratings</p>
                            <p className="mt-1 text-lg font-bold text-slate-800">
                              {selectedUser.store_total_ratings}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-orange-700">
                        No store has been assigned to this account.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDetails}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Add New User</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Enter the user's account details.
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
                Full Name
                <input
                  required
                  minLength={20}
                  maxLength={60}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name (20–60 characters)"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-600">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-600">
                Address
                <textarea
                  required
                  maxLength={400}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Enter address"
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-600">
                Temporary Password
                <input
                  required
                  type="password"
                  minLength={8}
                  maxLength={16}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="8–16 characters, uppercase and special character"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-600">
                Role
                <select
                  value={form.role}
                  onChange={(e) => setForm({
                    ...form,
                    role: e.target.value,
                    storeId: '',
                  })}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none focus:border-indigo-500"
                >
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>

              {form.role === 'STORE_OWNER' && (
                <label className="block text-xs font-semibold text-slate-600">
                  Select Store
                  <select
                    required
                    value={form.storeId}
                    onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                    disabled={storesLoading || stores.length === 0}
                    className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none focus:border-indigo-500 disabled:bg-slate-100"
                  >
                    <option value="">
                      {storesLoading
                        ? 'Loading available stores...'
                        : stores.length === 0
                          ? 'No available stores'
                          : 'Select a store'}
                    </option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-[11px] font-normal text-slate-400">
                    Only stores without an assigned owner are shown.
                  </span>
                </label>
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
                disabled={submitting || storesLoading || (form.role === 'STORE_OWNER' && stores.length === 0)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminUsers;