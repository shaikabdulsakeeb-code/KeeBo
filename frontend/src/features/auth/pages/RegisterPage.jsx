import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useRegisterMutation } from '../api/authApi';
import { setCredentials } from '../authSlice';
import { Hammer, Loader2, User, Mail, Lock, UserCog, Eye, EyeOff, AlertCircle, Wrench, Zap, Shield } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const isEmpty = (field) => touched[field] && !formData[field].trim();
  const passwordMismatch = touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) return;
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    try {
      const { confirmPassword, ...submissionData } = formData;
      const result = await register(submissionData).unwrap();
      dispatch(setCredentials({ user: result.data, token: result.data.token }));
      const role = result.data.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'technician') navigate('/technician/onboarding');
      else navigate('/dashboard');
    } catch (err) { setError(err.data?.message || 'Failed to create account. Please try again.'); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (value.trim()) setTouched(t => ({ ...t, [name]: false }));
  };
  const handleBlur = (field) => setTouched(t => ({ ...t, [field]: true }));

  const inputBase = "flex h-11 sm:h-12 w-full rounded-xl border bg-background px-10 py-2 text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 transition-shadow";
  const inputNormal = `${inputBase} border-input focus-visible:ring-ring`;
  const inputErr = `${inputBase} border-red-500 ring-2 ring-red-200 focus-visible:ring-red-400`;
  const errMsg = (show) => show ? <p className="text-xs font-semibold text-red-500 ml-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />This field is required</p> : null;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-[1020px] flex flex-col lg:flex-row rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-border/50 bg-card">
        {/* Left Panel */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-[42%] relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(221.2 83.2% 53.3%) 0%, hsl(221.2 83.2% 40%) 50%, hsl(240 60% 35%) 100%)' }}>
          <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
            <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl"><Hammer className="h-7 w-7" /></div>
                <span className="text-2xl font-bold tracking-tight">KeeBo</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4">Join the future<br />of local services</h2>
              <p className="text-white/70 text-sm leading-relaxed max-w-[280px]">Create your account and start booking skilled technicians instantly.</p>
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
        </motion.div>

        {/* Right Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-5 sm:mb-7 lg:items-start">
            <div className="p-3 bg-primary/10 rounded-full mb-4 lg:hidden"><Hammer className="h-7 w-7 sm:h-8 sm:w-8 text-primary" /></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center lg:text-left">Create Account</h2>
            <p className="text-muted-foreground mt-2 text-center lg:text-left text-sm sm:text-base max-w-sm">Join the KeeBo community and experience the future of local services.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-2">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'user' })}
                className={`flex flex-col items-center p-3 sm:p-4 border-2 rounded-xl transition-all ${formData.role === 'user' ? 'border-primary bg-primary/5 shadow-md' : 'border-border grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}>
                <User className={`h-6 w-6 sm:h-8 sm:w-8 mb-1.5 sm:mb-2 ${formData.role === 'user' ? 'text-primary' : ''}`} />
                <span className="font-semibold text-xs sm:text-sm">Customer</span>
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'technician' })}
                className={`flex flex-col items-center p-3 sm:p-4 border-2 rounded-xl transition-all ${formData.role === 'technician' ? 'border-primary bg-primary/5 shadow-md' : 'border-border grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}>
                <UserCog className={`h-6 w-6 sm:h-8 sm:w-8 mb-1.5 sm:mb-2 ${formData.role === 'technician' ? 'text-primary' : ''}`} />
                <span className="font-semibold text-xs sm:text-sm">Technician</span>
              </button>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input name="name" type="text" className={isEmpty('name') ? inputErr : inputNormal} placeholder="John Doe"
                  value={formData.name} onChange={handleChange} onBlur={() => handleBlur('name')} />
              </div>
              {errMsg(isEmpty('name'))}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input name="email" type="email" className={isEmpty('email') ? inputErr : inputNormal} placeholder="name@example.com"
                  value={formData.email} onChange={handleChange} onBlur={() => handleBlur('email')} />
              </div>
              {errMsg(isEmpty('email'))}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input name="password" type={showPassword ? "text" : "password"} minLength={6}
                    className={`${isEmpty('password') ? inputErr : inputNormal} pr-10`} placeholder="••••••••"
                    value={formData.password} onChange={handleChange} onBlur={() => handleBlur('password')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errMsg(isEmpty('password'))}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input name="confirmPassword" type={showPassword ? "text" : "password"} minLength={6}
                    className={`${isEmpty('confirmPassword') || passwordMismatch ? inputErr : inputNormal} pr-10`} placeholder="••••••••"
                    value={formData.confirmPassword} onChange={handleChange} onBlur={() => handleBlur('confirmPassword')} />
                </div>
                {errMsg(isEmpty('confirmPassword'))}
                {passwordMismatch && !isEmpty('confirmPassword') && <p className="text-xs font-semibold text-red-500 ml-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Passwords do not match</p>}
              </div>
            </div>

            {/* API Error */}
            {error && error !== 'Passwords do not match' && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
              </motion.div>
            )}

            <button type="submit" disabled={isLoading}
              className="inline-flex items-center justify-center w-full h-11 sm:h-12 px-4 py-2 text-sm sm:text-base font-semibold transition-all rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] mt-1">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 sm:mt-7 text-center text-sm text-muted-foreground">
            Already have an account?{' '}<Link to="/login" className="font-semibold text-primary hover:underline">Sign In</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
