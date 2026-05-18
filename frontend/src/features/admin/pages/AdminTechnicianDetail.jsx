import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShieldCheck, User, MapPin, 
  Trash2, Briefcase, Star, Award, Phone, Mail, 
  DollarSign, CheckCircle, Info, Calendar, ExternalLink,
  AlertTriangle, FileText
} from 'lucide-react';
import { useGetTechnicianByIdQuery, useDeleteTechnicianMutation, useSuspendTechnicianMutation } from '../api/adminApi';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

const AdminTechnicianDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: techResponse, isLoading } = useGetTechnicianByIdQuery(id);
  const [deleteTech, { isLoading: isDeleting }] = useDeleteTechnicianMutation();
  const [suspendTech, { isLoading: isSuspending }] = useSuspendTechnicianMutation();

  const tech = techResponse?.data;

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');

  const handleToggleSuspend = async () => {
    if (tech.isSuspended) {
      try {
        const res = await suspendTech({ id: tech._id }).unwrap();
        toast.success(res.message || 'Technician reactivated successfully');
      } catch (err) {
        toast.error(err.data?.message || 'Failed to reactivate technician');
      }
    } else {
      setSuspensionReason(`Outstanding platform dues unpaid for ${tech.daysSinceLastPayment || 0} days. Profile locked until settled.`);
      setShowSuspendModal(true);
    }
  };

  const confirmSuspend = async () => {
    try {
      const res = await suspendTech({ id: tech._id, suspensionReason }).unwrap();
      toast.success(res.message || 'Technician profile suspended');
      setShowSuspendModal(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to suspend technician');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTech(tech._id).unwrap();
      toast.success('Technician profile removed');
      navigate('/admin/technicians');
    } catch (err) {
      toast.error('Failed to delete technician');
    }
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!tech) return <div className="text-center py-20 bg-white rounded-3xl border shadow-sm space-y-4">
    <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto" />
    <h2 className="text-2xl font-black">Technician Not Found</h2>
    <Button onClick={() => navigate('/admin/technicians')}>Back to Directory</Button>
  </div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <button onClick={() => navigate('/admin/technicians')} className="flex items-center text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Professionals
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-6 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center space-x-2">
              {tech.isSuspended && (
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-widest bg-rose-50 text-rose-600 animate-pulse border border-rose-100">
                  SUSPENDED
                </span>
              )}
              <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-widest border ${tech.isApproved === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                {tech.isApproved} Status
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10 text-center md:text-left pt-12 sm:pt-0">
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2.5rem] md:rounded-[3rem] bg-slate-50 overflow-hidden border-4 border-white shadow-2xl ring-1 ring-slate-100 flex-shrink-0">
                {tech.profileImage && tech.profileImage !== 'default.jpg' ? <img src={tech.profileImage} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-10 text-slate-200" />}
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">{tech.userId?.name}</h1>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{tech.category}</p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <div className="flex items-center bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm">
                    <Star className="w-4 h-4 mr-1.5 fill-orange-400 text-orange-400" /> {tech.averageRating || '0.0'}
                  </div>
                  <div className="flex items-center bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm">
                    <Award className="w-4 h-4 mr-1.5" /> {tech.experience} Yrs Exp
                  </div>
                  <div className="flex items-center text-slate-400 font-bold text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> {tech.location?.address || 'Address not provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-[2.5rem] p-10 shadow-sm space-y-8">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Professional Background</h3>
            </div>
            <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
              <p className="text-lg font-medium leading-relaxed text-slate-600 italic">"{tech.bio || 'No professional biography provided.'}"</p>
            </div>
          </div>

          <div className="bg-white border rounded-[2.5rem] p-10 shadow-sm space-y-8">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Work Portfolio & Gallery</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {tech.workImages?.map((img, i) => (
                <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border-2 border-white shadow-xl hover:scale-105 transition-transform cursor-pointer relative group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                </div>
              )) || <p className="text-sm italic text-slate-400">No portfolio images available.</p>}
            </div>
          </div>
          
          {/* ID Verification Document */}
          <div className="bg-white border rounded-[2.5rem] p-10 shadow-sm space-y-8">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Identity Verification</h3>
            </div>
            {tech.idVerification ? (
              <div className="space-y-4">
                <div className="relative w-full rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-inner bg-slate-50 flex items-center justify-center">
                  <img 
                    src={tech.idVerification.toLowerCase().endsWith('.pdf') 
                      ? tech.idVerification.replace(/\.pdf$/i, '.jpg') 
                      : tech.idVerification
                    } 
                    alt="ID Document Preview" 
                    className="w-full h-auto max-h-[600px] min-h-[250px] object-contain" 
                    onError={(e) => {
                      if (tech.idVerification.toLowerCase().endsWith('.pdf')) {
                          const iframe = document.createElement('iframe');
                          iframe.src = tech.idVerification;
                          iframe.className = "w-full h-[800px] border-none";
                          e.target.parentNode.appendChild(iframe);
                          e.target.style.display = 'none';
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-10 bg-orange-50 border border-orange-100 rounded-[2rem] flex flex-col items-center text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-orange-500" />
                <p className="font-bold text-orange-700 uppercase tracking-widest text-xs">No verification document uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Secondary Stats & Actions */}
        <div className="space-y-8">
          <div className="bg-white border rounded-[2.5rem] p-10 shadow-sm space-y-8">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Service Metrics</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Base Pricing', val: `₹${tech.pricing}`, icon: <DollarSign className="w-4 h-4" /> },
                { label: 'Jobs Done', val: tech.jobsDone || 0, icon: <CheckCircle className="w-4 h-4" /> },
                { label: 'Reviews', val: tech.totalReviews || 0, icon: <Star className="w-4 h-4" /> },
                { label: 'Availability', val: tech.workingDays?.length + ' Days/Wk', icon: <Calendar className="w-4 h-4" /> }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-white">
                  <div className="flex items-center space-x-3 text-slate-400">
                    {stat.icon}
                    <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <span className="font-black text-slate-900">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-[2.5rem] p-10 shadow-sm space-y-8">
             <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-primary" />
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Contact Details</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary"><Phone className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Mobile Number</p>
                  <p className="font-bold">{tech.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary"><Mail className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Email Address</p>
                  <p className="font-bold">{tech.userId?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Suspension Control */}
          <div className={`${tech.isSuspended ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50 border-slate-100'} border rounded-[2.5rem] p-10 space-y-6 transition-all`}>
            <div className="space-y-2">
              <h3 className={`font-black uppercase tracking-widest text-xs ${tech.isSuspended ? 'text-amber-700' : 'text-slate-500'}`}>
                Suspension Control
              </h3>
              <p className="text-xs font-medium text-slate-400">
                {tech.isSuspended 
                  ? 'This profile is currently suspended and hidden from user listings. Click Reactivate to lift the suspension.' 
                  : 'Suspend this technician to immediately hide their services and profile from all customer pages.'
                }
              </p>
            </div>
            <Button 
              onClick={handleToggleSuspend}
              disabled={isSuspending}
              className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-md transition-all ${
                tech.isSuspended 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse' 
                  : 'bg-slate-850 hover:bg-slate-900 text-white'
              }`}
            >
              {isSuspending ? 'Processing...' : tech.isSuspended ? 'Reactivate Profile' : 'Suspend Profile'}
            </Button>
          </div>

          <div className="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-10 space-y-8">
            <div className="space-y-2">
              <h3 className="font-black text-red-600 uppercase tracking-widest text-xs">Danger Zone</h3>
              <p className="text-xs font-medium text-red-400">Removing this profile is permanent and will clear all associated job history from the admin view.</p>
            </div>
            <Button onClick={() => setShowDeleteModal(true)} className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-500/20">
              Terminate Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white border rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 max-w-sm w-full text-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Confirm Termination</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">Are you absolutely sure? All data for <span className="text-slate-900 font-bold">{tech.userId?.name}</span> will be purged from the technician list.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={confirmDelete} disabled={isDeleting} className="h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-xl shadow-red-600/20">
                  {isDeleting ? 'Terminating...' : 'Delete Permanently'}
                </Button>
                <button onClick={() => setShowDeleteModal(false)} className="h-14 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suspend Reason Confirmation Modal */}
      <AnimatePresence>
        {showSuspendModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white border rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 max-w-lg w-full text-center space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
              
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-10 h-10" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Suspend Profile</h3>
                
                <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100 text-left space-y-2">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Platform Due Analytics</p>
                  <p className="text-sm font-extrabold text-amber-900">
                    Outstanding Balance: <span className="text-slate-900 font-black">₹{tech.outstandingDues || 0}</span>
                  </p>
                  <p className="text-xs font-bold text-amber-800">
                    Last Payment Settled: <span className="underline">{tech.daysSinceLastPayment || 0} days ago</span>
                  </p>
                  <p className="text-[11px] text-amber-600 font-medium">
                    ⚠️ The professional has failed to pay platform commissions for over {tech.daysSinceLastPayment || 0} days.
                  </p>
                </div>
                
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Provide a reason for suspension. This will be shown on the technician's private dashboard.
                </p>
              </div>

              <div className="text-left space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suspension Reason</label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g., Outstanding platform dues unpaid. Account locked until balance is settled."
                  className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={confirmSuspend} 
                  disabled={isSuspending} 
                  className="h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-xl shadow-amber-600/20"
                >
                  {isSuspending ? 'Suspending...' : 'Confirm Suspension'}
                </Button>
                <button 
                  onClick={() => setShowSuspendModal(false)} 
                  className="h-14 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTechnicianDetail;
