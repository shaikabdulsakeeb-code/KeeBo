import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateProfileMutation, useUpdateProfileMutation, useGetOwnProfileQuery } from '../api/technicianApi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../auth/authSlice';
import { setFormDirty } from '../../ui/uiSlice';
import { 
  Briefcase, MapPin, DollarSign, Phone, Image as ImageIcon, 
  CheckCircle2, ChevronLeft, ChevronRight, Plus, Minus, X, Zap, 
  Clock, Camera, Star, Award, Droplets, Snowflake, Hammer, Palette, 
  Brush, Waves, Tv, Laptop, Cctv, BookOpen, Building, Sparkles,
  FileText, ShieldCheck, UploadCloud, Info, ExternalLink, Save, ArrowLeft,
  LogOut, AlertCircle, UserCircle, Shield, BadgeCheck
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { name: 'Electrician', icon: <Zap />, color: 'bg-blue-500', lightColor: 'bg-blue-50' },
  { name: 'Plumber', icon: <Droplets />, color: 'bg-orange-500', lightColor: 'bg-orange-50' },
  { name: 'AC Repair', icon: <Snowflake />, color: 'bg-cyan-500', lightColor: 'bg-cyan-50' },
  { name: 'Carpenter', icon: <Hammer />, color: 'bg-amber-500', lightColor: 'bg-amber-50' },
  { name: 'Painter', icon: <Palette />, color: 'bg-rose-500', lightColor: 'bg-rose-50' },
  { name: 'Cleaning', icon: <Brush />, color: 'bg-emerald-500', lightColor: 'bg-emerald-50' },
  { name: 'Washing Machine Repair', icon: <Waves />, color: 'bg-indigo-500', lightColor: 'bg-indigo-50' },
  { name: 'TV Repair', icon: <Tv />, color: 'bg-slate-500', lightColor: 'bg-slate-50' },
  { name: 'Software Installation Expert', icon: <Laptop />, color: 'bg-violet-500', lightColor: 'bg-violet-50' },
  { name: 'CCTV Installation Expert', icon: <Cctv />, color: 'bg-neutral-500', lightColor: 'bg-neutral-50' },
  { name: 'Tutor', icon: <BookOpen />, color: 'bg-lime-500', lightColor: 'bg-lime-50' },
  { name: 'Construction', icon: <Building />, color: 'bg-stone-500', lightColor: 'bg-stone-50' },
  { name: 'Beauty & Personal Care(Mehendi)', icon: <Sparkles />, color: 'bg-pink-500', lightColor: 'bg-pink-50' },
];

const TechnicianOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isEditMode = location.pathname === '/technician/profile-management';
  
  const isDirty = useSelector((state) => state.ui.isFormDirty);
  const user = useSelector((state) => state.auth.user);
  const setIsDirty = (val) => dispatch(setFormDirty(val));

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const { data: profileData, isLoading: isProfileLoading } = useGetOwnProfileQuery(user?._id);
  const existingProfile = profileData?.data;

  // Monitor browser back/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isProfileLoading && existingProfile?.isApproved === 'approved' && location.pathname === '/technician/onboarding') {
      navigate('/technician');
    }
  }, [existingProfile, isProfileLoading, navigate, location.pathname]);

  useEffect(() => {
    if (isSubmitted) setIsDirty(false);
  }, [isSubmitted]);

  const [formData, setFormData] = useState({
    category: 'Electrician',
    experience: 3,
    pricing: '500',
    phoneNumber: '',
    address: '',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    workingHours: { start: '09:00', end: '18:00' },
    serviceAreas: '',
    bio: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [workImages, setWorkImages] = useState([]);
  const [workPreviews, setWorkPreviews] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  useEffect(() => {
    if (existingProfile) {
      let rawDays = existingProfile.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      if (typeof rawDays === 'string') {
        try { rawDays = JSON.parse(rawDays); } catch(e) { rawDays = rawDays.split(',').map(s => s.trim()); }
      }
      
      const dayMapping = {
        'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 
        'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
      };
      
      const parsedDays = rawDays.map(day => dayMapping[day] || day);

      let parsedHours = existingProfile.workingHours || { start: '09:00', end: '18:00' };
      if (typeof parsedHours === 'string') {
        try { parsedHours = JSON.parse(parsedHours); } catch(e) {}
      }

      setFormData({
        category: existingProfile.category || 'Electrician',
        experience: existingProfile.experience || 3,
        pricing: existingProfile.pricing?.toString() || '500',
        phoneNumber: existingProfile.phoneNumber || '',
        address: existingProfile.location?.address || '',
        workingDays: parsedDays,
        workingHours: parsedHours,
        serviceAreas: existingProfile.serviceAreas?.join(', ') || '',
        bio: existingProfile.bio || '',
      });
      if (existingProfile.profileImage && existingProfile.profileImage !== 'default.jpg') {
        setProfilePreview(existingProfile.profileImage);
      }
      if (existingProfile.workImages?.length > 0) {
        setWorkPreviews(existingProfile.workImages);
      }
    }
  }, [existingProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
      setIsDirty(true);
    }
  };

  const handleIdDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdDocument(file);
      setIsDirty(true);
    }
  };

  const handleWorkImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 3 - workPreviews.length;
    const filesToAdd = files.slice(0, availableSlots);
    
    if (files.length > availableSlots) {
      toast.error(`You can only add up to 3 images in total. Adding first ${availableSlots}.`);
    }

    if (filesToAdd.length > 0) {
      setWorkImages(prev => [...prev, ...filesToAdd]);
      setWorkPreviews(prev => [...prev, ...filesToAdd.map(file => URL.createObjectURL(file))]);
      setIsDirty(true);
    }
  };

  const removeWorkImage = (index) => {
    const previewToRemove = workPreviews[index];
    
    // If it's a new upload (blob), we need to find its index in workImages
    if (typeof previewToRemove === 'string' && previewToRemove.startsWith('blob:')) {
      // Find how many blobs were before this one in workPreviews
      const blobsBefore = workPreviews.slice(0, index).filter(p => typeof p === 'string' && p.startsWith('blob:')).length;
      setWorkImages(prev => prev.filter((_, i) => i !== blobsBefore));
    }
    
    setWorkPreviews(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.phoneNumber || !formData.address) {
        return toast.error('Please fill in required fields');
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'workingDays' || key === 'workingHours') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (key === 'address') {
            data.append('address', formData.address);
            data.append('coordinates', JSON.stringify([77.5946, 12.9716]));
        } else {
          data.append(key, formData[key]);
        }
      });
      if (profileImage) data.append('profileImage', profileImage);
      
      const existingToKeep = workPreviews.filter(p => typeof p === 'string' && p.startsWith('http'));
      data.append('existingWorkImages', JSON.stringify(existingToKeep));

      workImages.forEach(img => data.append('workImages', img));
      if (idDocument) data.append('idVerification', idDocument);

      if (existingProfile) {
        await updateProfile(data).unwrap();
        toast.success('Profile updated successfully!');
      } else {
        await createProfile(data).unwrap();
        toast.success('Profile submitted for approval!');
      }
      setIsSubmitted(true);
      setIsDirty(false);
      if (!isEditMode) setStep(5);
    } catch (err) {
      toast.error(err.data?.message || 'Something went wrong');
    }
  };

  if (isProfileLoading) return <div className="h-screen flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const isPending = existingProfile?.isApproved === 'pending';
  const isRejected = existingProfile?.isApproved === 'rejected';
  const isApproved = existingProfile?.isApproved === 'approved';

  // 1. Success Screen
  if (isSubmitted && !isEditMode) {
    return (
      <div className="w-full">
        <div className="min-h-[80vh] flex items-center justify-center px-6 bg-background">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-card border rounded-[3rem] p-10 text-center shadow-2xl">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8"><ShieldCheck className="w-12 h-12 text-green-500" /></div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">Profile Submitted!</h2>
            <p className="text-muted-foreground mb-8 font-medium">Your professional profile is currently <span className="text-orange-500 font-bold italic">under review</span>. We will notify you once you're approved.</p>
            <Button onClick={() => navigate('/technician')} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/20">Go to Dashboard</Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // 2. Profile Management View
  if (isEditMode || (existingProfile && existingProfile.isApproved !== 'approved')) {
    if (!formData || !formData.workingHours) return <div className="h-screen flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest">Initializing...</div>;

    const statusConfig = isApproved 
        ? { label: 'APPROVED', color: 'bg-emerald-500', text: 'Your profile is live and visible to customers.', icon: <ShieldCheck className="w-8 h-8" />, theme: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' }
        : isPending 
        ? { label: 'PENDING', color: 'bg-orange-500', text: 'Your profile is being reviewed by our team.', icon: <Clock className="w-8 h-8" />, theme: 'bg-orange-500/10 border-orange-500/20 text-orange-500' }
        : { label: 'REJECTED', color: 'bg-red-500', text: 'Your profile was not approved. Please update and resubmit.', icon: <AlertCircle className="w-8 h-8" />, theme: 'bg-red-500/10 border-red-500/20 text-red-500' };

    return (
      <div className="w-full">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 pb-32">
          {/* Status Header (Only show if not approved) */}
          {!isApproved && (
            <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center md:justify-between shadow-sm transition-all gap-6 ${statusConfig.theme}`}>
              <div className="flex flex-col md:flex-row items-center text-center md:text-left space-y-4 md:space-y-0 md:space-x-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg bg-background border border-current`}>
                  {statusConfig.icon}
                </div>
                <div>
                  <h4 className={`font-black uppercase tracking-[0.2em] text-xs mb-1`}>Current Status: {statusConfig.label}</h4>
                  <p className="text-sm font-bold opacity-80">{statusConfig.text}</p>
                </div>
              </div>
              <Link to="/contact" className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 flex items-center transition-opacity py-2 px-4 rounded-xl border border-current/20">Help <ExternalLink className="ml-2 w-3 h-3" /></Link>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Profile Management</h1>
              <p className="text-muted-foreground font-medium text-sm md:text-base">Keep your professional identity up to date.</p>
            </div>
            <div className="flex items-center justify-center md:justify-end space-x-3 w-full md:w-auto">
              <Button type="button" variant="outline" onClick={handleLogout} className="flex-1 md:flex-none h-14 px-6 md:px-8 rounded-2xl border-slate-200 dark:border-white/10 font-bold hover:bg-red-500/10 hover:text-red-500 transition-all">
                <LogOut className="w-5 h-5 mr-2" /> Logout
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isUpdating} className="flex-1 md:flex-none h-14 px-8 md:px-10 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest bg-primary text-white">
                {isUpdating ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-8 space-y-6 md:space-y-8">
              
              {/* Identity & Rating Section (MOVED TO TOP) */}
              <div className="bg-card border rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className="w-36 h-36 md:w-40 md:h-40 rounded-[2.5rem] bg-muted overflow-hidden border-4 md:border-8 border-background shadow-2xl ring-1 ring-slate-100 dark:ring-white/5">
                    {profilePreview ? <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-10 h-10 text-slate-300 mx-auto mt-12 md:mt-14" />}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform ring-4 ring-background">
                    <Camera className="w-5 h-5 md:w-6 md:h-6" /><input type="file" className="hidden" accept="image/*" onChange={handleProfileImageChange} />
                  </label>
                  {/* Verified Tick Symbol */}
                  {isApproved && (
                    <div className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-background z-10">
                      <BadgeCheck className="w-6 h-6 md:w-8 h-8" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black">{existingProfile?.userId?.name || 'Professional'}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{formData.category}</p>
                  </div>
                  
                  {isApproved && (
                    <div className="bg-accent/50 rounded-2xl p-4 inline-flex items-center space-x-4 border border-slate-100 dark:border-white/5">
                      <div className="flex items-center space-x-1 text-orange-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="text-2xl font-black">{existingProfile?.averageRating || '0.0'}</span>
                      </div>
                      <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10" />
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Customer Rating</p>
                        <p className="text-xs font-bold">{existingProfile?.totalReviews || 0} Total Reviews</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category & Pricing */}
              <div className="bg-card border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm space-y-6 md:space-y-8">
                <div className="flex items-center space-x-3 text-primary">
                  <div className="p-2 bg-primary/10 rounded-lg"><Zap className="w-4 h-4" /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Service & Pricing</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Professional Category</label>
                    <div className="p-4 md:p-5 bg-muted/30 rounded-[1.5rem] border border-slate-100 dark:border-white/5 flex items-center space-x-4 opacity-60 grayscale cursor-not-allowed">
                      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm">
                        {CATEGORIES.find(c => c.name === formData.category)?.icon || <Zap className="w-5 h-5" />}
                      </div>
                      <span className="font-bold text-sm md:text-base">{formData.category}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Base Price (₹)</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-primary">₹</div>
                      <input 
                        type="number" name="pricing" value={formData.pricing} onChange={handleInputChange} 
                        className="w-full bg-muted/50 border-none rounded-[1.5rem] py-5 pl-14 pr-6 text-xl font-black outline-none focus:ring-2 ring-primary/20 transition-all" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 md:pt-8 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Years of Experience</label>
                    <div className="flex items-center space-x-6 md:space-x-8">
                      <button type="button" onClick={() => {setFormData(prev => ({...prev, experience: Math.max(0, prev.experience-1)})); setIsDirty(true);}} className="w-12 h-12 md:w-14 md:h-14 bg-accent rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"><Minus className="w-6 h-6" /></button>
                      <span className="text-3xl md:text-4xl font-black">{formData.experience}</span>
                      <button type="button" onClick={() => {setFormData(prev => ({...prev, experience: prev.experience+1})); setIsDirty(true);}} className="w-12 h-12 md:w-14 md:h-14 bg-accent rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"><Plus className="w-6 h-6" /></button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Availability (Days)</label>
                    <div className="flex flex-wrap gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                        const isSelected = formData.workingDays.includes(day);
                        return (
                          <button key={day} type="button" onClick={() => {
                            const newDays = isSelected ? formData.workingDays.filter(d => d !== day) : [...formData.workingDays, day];
                            setFormData(prev => ({...prev, workingDays: newDays}));
                            setIsDirty(true);
                          }} className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted/50 text-slate-400 hover:bg-muted'}`}>{day}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Working Hours</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-tight">Opens At</p>
                      <input type="time" value={formData.workingHours.start} onChange={(e) => {setFormData(prev => ({...prev, workingHours:{...prev.workingHours, start: e.target.value}})); setIsDirty(true);}} className="w-full bg-muted/50 border-none rounded-2xl p-4 font-black outline-none focus:ring-2 ring-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-tight">Closes At</p>
                      <input type="time" value={formData.workingHours.end} onChange={(e) => {setFormData(prev => ({...prev, workingHours:{...prev.workingHours, end: e.target.value}})); setIsDirty(true);}} className="w-full bg-muted/50 border-none rounded-2xl p-4 font-black outline-none focus:ring-2 ring-primary/20" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="bg-card border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm space-y-6 md:space-y-8">
                <div className="flex items-center space-x-3 text-primary">
                  <div className="p-2 bg-primary/10 rounded-lg"><MapPin className="w-4 h-4" /></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Contact & Location</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full bg-muted/50 border-none rounded-[1.5rem] py-4 pl-14 pr-6 font-bold outline-none focus:ring-2 ring-primary/20" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Base Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-muted/50 border-none rounded-[1.5rem] py-4 pl-14 pr-6 font-bold outline-none focus:ring-2 ring-primary/20" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Service Areas</label>
                    <input type="text" name="serviceAreas" value={formData.serviceAreas} onChange={handleInputChange} placeholder="Indiranagar, Koramangala..." className="w-full bg-muted/50 border-none rounded-[1.5rem] py-4 px-6 font-bold outline-none focus:ring-2 ring-primary/20" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">About You (Bio)</label>
                    <textarea 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleInputChange} 
                      rows="4"
                      placeholder="Tell customers about your expertise, style, and why they should choose you..." 
                      className="w-full bg-muted/50 border-none rounded-[1.5rem] py-4 px-6 font-bold outline-none focus:ring-2 ring-primary/20 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 space-y-6 md:space-y-8">
              {/* ID Verification */}
              <div className="bg-card border rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Identity Verification</h3>
                
                <div className="space-y-6">
                    {/* Live Preview of Document */}
                    {(existingProfile?.idVerification || idDocument) && (
                      <div className="relative w-full rounded-[2rem] overflow-hidden border-2 border-slate-100 dark:border-white/5 bg-muted/30 group min-h-[200px] flex flex-col items-center justify-center p-6 md:p-8">
                        {idDocument ? (
                          // New file preview
                          <div className="w-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                              <FileText className="w-8 h-8 text-emerald-500" />
                            </div>
                            <p className="font-bold text-sm text-emerald-600 truncate max-w-full px-4">{idDocument.name}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-2">Ready to Upload</p>
                          </div>
                        ) : (
                          // Existing document preview
                          <div className="w-full flex flex-col items-center justify-center">
                            {existingProfile.idVerification.toLowerCase().endsWith('.pdf') ? (
                              <>
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                  <FileText className="w-8 h-8 text-primary" />
                                </div>
                                <p className="font-black text-xs uppercase tracking-widest text-slate-500 mb-6 text-center px-4">Government ID (PDF)</p>
                                <button 
                                  type="button"
                                  onClick={() => setPreviewUrl(existingProfile.idVerification)}
                                  className="w-full py-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                                >
                                  View Document <ExternalLink className="w-4 h-4 ml-2" />
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="absolute inset-0">
                                  <img src={existingProfile.idVerification} alt="Verification ID" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                </div>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                <button 
                                  type="button" 
                                  onClick={() => setPreviewUrl(existingProfile.idVerification)} 
                                  className="relative z-10 px-6 py-3 bg-white/90 backdrop-blur-md rounded-xl text-black text-xs font-black uppercase tracking-widest flex items-center shadow-2xl hover:scale-105 transition-transform"
                                >
                                  Open Preview <ExternalLink className="ml-2 w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="relative group">
                        <input type="file" onChange={handleIdDocChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className={`border-2 border-dashed rounded-[2rem] p-8 text-center transition-all ${idDocument || existingProfile?.idVerification ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/30 hover:bg-muted/50 border-slate-200 dark:border-white/10'}`}>
                            <UploadCloud className={`w-10 h-10 mx-auto mb-4 ${idDocument || existingProfile?.idVerification ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <h4 className="font-black text-sm uppercase tracking-tight mb-1">
                              {idDocument || existingProfile?.idVerification ? 'Update Document' : 'Upload ID Document'}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 italic">Drag and drop or click to browse</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start space-x-3">
                  <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-[10px] font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                    Your document is used exclusively for professional verification and is stored securely. A verified status increases customer trust by up to 80%.
                  </p>
                </div>
              </div>

              {/* Document Preview Modal */}
              <AnimatePresence>
                {previewUrl && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card w-full max-w-5xl h-full max-h-[85vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border border-white/10">
                      <div className="p-4 md:p-6 border-b flex items-center justify-between bg-card">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary"><FileText className="w-5 h-5" /></div>
                          <h3 className="font-black uppercase tracking-widest text-sm">Document Preview</h3>
                        </div>
                        <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-accent rounded-full transition-colors"><X className="w-6 h-6" /></button>
                      </div>
                      <div className="flex-1 bg-muted/20 relative overflow-hidden">
                        {previewUrl.startsWith('blob:') ? (
                            // Local blob preview
                            previewUrl.includes('pdf') || idDocument?.type?.includes('pdf') ? (
                                <iframe src={previewUrl} className="w-full h-full border-none" title="Local PDF Preview" />
                            ) : (
                                <div className="w-full h-full overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                                    <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-xl shadow-lg shadow-black/20" />
                                </div>
                            )
                        ) : (
                            // Cloudinary URL preview
                            <div className="w-full h-full overflow-y-auto p-4 md:p-8 flex flex-col items-center custom-scrollbar">
                                <img 
                                    src={previewUrl.toLowerCase().endsWith('.pdf') ? previewUrl.replace('/upload/', '/upload/f_auto,q_auto,w_1200,dn_72/') .replace(/\.pdf$/i, '.jpg') : previewUrl} 
                                    alt="Document Preview" 
                                    className="max-w-full h-auto rounded-xl shadow-2xl shadow-black/40 ring-1 ring-white/10"
                                    onError={(e) => {
                                        if (previewUrl.toLowerCase().endsWith('.pdf')) {
                                            e.target.style.display = 'none';
                                            const iframe = document.createElement('iframe');
                                            iframe.src = previewUrl;
                                            iframe.className = "w-full h-full border-none absolute inset-0";
                                            e.target.parentNode.appendChild(iframe);
                                        }
                                    }}
                                />
                            </div>
                        )}
                      </div>
                      <div className="p-6 bg-muted/30 border-t flex items-center justify-center">
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-primary hover:underline">
                          <ExternalLink className="w-4 h-4" /> <span>Open in New Tab</span>
                        </a>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Portfolio */}
              <div className="bg-card border rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Portfolio</h3>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {workPreviews.map((preview, i) => (
                    <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
                      <img src={preview} alt={`Work ${i}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeWorkImage(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-90 hover:scale-100"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {workPreviews.length < 3 && (
                    <label className="aspect-square bg-muted/30 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all border-slate-200 dark:border-white/10">
                      <Plus className="w-6 h-6 text-slate-400" />
                      <input type="file" multiple accept="image/*" onChange={handleWorkImagesChange} className="hidden" />
                    </label>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Gallery (Max 3)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Initial Onboarding Flow
  return (
    <div className="w-full">
      <div className="min-h-screen bg-background pb-32 relative">
        <div className="bg-background border-b sticky top-0 z-40 bg-background/80 backdrop-blur-md">
          <div className="max-w-2xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <button type="button" onClick={() => navigate('/')} className="p-2 hover:bg-muted rounded-full transition-colors group flex items-center space-x-2">
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold">Home</span>
              </button>
              <div className="text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Professional Onboarding</span>
                <span className="text-sm font-black text-primary uppercase tracking-wider">Step {step} of 4</span>
              </div>
              <div className="w-10"></div>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s === step ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : s < step ? 'bg-orange-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
              ))}
            </div>
          </div>
        </div>

        <main className="max-w-2xl mx-auto pt-12 px-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div><h1 className="text-3xl font-black mb-3 italic tracking-tight">What's your craft?</h1><p className="text-muted-foreground font-medium">Select your primary professional category.</p></div>
                <div className="grid grid-cols-2 gap-4">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.name} onClick={() => {setFormData(prev => ({ ...prev, category: cat.name })); setIsDirty(true);}} className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 flex flex-col items-center text-center ${formData.category === cat.name ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-transparent bg-card hover:bg-muted/50'}`}>
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl mb-4 transition-transform duration-300 ${formData.category === cat.name ? cat.color + ' text-white scale-110' : cat.lightColor + ' ' + cat.color.replace('bg-', 'text-')}`}>{cat.icon}</div>
                      <p className="font-bold tracking-tight">{cat.name}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div><h1 className="text-3xl font-black mb-3">Professional Terms</h1><p className="text-muted-foreground font-medium">Set your availability and base pricing.</p></div>
                <div className="space-y-6">
                  <div className="bg-card border rounded-[2.5rem] p-10 shadow-sm">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-6 block tracking-widest">Base Starting Price (₹)</label>
                    <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-primary">₹</div>
                        <input type="number" name="pricing" value={formData.pricing} onChange={handleInputChange} className="w-full bg-muted/50 border-none rounded-[1.5rem] py-8 pl-16 pr-8 text-4xl font-black outline-none focus:ring-2 ring-primary/20" />
                    </div>
                  </div>
                  <div className="bg-card border rounded-[2.5rem] p-10 shadow-sm">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-6 block tracking-widest">Available Working Days</label>
                    <div className="flex flex-wrap gap-3">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <button key={day} type="button" onClick={() => {
                          const newDays = formData.workingDays.includes(day) ? formData.workingDays.filter(d => d !== day) : [...formData.workingDays, day];
                          setFormData(prev => ({...prev, workingDays: newDays}));
                          setIsDirty(true);
                        }} className={`px-6 py-4 rounded-2xl font-bold transition-all ${formData.workingDays.includes(day) ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>{day}</button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card border rounded-[2.5rem] p-10 shadow-sm">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-6 block tracking-widest">Operating Hours</label>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Opens At</p>
                        <input type="time" value={formData.workingHours.start} onChange={(e) => {setFormData(prev => ({...prev, workingHours:{...prev.workingHours, start: e.target.value}})); setIsDirty(true);}} className="w-full bg-muted/50 border-none rounded-2xl p-5 font-black text-xl outline-none focus:ring-2 ring-primary/20" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Closes At</p>
                        <input type="time" value={formData.workingHours.end} onChange={(e) => {setFormData(prev => ({...prev, workingHours:{...prev.workingHours, end: e.target.value}})); setIsDirty(true);}} className="w-full bg-muted/50 border-none rounded-2xl p-5 font-black text-xl outline-none focus:ring-2 ring-primary/20" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border rounded-[2.5rem] p-10 shadow-sm">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-6 block tracking-widest">Years of Experience</label>
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={() => {setFormData(prev => ({...prev, experience: Math.max(0, prev.experience-1)})); setIsDirty(true);}} className="w-16 h-16 bg-primary/10 rounded-[1.5rem] text-primary hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center"><Minus className="w-8 h-8" /></button>
                      <div className="text-center"><span className="text-6xl font-black">{formData.experience}</span><span className="text-sm text-slate-400 ml-2 font-black uppercase tracking-[0.2em]">years</span></div>
                      <button type="button" onClick={() => {setFormData(prev => ({...prev, experience: prev.experience+1})); setIsDirty(true);}} className="w-16 h-16 bg-primary/10 rounded-[1.5rem] text-primary hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center"><Plus className="w-8 h-8" /></button>
                    </div>
                  </div>
                  <div className="bg-card border rounded-[2.5rem] p-10 shadow-sm">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-6 block tracking-widest">Professional Bio</label>
                    <textarea 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleInputChange} 
                      rows="3"
                      placeholder="Briefly describe your expertise and service style..." 
                      className="w-full bg-muted/50 border-none rounded-[1.5rem] py-6 px-8 text-lg font-bold outline-none focus:ring-2 ring-primary/20 resize-none"
                    />
                  </div>

                  <div className="bg-card border rounded-[2.5rem] p-10 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Work Portfolio</label>
                      <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">{workPreviews.length}/3 Images</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {workPreviews.map((preview, i) => (
                        <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner">
                          <img src={preview} alt={`Work ${i}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeWorkImage(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-xl p-1.5 opacity-100 shadow-lg scale-90 hover:scale-100 transition-transform"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                      {workPreviews.length < 3 && (
                        <label className="aspect-square bg-muted/30 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all border-slate-200 dark:border-white/10">
                          <Plus className="w-6 h-6 text-slate-400" />
                          <input type="file" multiple accept="image/*" onChange={handleWorkImagesChange} className="hidden" />
                        </label>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 italic text-center">Add up to 3 photos of your best work.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div><h1 className="text-3xl font-black mb-3">Reachability</h1><p className="text-muted-foreground font-medium">Where and how can customers find you?</p></div>
                <div className="space-y-6">
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Phone Number" className="w-full bg-card border rounded-[1.5rem] py-6 pl-16 pr-6 font-bold outline-none focus:ring-2 ring-primary/20 shadow-sm" />
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Full Address / Studio Location" className="w-full bg-card border rounded-[1.5rem] py-6 pl-16 pr-6 font-bold outline-none focus:ring-2 ring-primary/20 shadow-sm" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Service Areas</label>
                    <input type="text" name="serviceAreas" value={formData.serviceAreas} onChange={handleInputChange} placeholder="Indiranagar, Koramangala, etc." className="w-full bg-card border rounded-[1.5rem] py-6 px-8 font-bold outline-none focus:ring-2 ring-primary/20 shadow-sm" />
                    <p className="text-[10px] font-medium text-slate-400 italic">* Separate multiple areas with commas.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-center">
                <div><h1 className="text-3xl font-black mb-3 italic tracking-tight">Final Identity Check</h1><p className="text-muted-foreground font-medium">Verify your profile for customer trust.</p></div>
                <div className="space-y-12">
                    <div className="relative inline-block">
                        <div className="w-56 h-56 rounded-[4rem] bg-muted overflow-hidden border-8 border-white shadow-2xl mx-auto ring-1 ring-slate-100">
                        {profilePreview ? <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><Camera className="w-16 h-16" /></div>}
                        </div>
                        <label className="absolute bottom-2 right-2 w-14 h-14 bg-primary text-white rounded-[1.25rem] flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform ring-4 ring-white">
                        <Camera className="w-7 h-7" /><input type="file" className="hidden" accept="image/*" onChange={handleProfileImageChange} />
                        </label>
                    </div>

                    <div className="bg-card border rounded-[2.5rem] p-10 shadow-sm space-y-6 text-left">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">ID Verification</h3>
                        <label className="block border-2 border-dashed rounded-[2rem] p-10 text-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-all border-slate-200">
                            {idDocument ? <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" /> : <UploadCloud className="w-12 h-12 mx-auto mb-4 text-slate-400" />}
                            <p className="font-black text-slate-600 uppercase tracking-tight">{idDocument ? idDocument.name : 'Upload Government ID'}</p>
                            <p className="text-xs text-slate-400 mt-2 font-bold italic">* Required for professional status.</p>
                            <input type="file" className="hidden" onChange={handleIdDocChange} />
                        </label>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-lg p-8 border-t z-40">
          <div className="max-w-2xl mx-auto flex items-center space-x-6">
            {step > 1 && <Button type="button" variant="ghost" onClick={prevStep} className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:text-primary">Back</Button>}
            <Button type="button" onClick={step === 4 ? handleSubmit : nextStep} disabled={isCreating || isUpdating} className="flex-1 h-16 rounded-[1.5rem] text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 bg-primary text-white">
              {isCreating || isUpdating ? 'Processing...' : step === 4 ? 'Complete Onboarding' : 'Continue'}
              {step < 4 && <ChevronRight className="w-7 h-7 ml-3" />}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TechnicianOnboarding;
