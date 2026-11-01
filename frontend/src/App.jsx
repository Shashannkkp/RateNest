
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AuthPage from './pages/auth/AuthPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';
import AdminRatings from './pages/admin/AdminRatings';

import UserDashboard from './pages/user/UserDashboard';
import UserStores from './pages/user/UserStores';
import UserChangePassword from './pages/user/UserChangePassword';

import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerRatings from './pages/owner/OwnerRatings';
import OwnerChangePassword from './pages/owner/OwnerChangePassword';

const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('ratenest_user') || '{}');

    return String(
      user.role || user.roleName || user.role_name || ''
    ).toUpperCase();
  } catch {
    return '';
  }
};

const getDashboardPath = (role) => {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'USER') return '/user/dashboard';
  if (role === 'STORE_OWNER') return '/owner/dashboard';

  return '/login';
};

function ProtectedRoute({ allowedRole, children }) {
  const token = localStorage.getItem('ratenest_token');
  const role = getUserRole();

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
}

function App() {
  const token = localStorage.getItem('ratenest_token');
  const role = getUserRole();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            token && role ? (
              <Navigate to={getDashboardPath(role)} replace />
            ) : (
              <AuthPage />
            )
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminStores />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ratings"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminRatings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/stores"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserStores />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/change-password"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRole="STORE_OWNER">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/ratings"
          element={
            <ProtectedRoute allowedRole="STORE_OWNER">
              <OwnerRatings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/change-password"
          element={
            <ProtectedRoute allowedRole="STORE_OWNER">
              <OwnerChangePassword />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <Navigate
              to={token && role ? getDashboardPath(role) : '/login'}
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={token && role ? getDashboardPath(role) : '/login'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
