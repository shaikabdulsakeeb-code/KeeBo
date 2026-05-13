import React from 'react';
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from '../../bookings/api/bookingApi';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, PhoneCall, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';

const TechnicianBookings = () => {
  const { data: bookingsResponse, isLoading } = useGetBookingsQuery();
  const [updateStatus] = useUpdateBookingStatusMutation();
  const bookings = bookingsResponse?.data || [];

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Booking ${status} successfully!`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'accepted': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black mb-2">Service Bookings</h1>
        <p className="text-muted-foreground">Manage all your incoming and historical service requests.</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground italic">Loading jobs...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-card border rounded-[2.5rem] p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No jobs yet</h2>
          <p className="text-muted-foreground">Once customers book your services, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">ID: #{booking._id.slice(-6)}</span>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-1">{booking.service}</h3>
                  <p className="text-primary font-bold mb-6">Customer: {booking.user?.name || 'User'}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-bold">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-5 h-5 mr-3 text-primary" /> 
                      {new Date(booking.scheduledDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-5 h-5 mr-3 text-primary" /> 
                      {booking.scheduledTime || 'N/A'}
                    </div>
                    <div className="flex items-center sm:col-span-2 text-muted-foreground">
                      <MapPin className="w-5 h-5 mr-3 text-primary" /> 
                      {booking.address}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-6 min-w-[200px]">
                  <div className="text-right">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Fee</p>
                    <p className="text-3xl font-black">₹{booking.price}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full">
                    {booking.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                          className="w-full rounded-xl py-6 btn-accent text-sm font-black uppercase tracking-widest"
                        >
                          Accept Job
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                          className="w-full rounded-xl py-6 text-destructive hover:bg-destructive/10 text-sm font-black uppercase tracking-widest"
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {booking.status === 'accepted' && (
                      <>
                        <Button 
                          onClick={() => handleStatusUpdate(booking._id, 'completed')}
                          className="w-full rounded-xl py-6 bg-green-500 hover:bg-green-600 text-white text-sm font-black uppercase tracking-widest"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" /> Mark Completed
                        </Button>
                        <a href={`tel:${booking.userPhoneNumber || '+910000000000'}`}>
                          <Button variant="outline" className="w-full rounded-xl py-6 border-primary text-primary text-sm font-black uppercase tracking-widest">
                            <PhoneCall className="w-5 h-5 mr-2" /> Call Customer
                          </Button>
                        </a>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <div className="flex items-center text-green-600 font-black uppercase tracking-widest text-sm bg-green-50 px-6 py-4 rounded-2xl border border-green-100">
                        <CheckCircle2 className="w-5 h-5 mr-2" /> Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicianBookings;
