import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { login, register, resetState } from '../features/auth/authSlice';
import Toast from '../components/Toast';
import { postRequest } from '../api/api';

const AuthPage = () => {
  const [authView, setAuthView] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [resetLinkMock, setResetLinkMock] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();

  const { user, isLoading, isError, isSuccess, errorMessage } = useSelector(
    (state) => state.auth
  );

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    mode: 'onTouched',
  });

  const watchPassword = watch('password');

  useEffect(() => {
    if (token) {
      setAuthView('reset-password');
      setResetLinkMock(null);
    } else {
      setAuthView('login');
    }
  }, [token]);

  useEffect(() => {
    const msg = localStorage.getItem('logoutMessage');
    const type = localStorage.getItem('logoutMessageType');
    if (msg) {
      setToast({ message: msg, type: type || 'success' });
      localStorage.removeItem('logoutMessage');
      localStorage.removeItem('logoutMessageType');
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isError && errorMessage) {
      setToast({ message: errorMessage, type: 'error' });
      dispatch(resetState());
    }
  }, [isError, errorMessage, dispatch]);

  useEffect(() => {
    if (isSuccess && user) {
      setToast({
        message: authView === 'login'
          ? `Welcome back, ${user.name}!`
          : `Account created successfully!`,
        type: 'success',
      });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#60a5fa', '#dbeafe', '#ffffff'],
      });

      dispatch(resetState());

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  }, [isSuccess, user, authView, navigate, dispatch]);

  const onSubmit = async (data) => {
    if (authView === 'login') {
      dispatch(login({ email: data.email, password: data.password }));
    } else if (authView === 'register') {
      dispatch(register({ name: data.name, email: data.email, password: data.password }));
    } else if (authView === 'forgot-password') {
      try {
        setIsLoadingRequest(true);
        const dataResponse = await postRequest('/auth/forgot-password', { email: data.email });
        if (dataResponse.success) {
          setToast({
            message: 'Password reset link generated! Check server logs.',
            type: 'success',
          });
          setResetLinkMock(dataResponse.resetUrl);
        }
      } catch (err) {
        setToast({
          message: err.response?.data?.message || 'Password reset request failed.',
          type: 'error',
        });
      } finally {
        setIsLoadingRequest(false);
      }
    } else if (authView === 'reset-password') {
      if (data.password !== data.confirmPassword) {
        setToast({ message: 'Passwords do not match.', type: 'error' });
        return;
      }
      try {
        setIsLoadingRequest(true);
        const dataResponse = await postRequest(`/auth/reset-password/${token}`, {
          password: data.password,
        });
        if (dataResponse.success) {
          setToast({
            message: 'Password reset successfully! Please log in.',
            type: 'success',
          });
          setTimeout(() => {
            navigate('/auth');
            setAuthView('login');
            reset();
          }, 1500);
        }
      } catch (err) {
        setToast({
          message: err.response?.data?.message || 'Failed to reset password.',
          type: 'error',
        });
      } finally {
        setIsLoadingRequest(false);
      }
    }
  };

  const handleBackToLogin = () => {
    if (token) {
      navigate('/auth');
    }
    setAuthView('login');
    setResetLinkMock(null);
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[120px] dark:bg-blue-600/5 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-[120px] dark:bg-cyan-600/5 pointer-events-none" />

      <div className="w-full max-w-md animate-scale-in">
        <div className="glass-card rounded-3xl shadow-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 bg-white/90 dark:bg-slate-900/90">

          <div className="px-8 pt-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-950/50 mb-4 animate-pulse">
              {authView === 'login' && (
                <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              )}
              {authView === 'register' && (
                <ShieldAlert className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              )}
              {authView === 'forgot-password' && (
                <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              )}
              {authView === 'reset-password' && (
                <KeyRound className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              )}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              {authView === 'forgot-password' && 'Reset Password'}
              {authView === 'reset-password' && 'New Password'}
              {(authView === 'login' || authView === 'register') && 'SecureNotes'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-center gap-1.5">
              {authView === 'forgot-password' && 'Generate a secure password reset link'}
              {authView === 'reset-password' && 'Create a new secure password for your account'}
              {(authView === 'login' || authView === 'register') && (
                <>
                  <Lock className="w-3.5 h-3.5" /> Client-side AES 256 Encryption
                </>
              )}
            </p>
          </div>

          {(authView === 'login' || authView === 'register') && (
            <div className="px-8 pb-2">
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl relative">
                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${authView === 'login'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthView('register')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${authView === 'register'
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                  Register
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-4 space-y-5">

            {authView === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    {...formRegister('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                    className={`block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/40 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm text-slate-900 dark:text-white ${errors.name
                      ? 'border-rose-400 dark:border-rose-900 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-800/80'
                      }`}
                  />
                </div>
                {errors.name && (
                  <span className="text-xs text-rose-500 pl-1 font-medium">
                    {errors.name.message}
                  </span>
                )}
              </div>
            )}

            {authView !== 'reset-password' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    {...formRegister('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                    className={`block w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/40 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm text-slate-900 dark:text-white ${errors.email
                      ? 'border-rose-400 dark:border-rose-900 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-800/80'
                      }`}
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-rose-500 pl-1 font-medium">
                    {errors.email.message}
                  </span>
                )}
              </div>
            )}

            {authView !== 'forgot-password' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {authView === 'reset-password' ? 'New Password' : 'Password'}
                  </label>
                  {authView === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setAuthView('forgot-password'); reset(); }}
                      className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors focus:outline-none"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...formRegister('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className={`block w-full pl-11 pr-11 py-3 bg-slate-50/50 dark:bg-slate-800/40 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm text-slate-900 dark:text-white ${errors.password
                      ? 'border-rose-400 dark:border-rose-900 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-800/80'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-355"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs text-rose-500 pl-1 font-medium">
                    {errors.password.message}
                  </span>
                )}
              </div>
            )}

            {authView === 'reset-password' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...formRegister('confirmPassword', {
                      required: 'Confirm password is required',
                      validate: (value) =>
                        value === watchPassword || 'Passwords do not match',
                    })}
                    className={`block w-full pl-11 pr-11 py-3 bg-slate-50/50 dark:bg-slate-800/40 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm text-slate-900 dark:text-white ${errors.confirmPassword
                      ? 'border-rose-400 dark:border-rose-900 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-800/80'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-355"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-xs text-rose-500 pl-1 font-medium">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isLoadingRequest}
              className="w-full flex items-center justify-center py-3.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-primary-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none mt-2 text-sm"
            >
              {(isLoading || isLoadingRequest) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {authView === 'login' && 'Logging in...'}
                  {authView === 'register' && 'Registering...'}
                  {authView === 'forgot-password' && 'Generating link...'}
                  {authView === 'reset-password' && 'Updating password...'}
                </>
              ) : (
                <>
                  {authView === 'login' && 'Log In'}
                  {authView === 'register' && 'Create Account'}
                  {authView === 'forgot-password' && 'Send Reset Link'}
                  {authView === 'reset-password' && 'Reset Password'}
                </>
              )}
            </button>

            {(authView === 'forgot-password' || authView === 'reset-password') && (
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors mt-4 py-1.5 focus:outline-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            )}

            {authView === 'forgot-password' && resetLinkMock && (
              <div className="mt-4 p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 text-center space-y-2.5 animate-in fade-in duration-200">
                <p className="text-xs text-primary-700 dark:text-primary-300 font-medium">
                  Testing link generated successfully:
                </p>
                <a
                  href={resetLinkMock}
                  onClick={(e) => {
                    e.preventDefault();
                    const tokenFromUrl = resetLinkMock.split('/').pop();
                    navigate(`/auth/reset-password/${tokenFromUrl}`);
                    setAuthView('reset-password');
                    setResetLinkMock(null);
                    reset();
                  }}
                  className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] focus:outline-none"
                >
                  Click to Reset Password
                </a>
              </div>
            )}
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AuthPage;
