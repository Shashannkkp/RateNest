
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  Store,
  UserRound,
} from 'lucide-react';

import authService from '../../services/authService';

function AuthPage() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage('');
    setMessageType('');
  };

  const switchScreen = (register) => {
    setIsRegister(register);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMessage('');
    setMessageType('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setMessage('');
    setMessageType('');

    if (isRegister) {
      if (
        formData.name.trim().length < 20 ||
        formData.name.trim().length > 60
      ) {
        setMessage('Name must be between 20 and 60 characters.');
        setMessageType('error');
        return;
      }

      if (
        formData.address.trim().length === 0 ||
        formData.address.trim().length > 400
      ) {
        setMessage('Please enter a valid address (maximum 400 characters).');
        setMessageType('error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        setMessage('Please enter a valid email address.');
        setMessageType('error');
        return;
      }

      if (
        !/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(formData.password)
      ) {
        setMessage(
          'Password must be 8–16 characters with an uppercase letter and a special character.'
        );
        setMessageType('error');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setMessage('Passwords do not match.');
        setMessageType('error');
        return;
      }

      try {
        setIsLoading(true);

        const response = await authService.register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          address: formData.address.trim(),
          password: formData.password,
        });

        setMessage(
          response.message || 'Account created successfully. Please sign in.'
        );
        setMessageType('success');

        setFormData((previous) => ({
          ...previous,
          name: '',
          address: '',
          password: '',
          confirmPassword: '',
        }));

        setIsRegister(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
      } catch (error) {
        setMessage(error.message || 'Unable to create your account.');
        setMessageType('error');
      } finally {
        setIsLoading(false);
      }

      return;
    }

    if (!formData.email.trim() || !formData.password) {
      setMessage('Please enter your email and password.');
      setMessageType('error');
      return;
    }

    try {
      setIsLoading(true);

      const response = await authService.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (!response.token || !response.user) {
        throw new Error('Invalid login response received from the server.');
      }

      const role = response.user.role?.toUpperCase();

      const roleRoutes = {
        ADMIN: '/admin/dashboard',
        USER: '/user/dashboard',
        STORE_OWNER: '/owner/dashboard',
      };

      const destination = roleRoutes[role];

      if (!destination) {
        throw new Error('Your account has an invalid user role.');
      }

      localStorage.setItem('ratenest_token', response.token);
      localStorage.setItem('ratenest_user', JSON.stringify(response.user));

      navigate(destination, { replace: true });
    } catch (error) {
      setMessage(error.message || 'Unable to log in. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'h-full w-full min-w-0 rounded-[10px] border-0 bg-transparent py-0 pl-[43px] pr-[43px] text-[13px] text-[#172033] outline-none placeholder:text-[#a0aec0]';

  const fieldClass = 'mb-[19px]';

  const labelClass =
    'mb-2 block text-[12px] font-semibold text-[#334155]';

  const iconClass =
    'absolute left-[14px] shrink-0 text-[#94a3b8] pointer-events-none';

  const inputWrapperClass =
    'relative flex h-[49px] w-full items-center rounded-[10px] border border-[#e2e8f0] bg-white transition focus-within:border-[#6366f1] focus-within:ring-[3px] focus-within:ring-indigo-500/10';

  const passwordToggleClass =
    'absolute right-3 top-1/2 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-md text-[#94a3b8] transition hover:bg-indigo-50 hover:text-indigo-600';

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#f8fafc]">
      <section className="flex h-full min-h-0 w-full overflow-hidden max-[700px]:block">
        <aside className="relative flex h-full min-w-0 flex-[1_1_52%] overflow-hidden bg-[linear-gradient(145deg,#172554_0%,#1e1b4b_58%,#312e81_100%)] px-[6%] py-[38px] text-white max-[1000px]:flex-[1_1_50%] max-[1000px]:px-[5%] max-[700px]:hidden max-[1000px]:[&_.brand-message_h1]:text-[clamp(35px,4.5vw,48px)] max-[1000px]:[&_.brand-features]:mt-6 max-[1000px]:[&_.brand-features]:gap-3 min-[701px]:max-[760px]:py-[22px]">
          <div className="relative z-10 flex h-full min-h-0 w-full flex-col">
            <a
              className="inline-flex self-start items-center gap-3 text-[25px] font-bold tracking-[-0.8px] text-white no-underline"
              href="/"
              aria-label="RateNest home"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#6366f1]">
                <Store size={23} strokeWidth={2.2} />
              </span>
              RateNest
            </a>

            <div className="my-auto w-full max-w-[560px] py-6 min-[701px]:max-[760px]:py-3">
              <div className="mb-[22px] flex items-center gap-3 text-[11px] font-bold tracking-[2.3px] text-[#c4b5fd]">
                <span className="h-[2px] w-7 bg-[#a78bfa]" />
                GOOD STORES. BETTER CHOICES.
              </div>

              <h1 className="mb-5 text-[clamp(38px,4.1vw,60px)] font-bold leading-[1.1] tracking-[-2.5px] text-white min-[701px]:max-[760px]:text-[clamp(32px,3.5vw,43px)]">
                Find the places
                <br />
                worth coming
                <br />
                <span className="text-[#a5b4fc]">back to.</span>
              </h1>

              <p className="max-w-[470px] text-[15px] leading-[1.8] text-[#cbd5e1] min-[701px]:max-[760px]:text-[13px] min-[701px]:max-[760px]:leading-[1.55]">
                Discover trusted local stores, explore customer ratings,
                and share experiences that matter.
              </p>

              <div className="mt-8 flex flex-col gap-[15px] min-[701px]:max-[760px]:mt-4 min-[701px]:max-[760px]:gap-[9px]">
                {[
                  { icon: Star, label: 'Honest customer ratings' },
                  { icon: ShieldCheck, label: 'Trusted store experiences' },
                  { icon: Store, label: 'Discover local businesses' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-[13px] text-[13px] font-medium text-[#e2e8f0]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#c4b5fd]/25 bg-white/[0.07] text-[#c4b5fd] min-[701px]:max-[760px]:h-7 min-[701px]:max-[760px]:w-7">
                      <Icon size={17} />
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px] text-[#94a3b8]">
              <span>© 2026 RateNest</span>
              <span>Discover. Rate. Connect.</span>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-40 -top-[220px] z-0 h-[500px] w-[500px] rounded-full border border-[#c4b5fd]/[0.13]" />
          <div className="pointer-events-none absolute -bottom-[300px] -right-[180px] z-0 h-[600px] w-[600px] rounded-full border border-[#c4b5fd]/[0.13]" />
          <div className="pointer-events-none absolute right-[8%] top-[45%] z-0 h-[90px] w-[90px] rounded-full border border-[#c4b5fd]/[0.08]" />
        </aside>

        <section className="flex h-full min-h-0 w-[48%] min-w-0 flex-[1_1_48%] items-center justify-center overflow-hidden bg-[#f8fafc] px-[5%] py-6 max-[1000px]:w-1/2 max-[1000px]:flex-[1_1_50%] max-[1000px]:px-[4%] max-[700px]:w-full max-[700px]:px-5 max-[700px]:py-[18px] max-[380px]:px-[14px] min-[701px]:max-[760px]:py-3">
          <div className="my-auto max-h-full w-full max-w-[420px] overflow-x-hidden overflow-y-auto px-[5px] py-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] max-[700px]:max-w-[440px] max-[700px]:px-[3px] max-[700px]:py-[5px]">
            <div className="mb-[26px] hidden items-center gap-2.5 text-[22px] font-bold text-[#172554] max-[700px]:flex">
              <span className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[11px] bg-[#6366f1] text-white">
                <Store size={21} />
              </span>
              RateNest
            </div>

            <div className="mb-[27px] max-[700px]:mb-[23px] min-[701px]:max-[760px]:mb-[18px]">
              <div className="mb-[17px] flex h-[46px] w-[46px] items-center justify-center rounded-[13px] border border-[#e0e7ff] bg-[#eef2ff] text-[#4f46e5] min-[701px]:max-[760px]:mb-[10px] min-[701px]:max-[760px]:h-[38px] min-[701px]:max-[760px]:w-[38px]">
                {isRegister ? (
                  <UserRound size={23} />
                ) : (
                  <LockKeyhole size={23} />
                )}
              </div>

              <span className="mb-[9px] block text-[10px] font-bold tracking-[2px] text-[#6366f1]">
                {isRegister ? 'JOIN RATENEST' : 'WELCOME BACK'}
              </span>

              <h2 className="mb-2.5 text-[clamp(25px,2.2vw,31px)] font-bold leading-[1.25] tracking-[-1px] text-[#172033] max-[380px]:text-2xl">
                {isRegister
                  ? 'Create your account.'
                  : 'Sign in to your account.'}
              </h2>

              <p className="text-[13px] leading-[1.7] text-[#64748b]">
                {isRegister
                  ? 'Create an account to discover and rate your favourite stores.'
                  : 'Enter your details to continue discovering great stores.'}
              </p>
            </div>

            <form className="w-full" onSubmit={handleSubmit}>
              {isRegister && (
                <>
                  <div className={fieldClass}>
                    <label className={labelClass} htmlFor="name">
                      Full name
                    </label>

                    <div className={inputWrapperClass}>
                      <UserRound className={iconClass} size={18} />
                      <input
                        className={inputClass}
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        minLength={20}
                        maxLength={60}
                        required
                      />
                    </div>

                    <span className="mt-1.5 block text-[10px] text-[#94a3b8]">
                      20–60 characters
                    </span>
                  </div>

                  <div className={fieldClass}>
                    <label className={labelClass} htmlFor="address">
                      Address
                    </label>

                    <div className={inputWrapperClass}>
                      <MapPin className={iconClass} size={18} />
                      <input
                        className={inputClass}
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Enter your address"
                        value={formData.address}
                        onChange={handleChange}
                        maxLength={400}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={fieldClass}>
                <label className={labelClass} htmlFor="email">
                  Email address
                </label>

                <div className={inputWrapperClass}>
                  <Mail className={iconClass} size={18} />
                  <input
                    className={inputClass}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className={fieldClass}>
                <div className="flex items-center justify-between gap-2.5">
                  <label className={labelClass} htmlFor="password">
                    Password
                  </label>

                  {!isRegister && (
                    <span className="mb-2 inline-flex items-center gap-[5px] text-[10px] text-[#64748b]">
                      <ShieldCheck size={13} className="text-green-600" />
                      Secure login
                    </span>
                  )}
                </div>

                <div className={inputWrapperClass}>
                  <LockKeyhole className={iconClass} size={18} />
                  <input
                    className={inputClass}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={
                      isRegister ? 'new-password' : 'current-password'
                    }
                    required
                  />

                  <button
                    className={passwordToggleClass}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {isRegister && (
                  <span className="mt-1.5 block text-[10px] leading-[1.5] text-[#94a3b8]">
                    8–16 characters, one uppercase letter and one special
                    character
                  </span>
                )}
              </div>

              {isRegister && (
                <div className={fieldClass}>
                  <label className={labelClass} htmlFor="confirmPassword">
                    Confirm password
                  </label>

                  <div className={inputWrapperClass}>
                    <LockKeyhole className={iconClass} size={18} />
                    <input
                      className={inputClass}
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />

                    <button
                      className={passwordToggleClass}
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!isRegister && (
                <div className="mb-5 mt-0.5 flex items-center">
                  <span className="inline-flex items-center gap-[7px] text-[11px] text-[#64748b]">
                    <ShieldCheck size={15} className="text-green-600" />
                    Your account is protected
                  </span>
                </div>
              )}

              {message && (
                <div
                  className={`mb-4 rounded-[9px] border px-[13px] py-[11px] text-[12px] leading-[1.5] ${
                    messageType === 'success'
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-[#c7d2fe] bg-[#eef2ff] text-[#3730a3]'
                  }`}
                  role="alert"
                >
                  {message}
                </div>
              )}

              <button
                className="mt-2 flex h-[49px] w-full items-center justify-center gap-2.5 rounded-[10px] bg-[#4f46e5] text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#4338ca] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Please wait...'
                  : isRegister
                    ? 'Create account'
                    : 'Sign in'}

                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-[23px] flex flex-wrap items-center justify-center gap-[5px] text-[12px] text-[#64748b]">
              {isRegister
                ? 'Already have an account?'
                : 'New around here?'}

              <button
                className="font-bold text-[#4f46e5] hover:underline disabled:opacity-50"
                type="button"
                onClick={() => switchScreen(!isRegister)}
                disabled={isLoading}
              >
                {isRegister ? 'Sign in' : 'Create an account'}
              </button>
            </div>

            <div className="mt-[30px] flex flex-wrap justify-between gap-2 border-t border-[#e2e8f0] pt-[17px] text-[10px] text-[#94a3b8] max-[700px]:mt-6 min-[701px]:max-[760px]:mt-[19px] min-[701px]:max-[760px]:pt-3 max-[380px]:text-[9px]">
              <span>Simple choices. Better experiences.</span>
              <span>Made for your community</span>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default AuthPage;
