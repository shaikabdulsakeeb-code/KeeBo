import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateProfileMutation } from '../api/technicianApi';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, MapPin, DollarSign, Phone, Image as ImageIcon, 
  CheckCircle2, ChevronLeft, ChevronRight, Plus, Minus, X, Zap, 
  Clock, Camera, Star, Award
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { name: 'Electrician', icon: <Zap />, color: 'bg-blue-500', lightColor: 'bg-blue-50' },
  { name: 'Plumber', icon: <Briefcase />, color: 'bg-orange-500', lightColor: 'bg-orange-50' },
  { name: 'AC Repair', icon: <Zap />, color: 'bg-cyan-500', lightColor: 'bg-cyan-50' },
  { name: 'Carpenter', icon: <Award />, color: 'bg-amber-500', lightColor: 'bg-amber-50' },
  { name: 'Painter', icon: <Award />, color: 'bg-rose-500', lightColor: 'bg-rose-50' },
  { name: 'Cleaning', icon: <Briefcase />, color: 'bg-emerald-500', lightColor: 'bg-emerald-50' },
];

const TechnicianOnboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: 'Electrician',
    experience: 3,
    pricing: '500',
    phoneNumber: '',
    address: '',
    skills: [],
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: { start: '09:00', end: '18:00' },
    serviceAreas: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  
  const [createProfile, { isLoading }] = useCreateProfileMutation();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const toggleDay = (day) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const fullDay = days.find(d => d.startsWith(day));
    const newDays = formData.workingDays.includes(fullDay)
      ? formData.workingDays.filter(d => d !== fullDay)
      : [...formData.workingDays, fullDay];
    setFormData({ ...formData, workingDays: newDays });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.phoneNumber || !formData.address || !formData.serviceAreas) {
      toast.error('Please fill in all required fields');
      return;
    }

    const data = new FormData();
    data.append('category', formData.category);
    data.append('experience', formData.experience);
    data.append('pricing', formData.pricing);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('address', formData.address);
    data.append('serviceAreas', formData.serviceAreas);
    data.append('workingDays', JSON.stringify(formData.workingDays));
    data.append('workingHours', JSON.stringify(formData.workingHours));
    data.append('coordinates', JSON.stringify([77.5946, 12.9716])); // Default Bengaluru coords
    
    if (profileImage) {
      data.append('profileImage', profileImage);
    }

    try {
      await createProfile(data).unwrap();
      toast.success('Profile created successfully! Admin will review it shortly.');
      navigate('/technician');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create profile');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Stepper Header */}
      <header className="fixed top-0 left-0 w-full bg-white z-50 px-6 py-6 border-b">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={prevStep} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Onboarding Progress</span>
            <span className="text-sm font-black text-primary uppercase">Step {step} of 4</span>
          </div>
          <div className="w-10"></div>
        </div>
        <div className="max-w-2xl mx-auto mt-6 flex space-x-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-slate-100'}`} />
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto pt-36 px-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl font-black mb-3">Choose your specialty</h1>
                <p className="text-muted-foreground">Select the category that best describes your professional services.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => (
                  <div 
                    key={cat.name}
                    onClick={() => setFormData({ ...formData, category: cat.name })}
                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                      formData.category === cat.name 
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                        : 'border-transparent bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${
                      formData.category === cat.name ? cat.color + ' text-white' : cat.lightColor + ' ' + cat.color.replace('bg-', 'text-')
                    }`}>
                      {cat.icon}
                    </div>
                    <p className="font-bold">{cat.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl font-black mb-3">Professional Info</h1>
                <p className="text-muted-foreground">Let us know about your experience and how much you charge.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-6 block">Years of Experience</label>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setFormData({...formData, experience: Math.max(0, formData.experience-1)})} className="w-14 h-14 bg-primary/10 rounded-2xl text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Minus className="w-6 h-6" /></button>
                    <div className="text-center">
                      <span className="text-5xl font-black">{formData.experience}</span>
                      <span className="text-sm text-slate-400 ml-2 font-bold uppercase tracking-widest">years</span>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, experience: formData.experience+1})} className="w-14 h-14 bg-primary/10 rounded-2xl text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Plus className="w-6 h-6" /></button>
                  </div>
                </div>

                <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-6 block">Base Hourly Rate (₹)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                    <input 
                      type="number" 
                      name="pricing"
                      value={formData.pricing}
                      onChange={handleInputChange}
                      className="w-full bg-muted/50 border-none rounded-2xl py-6 pl-16 pr-6 text-2xl font-black outline-none focus:ring-2 ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl font-black mb-3">Contact & Location</h1>
                <p className="text-muted-foreground">How can customers reach you and where do you work?</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      id="phoneNumber"
                      type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-card border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      id="address"
                      type="text" name="address" value={formData.address} onChange={handleInputChange}
                      placeholder="Your office or home address"
                      className="w-full bg-card border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service Areas (Comma separated)</label>
                  <input 
                    id="serviceAreas"
                    type="text" name="serviceAreas" value={formData.serviceAreas} onChange={handleInputChange}
                    placeholder="Indiranagar, Koramangala, Whitefield..."
                    className="w-full bg-card border rounded-2xl py-4 px-4 outline-none focus:ring-2 ring-primary/20"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl font-black mb-3">Profile Identity (Optional)</h1>
                <p className="text-muted-foreground">Upload a clear photo of yourself to build trust with customers. You can skip this and add it later in settings.</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-[3rem] bg-muted overflow-hidden border-4 border-white shadow-xl">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Camera className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageChange} />
                  </label>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-6 uppercase tracking-widest">Recommended: Square photo, 500x500px</p>
              </div>

              <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10">
                <div className="flex items-center space-x-3 text-primary mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">Trust Badge</span>
                </div>
                <p className="text-xs text-muted-foreground">Profiles with real photos get 3x more bookings on average.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white p-6 border-t z-50">
        <div className="max-w-2xl mx-auto flex items-center space-x-4">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} className="h-16 px-8 rounded-2xl border-slate-200">
              Back
            </Button>
          )}
          <Button 
            onClick={step === 4 ? handleSubmit : nextStep} 
            disabled={isLoading}
            className="flex-1 h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            {isLoading ? 'Processing...' : step === 4 ? 'Finish Setup' : 'Continue'}
            {step < 4 && <ChevronRight className="w-6 h-6 ml-2" />}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default TechnicianOnboarding;
