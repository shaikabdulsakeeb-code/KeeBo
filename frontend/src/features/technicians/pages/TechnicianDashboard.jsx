import { motion, AnimatePresence } from 'framer-motion';
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from '../../bookings/api/bookingApi';
import { useGetOwnProfileQuery, useGetTechnicianReviewsQuery, usePayDuesMutation } from '../api/technicianApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/authSlice';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Calendar, MapPin, Clock, DollarSign, Star, Briefcase, 
  Settings, ChevronRight, TrendingUp, Bell, User, PhoneCall, CheckCircle2,
  AlertTriangle, QrCode, X, Lock, Check, ShieldAlert, Info
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const TechnicianDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } = useGetOwnProfileQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  const { data: bookingsData, isLoading } = useGetBookingsQuery();
  const [updateStatus] = useUpdateBookingStatusMutation();
  const [payDues, { isLoading: isPaying }] = usePayDuesMutation();
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [txnRef, setTxnRef] = useState('');
  const [screenshot, setScreenshot] = useState('');

  // Reset payment form when modal opens
  useEffect(() => {
    if (isPaymentModalOpen) {
      setTxnRef('');
      setScreenshot('');
    }
  }, [isPaymentModalOpen]);

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Receipt image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
        toast.success('Receipt screenshot loaded. Ready to verify!');
      };
      reader.readAsDataURL(file);
    }
  };
  
  const profile = profileData?.data;
  const bookings = bookingsData?.data || [];
  const { data: reviewsData, isLoading: isReviewsLoading } = useGetTechnicianReviewsQuery(profile?._id, { skip: !profile?._id });
  const reviews = reviewsData?.data || [];

  const handlePayDues = async () => {
    if (!txnRef.trim()) {
      toast.error('Please enter the UPI Transaction Reference ID.');
      return;
    }
    try {
      await payDues({ transactionRef: txnRef, screenshot }).unwrap();
      toast.success('Payment verification request submitted successfully! Admin will audit it soon.');
      setIsPaymentModalOpen(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to submit payment request');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (profile?.isSuspended) {
      toast.error('Booking actions are restricted. Please settle outstanding dues to reactivate your profile.');
      return;
    }
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Booking ${status} successfully!`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update status');
    }
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (profile?.isApproved !== 'approved') {
    const isPending = profile?.isApproved === 'pending';
    
    return (
      <div className="min-h-screen bg-background pb-10 px-6">
        <header className="py-8">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-black">Hello, {user?.name?.split(' ')[0]} 👋</h1>
        </header>

        <div className="flex items-center justify-center py-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-card border rounded-[3rem] p-10 text-center shadow-xl"
          >
            {isPending ? (
              <>
                <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-orange-500 animate-pulse" />
                </div>
                <div className="inline-flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200 mb-6">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Status: Pending Verification</span>
                </div>
                <h2 className="text-2xl font-black mb-4 tracking-tight text-slate-900">Verification Still Pending</h2>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed px-4">
                  Your professional profile is currently under review by our team. This usually takes 24-48 hours. You can still manage your details in <b>Profile Settings</b>.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-black mb-4 tracking-tight">Profile Rejected</h2>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-left mb-8 space-y-2">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Admin Feedback</p>
                  <p className="text-sm font-bold text-red-800 leading-relaxed italic">
                    "{profile?.rejectionReason || 'Please check your details and re-submit.'}"
                  </p>
                </div>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                  Unfortunately, your profile was not approved. Please correct your details in <b>Profile Management</b> and re-submit for review.
                </p>
              </>
            )}

            <div className="bg-muted/50 p-6 rounded-2xl text-xs text-left border border-dashed mb-6">
              <p className="font-bold mb-3 uppercase tracking-widest text-primary border-b pb-2">
                Submitted Details
              </p>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between"><span>Category</span> <span className="font-bold text-foreground">{profile?.category}</span></div>
                <div className="flex justify-between"><span>Pricing</span> <span className="font-bold text-foreground">₹{profile?.pricing}</span></div>
                <div className="flex justify-between"><span>Experience</span> <span className="font-bold text-foreground">{profile?.experience} Years</span></div>
                <div className="flex justify-between"><span>Phone</span> <span className="font-bold text-foreground">{profile?.phoneNumber}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-dashed">
                <p className="font-bold mb-1 uppercase tracking-widest text-primary">Status: {profile?.isApproved?.toUpperCase()}</p>
                <p className="text-muted-foreground">{isPending ? 'Verification usually takes 24-48 hours.' : 'Correct your info and save to resubmit.'}</p>
              </div>
            </div>

            <Button variant="outline" className="w-full h-12 rounded-xl font-bold" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10 px-6">
      {/* Header (Inspired by Image 2) */}
      <header className="py-8 flex justify-between items-center">
        <div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-black">Good Morning, {user?.name?.split(' ')[0]} 👋</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-600 uppercase">Online</span>
          </div>
          <button className="p-3 bg-card border rounded-full shadow-sm"><Bell className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Platform Suspension Alert Banner */}
      {profile?.isSuspended && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-6 bg-rose-600 text-white rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Subtle light/glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 animate-pulse"></div>
          
          <div className="flex items-center space-x-4 relative z-10 text-left">
            <div className="p-3.5 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8 text-white animate-bounce" />
            </div>
            <div>
              <h4 className="font-black text-base uppercase tracking-widest flex items-center gap-2">
                🔴 Profile Suspended
              </h4>
              <p className="text-xs font-bold text-rose-100 mt-1.5 leading-relaxed max-w-2xl">
                Your profile has been suspended by system administration due to outstanding platform dues of <strong>₹{profile.outstandingDues.toLocaleString()}</strong>. While suspended, your account is completely hidden from customer search lists, and you cannot accept new service requests. Please settle the dues to automatically reactivate your profile.
              </p>
              {profile.suspensionReason && (
                <div className="mt-4 p-4 bg-white/10 rounded-2xl border border-white/20 text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/90">Official Reason</p>
                  <p className="text-xs font-extrabold text-white mt-1 italic">
                    "{profile.suspensionReason}"
                  </p>
                </div>
              )}
            </div>
          </div>
          <Button 
            onClick={() => {
              if (!profile.isSettlementPending) {
                refetchProfile();
                setIsPaymentModalOpen(true);
              }
            }}
            disabled={profile.isSettlementPending}
            className={`h-12 rounded-xl px-8 text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 shrink-0 ${
              profile.isSettlementPending
                ? 'bg-rose-700 text-rose-300 border border-rose-800 cursor-not-allowed'
                : 'bg-white hover:bg-rose-50 text-rose-700 font-extrabold'
            }`}
          >
            {profile.isSettlementPending ? (
              <>Awaiting Admin Approval</>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-1.5" /> Settle Dues Now
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Weekly Platform Dues Alert Banner */}
      {!profile?.isSuspended && profile?.outstandingDues > 0 && (profile?.paymentStatus === 'due' || profile?.paymentStatus === 'overdue') && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-5 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
            profile.isSettlementPending
              ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
              : profile.paymentStatus === 'overdue' 
                ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-250 animate-pulse' 
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-250'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${
              profile.isSettlementPending 
                ? 'bg-slate-500/10' 
                : profile.paymentStatus === 'overdue' ? 'bg-rose-500/10' : 'bg-amber-500/10'
            }`}>
              {profile.isSettlementPending ? (
                <Clock className="w-6 h-6 text-slate-500 dark:text-slate-400 animate-pulse" />
              ) : (
                <ShieldAlert className={`w-6 h-6 ${profile.paymentStatus === 'overdue' ? 'text-rose-600' : 'text-amber-600'} animate-bounce`} />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wide">
                {profile.isSettlementPending 
                  ? 'VERIFICATION PENDING' 
                  : profile.lastSettlement?.status === 'rejected' ? 'PAYMENT REJECTED - RESUBMIT' : 'WEEKLY CHARGES PENDING'}
              </h4>
              <p className="text-xs font-medium opacity-90 mt-1 leading-relaxed max-w-2xl">
                {profile.isSettlementPending 
                  ? `Your payment of ₹${profile.outstandingDues.toLocaleString()} has been submitted. The organization is currently verifying the bank transfer.`
                  : profile.lastSettlement?.status === 'rejected'
                    ? `⚠️ Your previous payment of ₹${profile.outstandingDues.toLocaleString()} (Ref: ${profile.lastSettlement.transactionRef}) was REJECTED by Admin. Reason: "${profile.lastSettlement.rejectionReason}". Please scan the QR, pay again, and upload a valid receipt screenshot.`
                    : `You have unpaid platform charges of ₹${profile.outstandingDues.toLocaleString()} accumulated this week. Please clear your dues immediately to prevent profile suspension.`
                }
              </p>
            </div>
          </div>
          <Button 
            onClick={() => {
              if (!profile.isSettlementPending) {
                refetchProfile();
                setIsPaymentModalOpen(true);
              }
            }}
            disabled={profile.isSettlementPending}
            className={`h-11 rounded-xl px-6 text-xs font-black shadow-sm flex items-center justify-center space-x-2 shrink-0 ${
              profile.isSettlementPending
                ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/50 cursor-not-allowed'
                : profile.paymentStatus === 'overdue' 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {profile.isSettlementPending ? (
              <>Awaiting Admin Verification</>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-1.5" /> Scan & Pay Charges
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Stats Overview (Grid of Cards - Inspired by Image 1) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Today's Jobs</p>
              <h3 className="text-2xl font-black">{bookings.filter(b => new Date(b.scheduledDate).toDateString() === new Date().toDateString()).length}</h3>
            </div>
          </div>
          <button onClick={() => navigate('/technician/bookings')} className="mt-4 text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center">
            View all jobs <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Jobs Done</p>
              <h3 className="text-2xl font-black">{profile?.jobsDone || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Net Earnings</p>
              <h3 className="text-2xl font-black">₹{profile?.totalEarnings?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden group">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              profile?.isSettlementPending 
                ? 'bg-slate-500/10 text-slate-500 animate-pulse'
                : profile?.outstandingDues > 0 
                  ? 'bg-rose-500/10 text-rose-500 animate-pulse' 
                  : 'bg-slate-500/10 text-slate-500'
            }`}>
              {profile?.isSettlementPending ? <Clock className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-bold">Unpaid Dues</p>
              <h3 className={`text-2xl font-black ${profile?.isSettlementPending ? 'text-slate-500' : profile?.outstandingDues > 0 ? 'text-rose-600' : ''}`}>
                ₹{profile?.outstandingDues?.toLocaleString() || '0'}
              </h3>
            </div>
          </div>
          {profile?.outstandingDues > 0 && (
            <button 
              onClick={() => {
                if (!profile.isSettlementPending) {
                  refetchProfile();
                  setIsPaymentModalOpen(true);
                }
              }}
              disabled={profile.isSettlementPending}
              className={`mt-4 text-[10px] font-bold flex items-center ${
                profile.isSettlementPending 
                  ? 'text-slate-400 cursor-not-allowed' 
                  : 'text-rose-500 hover:text-rose-600'
              }`}
            >
              {profile.isSettlementPending ? 'Verification pending' : 'Pay dues now'} 
              <ChevronRight className="w-3 h-3 ml-1 animate-pulse" />
            </button>
          )}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold">Upcoming Bookings</h2>
          <button onClick={() => navigate('/technician/bookings')} className="text-primary font-bold text-xs">See All</button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground italic">Fetching bookings...</div>
          ) : bookings.filter(b => b.status === 'pending').length === 0 ? (
            <div className="p-10 text-center bg-card border rounded-[2rem] border-dashed text-muted-foreground">No pending bookings.</div>
          ) : (
            bookings.filter(b => b.status === 'pending').map((booking) => (
              <motion.div 
                key={booking._id}
                whileHover={{ scale: 1.01 }}
                className="bg-card border rounded-[2rem] p-6 shadow-sm"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                    {booking.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base">{booking.user?.name || 'Customer'}</h4>
                    <p className="text-xs text-primary font-bold">{booking.service}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-[10px] font-bold text-muted-foreground mb-1">
                      <Clock className="w-3 h-3 mr-1" /> {booking.scheduledTime || new Date(booking.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" /> {booking.address?.split(',')[0]}
                    </div>
                  </div>
                </div>
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                      disabled={profile?.isSuspended}
                      className="flex-1 btn-accent py-4 rounded-2xl text-sm"
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                      disabled={profile?.isSuspended}
                      className="flex-1 py-4 rounded-2xl text-sm border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {booking.status === 'accepted' && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleStatusUpdate(booking._id, 'completed')}
                      disabled={profile?.isSuspended}
                      className="flex-1 py-4 rounded-2xl text-sm bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
                    </Button>
                    <a href={`tel:${booking.userPhoneNumber}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        disabled={profile?.isSuspended}
                        className="w-full py-4 rounded-2xl text-sm border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <PhoneCall className="w-4 h-4 mr-2" /> Call
                      </Button>
                    </a>
                  </div>
                )}
                {booking.status === 'completed' && (
                  <div className="text-center text-sm font-bold text-green-600 py-2">
                    Job Completed
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold">Recent Reviews</h2>
            <div className="flex items-center space-x-1 text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-yellow-500" />
              <span className="text-[10px] font-black">{profile?.averageRating || '0.0'}</span>
            </div>
          </div>
          <button onClick={() => navigate('/technician/reviews')} className="text-primary font-bold text-xs">See All</button>
        </div>
        
        {isReviewsLoading ? (
          <div className="py-10 text-center text-muted-foreground italic text-xs">Loading feedback...</div>
        ) : reviews.length === 0 ? (
          <div className="p-10 text-center bg-card border rounded-[2rem] border-dashed text-muted-foreground text-xs">No reviews yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.slice(0, 2).map((review) => (
              <motion.div 
                key={review._id}
                whileHover={{ y: -2 }}
                className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{review.user?.name || 'Customer'}</h4>
                      <p className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-black text-yellow-700">{review.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* UPI Payment Scanner Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-md w-full max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-455 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              {/* Secure Payment Title */}
              <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-full mb-6 shrink-0">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">KeeBo Secure UPI Pay</span>
              </div>

              <h3 className="text-xl font-black text-slate-950 mb-1 text-center shrink-0">Settlement QR Scanner</h3>
              <p className="text-xs text-slate-400 mb-6 text-center max-w-xs leading-relaxed shrink-0">
                Scan using any UPI App (GPay, PhonePe, Paytm, BHIM) to pay platform charges to KeeBo Organization.
              </p>

              {/* UPI Scanner Visual Card */}
              <div className="bg-slate-50 border p-4 sm:p-6 rounded-[2rem] flex flex-col items-center mb-6 relative overflow-hidden group w-full shrink-0">
                {/* Scan beam animation */}
                <div className="absolute left-0 right-0 top-0 h-0.5 bg-indigo-500 animate-pulse shadow-md" style={{ animationDuration: '2s' }}></div>

                {/* Mock or Real QR Code representation */}
                <div className="w-48 h-48 shrink-0 bg-white border rounded-2xl flex items-center justify-center p-4 shadow-sm mb-4 relative overflow-hidden">
                  {profile?.upiqrCodeUrl ? (
                    <img 
                      src={profile.upiqrCodeUrl} 
                      alt="KeeBo UPI QR Code Scanner" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode className="w-40 h-40 text-slate-800" />
                  )}
                  {/* Floating target corners */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-indigo-600"></div>
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-indigo-600"></div>
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-indigo-600"></div>
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-indigo-600"></div>
                </div>

                {/* Amount Badge */}
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Charges Payable</p>
                  <h2 className="text-3xl font-black text-slate-900 mt-1">₹{profile?.outstandingDues?.toLocaleString()}</h2>
                </div>
              </div>

              {/* Info Alert */}
              <div className="flex items-start space-x-3 bg-slate-50 border rounded-2xl p-4 w-full mb-6 text-left shrink-0">
                <Check className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-wide">Instant Verification</p>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    Dues status will show "Awaiting Verification" upon submitting valid bank references.
                  </p>
                </div>
              </div>

              {/* Transaction Ref Input */}
              <div className="w-full mb-4 text-left shrink-0">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  UPI Transaction Reference ID *
                </label>
                <input
                  type="text"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  placeholder="Enter 12-digit UPI Ref ID"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              {/* Receipt Screenshot Upload */}
              <div className="w-full mb-6 text-left shrink-0">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Payment Receipt Screenshot (Optional)
                </label>
                {screenshot ? (
                  <div className="relative flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <img 
                        src={screenshot} 
                        alt="Receipt Preview" 
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                      <div className="truncate">
                        <p className="text-[10px] font-black text-slate-800">receipt_screenshot.png</p>
                        <p className="text-[9px] text-slate-400">Ready to upload</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshot('')}
                      className="text-red-500 hover:text-red-600 font-bold text-[9px] uppercase px-3 py-1.5 bg-red-50 rounded-xl transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50/50 rounded-2xl p-4 cursor-pointer transition-colors group">
                    <Info className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors mb-1.5" />
                    <span className="text-[9px] font-black text-slate-650 uppercase tracking-wide group-hover:text-indigo-500 transition-colors">
                      Upload Screenshot
                    </span>
                    <span className="text-[8px] text-slate-400 mt-0.5">JPEG, PNG up to 5MB</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleScreenshotUpload} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {/* Action CTA */}
              <Button 
                onClick={handlePayDues}
                disabled={isPaying}
                className="w-full h-13 btn-accent rounded-2xl font-black text-sm shadow-md shrink-0"
              >
                {isPaying ? 'Verifying Transaction...' : 'Verify & Confirm Dues Paid'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechnicianDashboard;
