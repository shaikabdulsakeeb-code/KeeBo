import { useState } from 'react';
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from '../api/bookingApi';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, PhoneCall, Ban } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';
import ReviewModal from '../../../components/modals/ReviewModal';
import { toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  return new Date(date).toLocaleDateString();
};

const CancelModal = ({ isOpen, onClose, onConfirm, isLoading }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-card border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
          <div className="w-20 h-20 rounded-[2rem] bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto shadow-inner">
            <Ban className="w-10 h-10" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-black tracking-tight">Cancel Service?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              Are you sure you want to cancel this booking? This action will notify the technician immediately.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button 
              className="h-14 rounded-2xl font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20" 
              onClick={onConfirm}
              isLoading={isLoading}
            >
              Yes, Cancel Booking
            </Button>
            <Button 
              variant="ghost" 
              className="h-14 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all" 
              onClick={onClose}
              disabled={isLoading}
            >
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const MyBookings = () => {
  const { data: bookingsResponse, isLoading } = useGetBookingsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();
  const bookings = bookingsResponse?.data || [];
  const [reviewTarget, setReviewTarget] = useState(null);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, bookingId: null });

  const handleCancel = (id) => {
    setCancelModal({ isOpen: true, bookingId: id });
  };

  const handleConfirmCancel = async () => {
    try {
      await updateStatus({ id: cancelModal.bookingId, status: 'cancelled' }).unwrap();
      toast.success('Booking cancelled successfully');
      setCancelModal({ isOpen: false, bookingId: null });
    } catch (err) {
      toast.error(err.data?.message || 'Failed to cancel booking');
    }
  };

  const openReviewModal = (booking) => {
    if (!booking.technician?._id) {
      return console.error('Technician ID missing in booking:', booking);
    }
    setReviewTarget({
      technicianId: booking.technician?._id,
      technicianName: booking.technician?.userId?.name,
      bookingId: booking._id
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'accepted': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'cancelled': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      default: return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <CancelModal 
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, bookingId: null })}
        onConfirm={handleConfirmCancel}
        isLoading={isUpdating}
      />

      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Track and manage your service requests.</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground italic">Loading your history...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-card border rounded-[2.5rem] p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No bookings yet</h2>
          <p className="text-muted-foreground mb-8">Ready to get some work done? Browse our top professionals.</p>
          <Link to="/dashboard">
            <Button className="rounded-full px-8">Find a Technician</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${
                booking.status === 'completed' ? 'bg-green-500' : 
                booking.status === 'accepted' ? 'bg-blue-500' : 
                booking.status === 'pending' ? 'bg-orange-500' : 'bg-slate-300'
              }`}></div>
              
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                      {booking.status === 'cancelled' ? (
                        booking.cancelledBy === 'admin' ? 'System Cancelled' :
                        booking.cancelledBy === 'user' ? 'Cancelled by You' :
                        booking.cancelledBy === 'technician' ? 'Cancelled by Technician' :
                        'Cancelled'
                      ) : booking.status}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">Ref: #{booking._id.slice(-6)}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1">{booking.service}</h3>
                  <p className="text-primary font-medium mb-4">with {booking.technician?.userId?.name || 'Professional'}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary" /> {new Date(booking.scheduledDate).toLocaleDateString()}</div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-primary" /> {booking.scheduledTime || 'N/A'}</div>
                    <div className="flex items-center sm:col-span-2"><MapPin className="w-4 h-4 mr-2 text-primary" /> {booking.address}</div>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground mt-4 uppercase tracking-widest bg-muted/30 w-fit px-3 py-1 rounded-full">
                    Booked {formatRelativeTime(booking.createdAt)}
                  </p>
                  {booking.status === 'cancelled' && booking.cancelledAt && (
                    <p className="text-[10px] font-bold text-rose-500 mt-2 uppercase tracking-widest bg-rose-500/10 w-fit px-3 py-1 rounded-full">
                      {booking.cancelledBy === 'admin' ? 'System Cancelled' :
                       booking.cancelledBy === 'user' ? 'Cancelled by You' :
                       booking.cancelledBy === 'technician' ? 'Cancelled by Technician' :
                       'Cancelled'} {formatRelativeTime(booking.cancelledAt)}
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-between items-end gap-4 min-w-[150px]">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Service Fee</p>
                    <p className="text-2xl font-bold">₹{booking.price}</p>
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
                    {(booking.status === 'accepted' || booking.status === 'pending') && (
                      <>
                        <a href={`tel:${booking.technician?.phoneNumber || '1234567890'}`} className="flex-1 md:flex-none">
                          <Button variant="outline" size="sm" className="w-full rounded-xl border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 shadow-sm font-bold">
                            <PhoneCall className="w-4 h-4 mr-2" /> Call
                          </Button>
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 md:flex-none rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 font-bold"
                          onClick={() => handleCancel(booking._id)}
                          isLoading={isUpdating}
                        >
                          <Ban className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {booking.status === 'completed' && !booking.isReviewed && (
                <div className="mt-6 pt-6 border-t border-dashed flex items-center justify-between">
                  <p className="text-sm font-medium">How was the service? Your feedback helps!</p>
                  <Button 
                    size="sm" 
                    className="rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={() => openReviewModal(booking)}
                  >
                    Rate Professional
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal 
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          technicianId={reviewTarget.technicianId}
          technicianName={reviewTarget.technicianName}
          bookingId={reviewTarget.bookingId}
        />
      )}
    </div>
  );
};

export default MyBookings;
