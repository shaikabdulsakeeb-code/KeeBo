import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForgotPasswordMutation, useVerifyOtpMutation, useResetPasswordMutation } from '../api/authApi';
import { Hammer, Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, KeyRound, CheckCircle2, AlertCircle, Wrench, Zap, Shield } from 'lucide-react';

const STEPS = ['email', 'otp', 'reset'];

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [pwTouched, setPwTouched] = useState({ newPassword: false, confirmPassword: false });
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  useEffect(() => { if (countdown <= 0) return; const t = setInterval(() => setCountdown(c => c - 1), 1000); return () => clearInterval(t); }, [countdown]);
  useEffect(() => { if (step === 'otp' && otpRefs.current[0]) otpRefs.current[0].focus(); }, [step]);

  const emailEmpty = emailTouched && !email.trim();
  const newPwEmpty = pwTouched.newPassword && !newPassword.trim();
  const confirmPwEmpty = pwTouched.confirmPassword && !confirmPassword.trim();

  const handleSendOtp = async (e) => {
    e.preventDefault(); setError(''); setEmailTouched(true);
    if (!email.trim()) return;
    try { await forgotPassword({ email }).unwrap(); setStep('otp'); setCountdown(60); setSuccess(''); }
    catch (err) { setError(err.data?.message || 'Failed to send OTP.'); }
  };

  const handleOtpChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKeyDown = (i, e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus(); };
  const handleOtpPaste = (e) => {
    e.preventDefault(); const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (p.length === 6) { setOtp(p.split('')); otpRefs.current[5]?.focus(); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setError('');
    const s = otp.join(''); if (s.length !== 6) { setError('Please enter the full 6-digit OTP'); return; }
    try { await verifyOtp({ email, otp: s }).unwrap(); setStep('reset'); setSuccess(''); }
    catch (err) { setError(err.data?.message || 'Invalid or expired OTP.'); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); setError('');
    setPwTouched({ newPassword: true, confirmPassword: true });
    if (!newPassword.trim() || !confirmPassword.trim()) return;
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    try { await resetPassword({ email, otp: otp.join(''), newPassword }).unwrap(); setSuccess('Password reset successful! Redirecting...'); setTimeout(() => navigate('/login'), 2500); }
    catch (err) { setError(err.data?.message || 'Failed to reset password.'); }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return; setError('');
    try { await forgotPassword({ email }).unwrap(); setOtp(['', '', '', '', '', '']); setCountdown(60); setSuccess('New OTP sent!'); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError(err.data?.message || 'Failed to resend OTP.'); }
  };

  const currentStepIndex = STEPS.indexOf(step);
  const slideVariants = { enter: { x: 40, opacity: 0 }, center: { x: 0, opacity: 1 }, exit: { x: -40, opacity: 0 } };
  const inputBase = "flex h-11 sm:h-12 w-full rounded-xl border bg-background px-10 py-2 text-sm sm:text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-shadow";
  const inputOk = `${inputBase} border-input focus-visible:ring-ring`;
  const inputBad = `${inputBase} border-red-500 ring-2 ring-red-200 focus-visible:ring-red-400`;
  const btnCls = "inline-flex items-center justify-center w-full h-11 sm:h-12 px-4 py-2 text-sm sm:text-base font-semibold transition-all rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
  const reqErr = (show) => show ? <p className="text-xs font-semibold text-red-500 ml-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />This field is required</p> : null;

  const stepIcons = { email: KeyRound, otp: ShieldCheck, reset: Lock };
  const stepTitles = { email: 'Forgot Password?', otp: 'Verify OTP', reset: 'Set New Password' };
  const stepDescs = { email: "Enter your email and we'll send you a verification code.", otp: `We sent a 6-digit code to ${email}`, reset: 'Create a strong new password for your account.' };
  const StepIcon = stepIcons[step];

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
              <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4">Secure account<br />recovery</h2>
              <p className="text-white/70 text-sm leading-relaxed max-w-[280px]">We'll help you get back into your account safely with a one-time verification code.</p>
            </div>
            <div className="space-y-4 mt-8">
              {[{ icon: Shield, text: 'OTP Verification' }, { icon: Wrench, text: '10-Minute Expiry' }, { icon: Zap, text: 'Instant Reset' }].map(({ icon: Icon, text }) => (
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
          className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          {/* Header */}
          <div className="flex flex-col items-center mb-5 sm:mb-6 lg:items-start">
            <div className="p-3 bg-primary/10 rounded-full mb-4 lg:hidden"><StepIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" /></div>
            <div className="hidden lg:block p-3 bg-primary/10 rounded-full mb-4"><StepIcon className="h-7 w-7 text-primary" /></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center lg:text-left">{stepTitles[step]}</h2>
            <p className="text-muted-foreground mt-2 text-center lg:text-left text-sm sm:text-base max-w-sm">{stepDescs[step]}</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            {STEPS.map((s, i) => (<div key={s} className={`stepper-bar ${i <= currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />))}
          </div>

          {/* Alerts */}
          <AnimatePresence mode="wait">
            {error && (<motion.div key="e" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"><AlertCircle className="h-4 w-4 flex-shrink-0" />{error}</motion.div>)}
            {success && (<motion.div key="s" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="p-3 mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2"><CheckCircle2 className="h-4 w-4 flex-shrink-0" />{success}</motion.div>)}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 'email' && (
              <motion.form key="s1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} onSubmit={handleSendOtp} noValidate className="space-y-5">
                <div className="space-y-1.5"><label className="text-sm font-medium">Email Address</label>
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="email" className={emailEmpty ? inputBad : inputOk} placeholder="name@example.com" value={email}
                      onChange={(e) => { setEmail(e.target.value); if (e.target.value.trim()) setEmailTouched(false); }}
                      onBlur={() => setEmailTouched(true)} autoFocus />
                  </div>
                  {reqErr(emailEmpty)}
                </div>
                <button type="submit" disabled={isSending} className={btnCls}>
                  {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Verification Code'}
                </button>
              </motion.form>
            )}

            {/* STEP 2 */}
            {step === 'otp' && (
              <motion.form key="s2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-3"><label className="text-sm font-medium">Enter 6-Digit Code</label>
                  <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input key={i} ref={el => (otpRefs.current[i] = el)} type="password" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-lg border-2 border-input bg-background transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        style={{ caretColor: 'transparent' }} />
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={isVerifying} className={btnCls}>
                  {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify Code'}
                </button>
                <div className="text-center text-sm text-muted-foreground">
                  Didn't receive the code?{' '}
                  {countdown > 0 ? <span>Resend in <span className="font-semibold text-primary">{countdown}s</span></span>
                    : <button type="button" onClick={handleResendOtp} disabled={isSending} className="font-semibold text-primary hover:underline disabled:opacity-50">Resend Code</button>}
                </div>
              </motion.form>
            )}

            {/* STEP 3 */}
            {step === 'reset' && (
              <motion.form key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} onSubmit={handleResetPassword} noValidate className="space-y-5">
                <div className="space-y-1.5"><label className="text-sm font-medium">New Password</label>
                  <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type={showPassword ? 'text' : 'password'} minLength={6} className={newPwEmpty ? inputBad : inputOk} placeholder="Enter new password" value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); if (e.target.value.trim()) setPwTouched(t => ({ ...t, newPassword: false })); }}
                      onBlur={() => setPwTouched(t => ({ ...t, newPassword: true }))} autoFocus />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {reqErr(newPwEmpty)}
                </div>
                <div className="space-y-1.5"><label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type={showConfirmPassword ? 'text' : 'password'} minLength={6} className={confirmPwEmpty ? inputBad : inputOk} placeholder="Confirm new password" value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); if (e.target.value.trim()) setPwTouched(t => ({ ...t, confirmPassword: false })); }}
                      onBlur={() => setPwTouched(t => ({ ...t, confirmPassword: true }))} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {reqErr(confirmPwEmpty)}
                </div>
                {newPassword && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(l => (<div key={l} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${newPassword.length >= l * 3 ? l <= 1 ? 'bg-red-400' : l <= 2 ? 'bg-orange-400' : l <= 3 ? 'bg-yellow-400' : 'bg-emerald-400' : 'bg-muted'}`} />))}
                    </div>
                    <p className="text-xs text-muted-foreground">{newPassword.length < 6 ? 'Too short — min 6 chars' : newPassword.length < 8 ? 'Fair' : newPassword.length < 12 ? 'Good!' : 'Strong!'}</p>
                  </div>
                )}
                <button type="submit" disabled={isResetting} className={btnCls}>
                  {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reset Password'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
