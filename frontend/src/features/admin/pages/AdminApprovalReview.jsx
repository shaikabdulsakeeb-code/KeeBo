import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShieldCheck, User, MapPin, 
  Star, Award, Phone, Mail, DollarSign, 
  CheckCircle, FileText, Briefcase, ChevronRight,
  ChevronLeft, X, AlertTriangle, Eye
} from 'lucide-react';
import { useGetTechnicianByIdQuery, useVerifyTechnicianMutation } from '../api/adminApi';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'Identity', icon: <FileText className="w-4 h-4" /> },
  { id: 2, title: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 3, title: 'Portfolio', icon: <Briefcase className="w-4 h-4" /> },
  { id: 4, title: 'Decision', icon: <ShieldCheck className="w-4 h-4" /> }
];

const AdminApprovalReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: techResponse, isLoading } = useGetTechnicianByIdQuery(id);
  const [verifyTech] = useVerifyTechnicianMutation();

  const tech = techResponse?.data;

  const handleAction = async (status) => {
    // Basic validation for rejection
    if (status === 'rejected' && (!rejectionReason || !rejectionReason.trim())) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    const payload = {
      id: id,
      status: status,
      rejectionReason: status === 'rejected' ? rejectionReason.trim() : ''
    };

    setIsVerifying(true);
    try {
      await verifyTech(payload).unwrap();
      
      toast.success(status === 'approved' ? 'Technician Verified Successfully!' : 'Technician Application Rejected');
      setShowRejectModal(false);
      navigate('/admin/approvals');
    } catch (err) {
      toast.error(err.data?.message || 'Action failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!tech) return <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">Not Found</div>;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-slate-50 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100">
              <h3 className="text-lg font-black mb-6">Step 1: Document Verification</h3>
              {tech.idVerification ? (
                <div className="space-y-4">
                  <div className="relative w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center">
                    <img 
                      src={tech.idVerification.toLowerCase().endsWith('.pdf') ? tech.idVerification.replace(/\.pdf$/i, '.jpg') : tech.idVerification} 
                      alt="ID Document" 
                      className="w-full h-auto max-h-[500px] min-h-[250px] object-contain" 
                    />
                  </div>
                  <p className="text-xs text-slate-400 font-bold text-center">Verify the ID number and validity of the document provided.</p>
                </div>
              ) : (
                <div className="p-12 bg-orange-50 rounded-[2rem] border border-dashed border-orange-200 text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
                  <p className="font-black text-orange-800 uppercase tracking-widest text-xs">No Document Uploaded</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-slate-50 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 space-y-8">
              <h3 className="text-lg font-black">Step 2: Profile & Experience Audit</h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white flex-shrink-0">
                  {tech.profileImage ? <img src={tech.profileImage} className="w-full h-full object-cover" alt="" /> : <User className="w-full h-full p-5 sm:p-6 text-slate-200" />}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-800">{tech.userId?.name}</h4>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">{tech.category}</span>
                    <span className="text-xs font-bold text-slate-400 bg-white border px-3 py-1 rounded-full">{tech.experience} Yrs Exp</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                   <div className="flex items-center space-x-3 text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase">Contact Info</span>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-sm flex items-center"><Phone className="w-3 h-3 mr-2 text-primary" /> {tech.phoneNumber}</p>
                    <p className="font-bold text-sm flex items-center"><Mail className="w-3 h-3 mr-2 text-primary" /> {tech.userId?.email}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                   <div className="flex items-center space-x-3 text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase">Base Location</span>
                  </div>
                  <p className="font-bold text-sm leading-relaxed">{tech.location?.address || 'Address not provided'}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-slate-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase">Pricing Model</span>
                    </div>
                    <p className="font-black text-xl text-slate-900">₹{tech.pricing}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-400">
                  <Star className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">Professional Bio</span>
                </div>
                <p className="text-sm font-medium leading-relaxed bg-white p-8 rounded-[2rem] border italic text-slate-600">"{tech.bio || 'No bio provided'}"</p>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
             <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-8">
              <h3 className="text-lg font-black">Step 3: Quality Check (Portfolio)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {tech.workImages?.map((img, i) => (
                  <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-xl relative group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )) || <p>No images.</p>}
              </div>
              <p className="text-xs text-slate-400 font-bold text-center">Ensure the quality of previous work matches platform standards.</p>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 py-10">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner ring-8 ring-primary/5">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tight">Final Decision</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">Review complete. Please make a final determination for <span className="text-slate-900 font-bold">{tech.userId?.name}'s</span> application.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Button 
                onClick={() => handleAction('approved')} 
                disabled={isVerifying}
                className="flex-1 h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Approve'}
              </Button>
              <Button 
                onClick={() => setShowRejectModal(true)} 
                variant="outline"
                disabled={isVerifying}
                className="flex-1 h-20 border-2 border-red-100 text-red-500 hover:bg-red-50 rounded-3xl font-black uppercase tracking-[0.2em]"
              >
                Reject Application
              </Button>
            </div>

            {/* Rejection Modal */}
            <AnimatePresence>
              {showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    onClick={() => setShowRejectModal(false)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden p-6 sm:p-10 space-y-6 sm:space-y-8"
                  >
                    <div className="flex items-center space-x-4 text-red-500">
                      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900">Rejection Reason</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Feedback for the professional</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        Please specify exactly why you are rejecting <span className="font-bold text-slate-900">{tech.userId?.name}</span>. This will be shown to them so they can correct their profile.
                      </p>
                      <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g., Your ID document is blurry, please re-upload a clear photo."
                        className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-medium outline-none focus:ring-4 ring-red-500/10 focus:border-red-500/20 transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRejectModal(false)}
                        className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-2"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => handleAction('rejected')}
                        disabled={isVerifying || !rejectionReason.trim()}
                        className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-500/20"
                      >
                        Confirm Reject
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 md:px-0">
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <button onClick={() => navigate('/admin/approvals')} className="flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit Review
        </button>
        <div className="px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          Application Pending
        </div>
      </div>

      <div className="bg-white border rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col min-h-[700px]">
        {/* Progress Bar */}
        <div className="bg-slate-50 border-b p-6 sm:p-8 md:px-12 flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-500" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
           
           {STEPS.map(step => (
             <div key={step.id} className={`flex flex-col items-center space-y-2 relative z-10 ${currentStep >= step.id ? 'text-primary' : 'text-slate-300'}`}>
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${currentStep === step.id ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : currentStep > step.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border'}`}>
                 {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.icon}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${currentStep > step.id ? 'text-emerald-600' : ''}`}>{step.title}</span>
             </div>
           ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 p-6 sm:p-8 md:p-12 overflow-y-auto custom-scrollbar">
          {renderStepContent()}
        </div>

        {/* Footer Navigation */}
        <div className="p-8 border-t bg-slate-50 flex justify-between items-center">
          <button 
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => prev - 1) }
            className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> <span>Previous Step</span>
          </button>

          {currentStep < 4 && (
            <Button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              Next Step <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalReview;
