import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useRegisterMutation } from '../api/authApi';
import { setCredentials } from '../authSlice';
import { Hammer, Loader2, User, Mail, Lock, UserCog, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Create a submission object without confirmPassword
      const { confirmPassword, ...submissionData } = formData;
      const result = await register(submissionData).unwrap();
      dispatch(setCredentials({ user: result.data, token: result.data.token }));
      
      const role = result.data.role;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'technician') {
        navigate('/technician/onboarding'); // Technicians need onboarding first
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.data?.message || 'Failed to create account. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-64px)] py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg p-8 bg-card border rounded-2xl shadow-xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Hammer className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-muted-foreground mt-2 text-center">
            Join the KeeBo community and experience the future of local services.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && error !== 'Passwords do not match' && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'user' })}
              className={`flex flex-col items-center p-4 border-2 rounded-xl transition-all ${
                formData.role === 'user' ? 'border-primary bg-primary/5 shadow-md' : 'border-border grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
              }`}
            >
              <User className={`h-8 w-8 mb-2 ${formData.role === 'user' ? 'text-primary' : ''}`} />
              <span className="font-semibold text-sm">Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'technician' })}
              className={`flex flex-col items-center p-4 border-2 rounded-xl transition-all ${
                formData.role === 'technician' ? 'border-primary bg-primary/5 shadow-md' : 'border-border grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
              }`}
            >
              <UserCog className={`h-8 w-8 mb-2 ${formData.role === 'technician' ? 'text-primary' : ''}`} />
              <span className="font-semibold text-sm">Technician</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                name="name"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                name="email"
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className={`flex h-10 w-full rounded-md border ${error === 'Passwords do not match' ? 'border-red-600' : 'border-input'} bg-background px-10 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            {error === 'Passwords do not match' && (
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest ml-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center w-full h-11 px-4 py-2 text-sm font-medium transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 mt-4"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
