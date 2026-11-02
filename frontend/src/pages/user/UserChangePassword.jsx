
import { useState } from 'react';
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import authService from '../../services/authService';

function UserChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

    setMessage('');
  };

  const togglePassword = (field) => {
    setShowPassword((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setMessage('Please fill in all password fields.');
      setMessageType('error');
      return;
    }

    if (!passwordPattern.test(formData.newPassword)) {
      setMessage(
        'New password must be 8–16 characters and include an uppercase letter and a special character.'
      );
      setMessageType('error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New password and confirmation do not match.');
      setMessageType('error');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage(
        'Your new password must be different from your current password.'
      );
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMessage('Password updated. Redirecting to log in with your new password...');
      setMessageType('success');

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setShowPassword({});
      
        setTimeout(() => {
           localStorage.removeItem('ratenest_token');
           localStorage.removeItem('ratenest_user');
           window.location.replace('/login');
         }, 2000);
    } catch (error) {
      setMessage(error.message || 'Unable to update your password.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: 'currentPassword',
      label: 'Current Password',
      placeholder: 'Enter current password',
    },
    {
      name: 'newPassword',
      label: 'New Password',
      placeholder: 'Enter new password',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm New Password',
      placeholder: 'Confirm new password',
    },
  ];

  return (
    <UserLayout
      title="Change Password"
      subtitle="Keep your RateNest account secure."
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Account Security
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Choose a strong password to help protect your account.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <LockKeyhole size={22} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Update your password
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter your current password and choose a new one.
            </p>
          </div>

          {message && (
            <div
              role="alert"
              className={`mb-5 rounded-xl px-4 py-3 text-sm ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  {field.label}
                </label>

                <div className="relative">
                  <input
                    id={field.name}
                    type={showPassword[field.name] ? 'text' : 'password'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() => togglePassword(field.name)}
                    aria-label={
                      showPassword[field.name]
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword[field.name] ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Password requirements
            </p>

            <ul className="mt-2 space-y-1 text-xs text-slate-500">
              <li>• 8 to 16 characters</li>
              <li>• At least one uppercase letter</li>
              <li>• At least one special character</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </UserLayout>
  );
}

export default UserChangePassword;
