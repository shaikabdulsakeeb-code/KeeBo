import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useGetAdminSettingsQuery, 
  useUpdateAdminSettingsMutation 
} from '../api/adminApi';
import { 
  Percent, DollarSign, ShieldAlert, MapPin, 
  Mail, Phone, Save, RefreshCw, AlertTriangle, CheckCircle, 
  HelpCircle, ToggleLeft, ToggleRight, Loader2, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';

const AdminSettings = () => {
  const { data: settingsResponse, isLoading, isError, refetch } = useGetAdminSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateAdminSettingsMutation();
  
  const [activeTab, setActiveTab] = useState('financial');
  const [formData, setFormData] = useState({
    commissionRate: 15,
    baseBookingFee: 99,
    taxRate: 18,
    requireIdentityVerification: true,
    requirePortfolioVerification: true,
    autoApproveTechnicians: false,
    supportEmail: 'support@keebo.com',
    supportPhone: '+91 98765 43210',
    maxActiveBookingsPerTech: 5,
    upiqrCodeUrl: ''
  });

  // Sync state with fetched data
  useEffect(() => {
    if (settingsResponse?.data) {
      setFormData(settingsResponse.data);
    }
  }, [settingsResponse]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleToggle = async (name) => {
    const updatedValue = !formData[name];
    const newFormData = {
      ...formData,
      [name]: updatedValue
    };
    
    // Optimistically update local state
    setFormData(newFormData);
    
    try {
      await updateSettings(newFormData).unwrap();
      const friendlyName = name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      toast.success(`${friendlyName} updated successfully!`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update settings');
      // Rollback local state on error
      setFormData(prev => ({
        ...prev,
        [name]: !updatedValue
      }));
    }
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          upiqrCodeUrl: reader.result
        }));
        toast.success('QR Code loaded. Click "Save System Settings" to persist!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrRemove = () => {
    setFormData(prev => ({
      ...prev,
      upiqrCodeUrl: ''
    }));
    toast.success('QR Code removed from preview. Remember to save!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      toast.success('System settings updated successfully!');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update system settings');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to platform defaults?')) {
      setFormData({
        commissionRate: 15,
        baseBookingFee: 99,
        taxRate: 18,
        requireIdentityVerification: true,
        requirePortfolioVerification: true,
        autoApproveTechnicians: false,
        supportEmail: 'support@keebo.com',
        supportPhone: '+91 98765 43210',
        maxActiveBookingsPerTech: 5,
        upiqrCodeUrl: ''
      });
      toast.success('Form reset to default values. Don\'t forget to save!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading system settings...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-black text-slate-800">Failed to Load Settings</h2>
        <p className="text-sm text-slate-500 max-w-md">There was an error communicating with the backend. Please check if the server is running.</p>
        <Button onClick={refetch} className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" /> <span>Retry Loading</span>
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'financial', label: 'Financials & Fees', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'policy', label: 'Verification & Policy', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'operations', label: 'Availability & Support', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">System Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Configure global pricing, verification queues, and support parameters.</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button 
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset Defaults
          </button>
        </div>
      </header>


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none snap-x">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl transition-all duration-200 text-left font-bold shrink-0 snap-start ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]' 
                    : 'bg-white border border-slate-150 hover:border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'
                } w-auto lg:w-full`}
              >
                {tab.icon}
                <span className="text-xs sm:text-sm whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Panels */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
            <AnimatePresence mode="wait">
              {activeTab === 'financial' && (
                <motion.div
                  key="financial"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b pb-4 mb-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center">
                      <DollarSign className="w-5 h-5 text-emerald-500 mr-2" />
                      Financial & Commission Configurations
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Set platform fees, commission rates, and transactional taxes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Platform Commission Rate (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="commissionRate"
                          value={formData.commissionRate}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-primary transition-colors text-slate-800"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">The cut KeeBo takes from every completed booking service payout.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Base Booking Fee (₹)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                        <input
                          type="number"
                          name="baseBookingFee"
                          value={formData.baseBookingFee}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-primary transition-colors text-slate-800"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">Flat platform service fee added to each technician service book.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Standard Tax / GST Rate (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="taxRate"
                          value={formData.taxRate}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-primary transition-colors text-slate-800"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">Standard GST or service tax added automatically to invoices.</p>
                    </div>
                  </div>

                  {/* UPI QR Code Scanner Upload Segment */}
                  <div className="border-t border-slate-100 pt-6 mt-6">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Platform UPI Settlement QR Code</label>
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 border border-slate-100 bg-slate-50/50 rounded-[2rem]">
                      <div className="w-32 h-32 bg-white border border-slate-100 rounded-2xl flex items-center justify-center p-3 shadow-sm relative overflow-hidden flex-shrink-0">
                        {formData.upiqrCodeUrl ? (
                          <img 
                            src={formData.upiqrCodeUrl} 
                            alt="Admin UPI Scanner Preview" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Info className="w-8 h-8 mb-1.5" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">No Scanner</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-black text-sm text-slate-800">Upload Payout QR Code</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
                          Upload your business GPay, PhonePe, Paytm, or BHIM QR code image. This scanner will be displayed to technicians when they pay their weekly dues.
                        </p>
                        
                        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
                          <label className="relative cursor-pointer bg-white hover:bg-slate-50 border text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm inline-flex items-center">
                            <span>{formData.upiqrCodeUrl ? 'Change Image' : 'Select Scanner Image'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleQrUpload} 
                              className="hidden" 
                            />
                          </label>
                          {formData.upiqrCodeUrl && (
                            <button
                              type="button"
                              onClick={handleQrRemove}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
                            >
                              Remove Scanner
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'policy' && (
                <motion.div
                  key="policy"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b pb-4 mb-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center">
                      <ShieldAlert className="w-5 h-5 text-blue-500 mr-2" />
                      Verification & Auditing Policies
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Configure professional onboarding rules and security gates.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div>
                        <h4 className="font-black text-sm text-slate-800">Require Identity Verification Documents</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Technicians must upload Govt. ID proofs before manual admin audit.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle('requireIdentityVerification')}
                        className="text-primary hover:opacity-90 focus:outline-none transition-opacity"
                      >
                        {formData.requireIdentityVerification ? (
                          <ToggleRight className="w-12 h-12 text-primary" />
                        ) : (
                          <ToggleLeft className="w-12 h-12 text-slate-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div>
                        <h4 className="font-black text-sm text-slate-800">Require Portfolio & Certifications</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Technicians must supply training certs or reference links.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle('requirePortfolioVerification')}
                        className="text-primary hover:opacity-90 focus:outline-none transition-opacity"
                      >
                        {formData.requirePortfolioVerification ? (
                          <ToggleRight className="w-12 h-12 text-primary" />
                        ) : (
                          <ToggleLeft className="w-12 h-12 text-slate-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div>
                        <h4 className="font-black text-sm text-slate-800">Auto-Approve Technician Profiles</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Profiles are activated instantly on registration without admin review.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle('autoApproveTechnicians')}
                        className="text-primary hover:opacity-90 focus:outline-none transition-opacity"
                      >
                        {formData.autoApproveTechnicians ? (
                          <ToggleRight className="w-12 h-12 text-primary" />
                        ) : (
                          <ToggleLeft className="w-12 h-12 text-slate-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Max Active Bookings Per Tech</label>
                      <input
                        type="number"
                        name="maxActiveBookingsPerTech"
                        value={formData.maxActiveBookingsPerTech}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-primary transition-colors text-slate-800"
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5">Maximum bookings a technician can have active simultaneously to prevent spam or capacity issues.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'operations' && (
                <motion.div
                  key="operations"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b pb-4 mb-6">
                    <h3 className="text-lg font-black text-slate-800 flex items-center">
                      <MapPin className="w-5 h-5 text-orange-500 mr-2" />
                      Availability & Customer Support Info
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Set localized matchmaking limits and system contacts.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Support Email Address</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          name="supportEmail"
                          value={formData.supportEmail}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-primary transition-colors text-slate-800"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">Displayed to clients and tech staff for booking resolution tickets.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Support Contact Number</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="supportPhone"
                          value={formData.supportPhone}
                          onChange={handleInputChange}
                          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-primary transition-colors text-slate-800"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">Platform hotline number visible on receipts and dashboard contact drawers.</p>
                    </div>
                  </div>
                </motion.div>
              )}


            </AnimatePresence>

            <div className="border-t border-slate-100 mt-10 pt-6 flex justify-end space-x-3">
              <Button
                type="submit"
                disabled={isUpdating}
                className="btn-primary rounded-xl font-bold flex items-center px-6 py-2.5 shadow-md shadow-primary/10"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save System Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
