import { useState } from 'react';
import { useGetBookingsQuery } from '../api/bookingApi';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, PhoneCall } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';
import ReviewModal from '../../../components/modals/ReviewModal';

const MyBookings = () => {
  const { data: bookingsResponse, isLoading } = useGetBookingsQuery();
  const bookings = bookingsResponse?.data || [];
  const [reviewTarget, setReviewTarget] = useState(null);

  const openReviewModal = (booking) => {
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
                      {booking.status}
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
                </div>

                <div className="flex flex-col justify-between items-end gap-4 min-w-[150px]">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Service Fee</p>
                    <p className="text-2xl font-bold">${booking.price}</p>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    {booking.status === 'accepted' && (
                      <a href={`tel:${booking.technician?.phoneNumber}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full rounded-xl border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700">
                          <PhoneCall className="w-4 h-4 mr-2" /> Call
                        </Button>
                      </a>
                    )}
                    <Button size="sm" className="flex-1 rounded-xl">Details</Button>
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

      <ReviewModal 
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        technicianId={reviewTarget?.technicianId}
        technicianName={reviewTarget?.technicianName}
        bookingId={reviewTarget?.bookingId}
      />
    </div>
  );
};

export default MyBookings;
