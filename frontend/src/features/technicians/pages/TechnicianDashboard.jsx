import { motion } from 'framer-motion';
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from '../../bookings/api/bookingApi';
import { useGetOwnProfileQuery } from '../api/technicianApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/authSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Calendar, MapPin, Clock, DollarSign, Star, Briefcase, 
  Settings, ChevronRight, TrendingUp, Bell, User, PhoneCall, CheckCircle2
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const TechnicianDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const { data: profileData, isLoading: isProfileLoading } = useGetOwnProfileQuery();
  const { data: bookingsData, isLoading } = useGetBookingsQuery();
  const [updateStatus] = useUpdateBookingStatusMutation();
  
  const profile = profileData?.data;
  const bookings = bookingsData?.data || [];

  useEffect(() => {
    if (!isProfileLoading && !profile) {
      navigate('/technician/onboarding');
    }
  }, [profile, isProfileLoading, navigate]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Booking ${status} successfully!`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update status');
    }
  };

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

      {/* Stats Overview Card (Vibrant Blue from Image 2) */}
      <section className="bg-primary rounded-[2.5rem] p-8 text-primary-foreground shadow-2xl shadow-primary/30 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-20"><TrendingUp className="w-20 h-20" /></div>
        <p className="text-sm font-bold opacity-80 mb-6">Today's Overview</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="border-r border-white/20 pr-4">
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-2">Earnings</p>
            <h3 className="text-2xl font-black">₹{profile?.earnings?.toLocaleString() || '1,240'}</h3>
          </div>
          <div className="border-r border-white/20 px-4">
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-2">Jobs Done</p>
            <h3 className="text-2xl font-black">{profile?.totalReviews || '3'}</h3>
          </div>
          <div className="pl-4">
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-2">Pending</p>
            <h3 className="text-2xl font-black">{bookings.filter(b => b.status === 'pending').length}</h3>
          </div>
        </div>
      </section>

      {/* Upcoming Bookings */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold">Upcoming Bookings</h2>
          <button className="text-primary font-bold text-xs">See All</button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground italic">Fetching bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-10 text-center bg-card border rounded-[2rem] border-dashed text-muted-foreground">No active bookings for today.</div>
          ) : (
            bookings.map((booking) => (
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
                      className="flex-1 btn-accent py-4 rounded-2xl text-sm"
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleStatusUpdate(booking._id, 'rejected')}
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
                      className="flex-1 py-4 rounded-2xl text-sm bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
                    </Button>
                    <a href={`tel:${booking.userPhoneNumber}`} className="flex-1">
                      <Button variant="outline" className="w-full py-4 rounded-2xl text-sm border-blue-500 text-blue-600 hover:bg-blue-50">
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

      {/* Quick Actions Grid (Inspired by Image 2) */}
      <section>
        <h2 className="text-xl font-extrabold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col items-start hover:bg-muted/30 cursor-pointer transition-colors">
            <div className="p-3 bg-blue-500/10 rounded-2xl mb-4 text-blue-600"><Calendar className="w-6 h-6" /></div>
            <h4 className="font-bold text-sm">My Schedule</h4>
            <p className="text-[10px] text-muted-foreground">View all jobs</p>
          </div>
          <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col items-start hover:bg-muted/30 cursor-pointer transition-colors">
            <div className="p-3 bg-orange-500/10 rounded-2xl mb-4 text-orange-600"><DollarSign className="w-6 h-6" /></div>
            <h4 className="font-bold text-sm">Earnings</h4>
            <p className="text-[10px] text-muted-foreground">Track income</p>
          </div>
          <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col items-start hover:bg-muted/30 cursor-pointer transition-colors">
            <div className="p-3 bg-yellow-500/10 rounded-2xl mb-4 text-yellow-600"><Star className="w-6 h-6" /></div>
            <h4 className="font-bold text-sm">Reviews</h4>
            <p className="text-[10px] text-muted-foreground">{profile?.averageRating || '4.8'} rating</p>
          </div>
          <div className="bg-card border rounded-3xl p-6 shadow-sm flex flex-col items-start hover:bg-muted/30 cursor-pointer transition-colors">
            <div className="p-3 bg-purple-500/10 rounded-2xl mb-4 text-purple-600"><Settings className="w-6 h-6" /></div>
            <h4 className="font-bold text-sm">Settings</h4>
            <p className="text-[10px] text-muted-foreground">Preferences</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TechnicianDashboard;
