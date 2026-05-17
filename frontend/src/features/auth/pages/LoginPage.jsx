import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useLoginMutation } from '../api/authApi';
import { setCredentials } from '../authSlice';
import { Hammer, Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, Wrench, Zap, Shield } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const emailEmpty = touched.email && !email.trim();
  const passwordEmpty = touched.password && !password.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true });

    if (!email.trim() || !password.trim()) return;

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.data, token: result.data.token }));
      const role = result.data.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'technician') navigate('/technician');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.data?.message;
      if (msg === 'USER_NOT_FOUND') {
        setError('USER_NOT_FOUND');
      } else if (msg === 'INVALID_PASSWORD') {
        setError('INVALID_PASSWORD');
      } else {
        setError(msg || 'Failed to login. Please try again.');
      }
    }
  };

  const inputBase = "flex h-11 sm:h-12 w-full rounded-xl border bg-background px-10 py-2 text-sm sm:text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-shadow";
  const inputNormal = `${inputBase} border-input focus-visible:ring-ring`;
  const inputError = `${inputBase} border-red-500 ring-2 ring-red-200 focus-visible:ring-red-400`;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-[960px] flex flex-col lg:flex-row rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-border/50 bg-card">

        {/* Left Panel */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-[45%] relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(221.2 83.2% 53.3%) 0%, hsl(221.2 83.2% 40%) 50%, hsl(240 60% 35%) 100%)' }}>
          <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
            <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl"><Hammer className="h-7 w-7" /></div>
                <span className="text-2xl font-bold tracking-tight">KeeBo</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4">Welcome back to<br />your workspace</h2>
              <p className="text-white/70 text-sm leading-relaxed max-w-[280px]">Manage your bookings, connect with skilled technicians, and keep your projects on track.</p>
            </div>
            <div className="space-y-4 mt-8">
              {[{ icon: Wrench, text: 'Verified Professionals' }, { icon: Zap, text: 'Instant Bookings' }, { icon: Shield, text: 'Secure Payments' }].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg"><Icon className="h-4 w-4" /></div>
                  <span className="text-sm text-white/80 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute bottom-20 left-10 w-20 h-20 rounded-full bg-white/8" />
        </motion.div>

        {/* Right Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-6 sm:mb-8 lg:items-start">
            <div className="p-3 bg-primary/10 rounded-full mb-4 lg:hidden"><Hammer className="h-7 w-7 sm:h-8 sm:w-8 text-primary" /></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center lg:text-left">Welcome Back</h2>
            <p className="text-muted-foreground mt-2 text-center lg:text-left text-sm sm:text-base max-w-sm">Login to your KeeBo account to manage your bookings.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">
            {/* Email */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-sm font-medium leading-none">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input id="login-email" type="email" className={emailEmpty ? inputError : inputNormal}
                  placeholder="name@example.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (e.target.value.trim()) setTouched(t => ({ ...t, email: false })); }}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))} />
              </div>
              {emailEmpty && <p className="text-xs font-semibold text-red-500 ml-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />This field is required</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">Password</label>
                <Link to="/forgot-password" className="text-xs sm:text-sm text-primary hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input id="login-password" type={showPassword ? "text" : "password"} className={passwordEmpty ? inputError : inputNormal}
                  placeholder="••••••••" value={password}
                  onChange={(e) => { setPassword(e.target.value); if (e.target.value.trim()) setTouched(t => ({ ...t, password: false })); }}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordEmpty && <p className="text-xs font-semibold text-red-500 ml-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />This field is required</p>}
            </div>

            {/* API Errors - shown below both fields */}
            {error && error !== 'USER_NOT_FOUND' && error !== 'INVALID_PASSWORD' && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
              </motion.div>
            )}
            {error === 'INVALID_PASSWORD' && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Incorrect password. Try again or{' '}
                <Link to="/forgot-password" className="font-semibold text-primary hover:underline">reset it</Link>.
              </motion.div>
            )}
            {error === 'USER_NOT_FOUND' && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 flex-wrap">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                This email is not registered.{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">Sign Up</Link>
              </motion.div>
            )}

            <button id="login-submit" type="submit" disabled={isLoading}
              className="inline-flex items-center justify-center w-full h-11 sm:h-12 px-4 py-2 text-sm sm:text-base font-semibold transition-all rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}<Link to="/register" className="font-semibold text-primary hover:underline">Create an account</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
