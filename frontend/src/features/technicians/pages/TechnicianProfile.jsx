import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTechnicianByIdQuery, useGetTechnicianReviewsQuery } from '../api/technicianApi';
import { useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '../../profile/api/userApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/authSlice';
import BookingModal from '../../bookings/components/BookingModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MapPin, Briefcase, CheckCircle, ShieldCheck, 
  MessageSquare, Phone, Calendar, ArrowLeft, Share2, Heart,
  Zap, Clock, DollarSign, ChevronRight
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const TechnicianProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isTechnician = user?.role === 'technician';

  const { data: techResponse, isLoading: isTechLoading } = useGetTechnicianByIdQuery(id);
  const tech = techResponse?.data;
  
  const { data: reviewsResponse } = useGetTechnicianReviewsQuery(id);
  
  const { data: favoritesResponse } = useGetFavoritesQuery(user?._id, {
    skip: !user?._id
  });

  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const favorites = favoritesResponse?.data || [];
  const isFavorite = useMemo(() => {
    if (!user) return false;
    return favorites.some(fav => {
      if (typeof fav === 'string') return fav === id;
      if (typeof fav === 'object') return (fav._id === id || fav.id === id);
      return false;
    });
  }, [favorites, id, user]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error('Please login to add to favorites');
      navigate('/login');
      return;
    }
    try {
      if (isFavorite) {
        await removeFavorite(id).unwrap();
        toast.success('Removed from favorites');
      } else {
        await addFavorite(id).unwrap();
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
      console.error(error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied to clipboard!');
  };
  
  const reviews = reviewsResponse?.data || [];

  const ratingStats = useMemo(() => {
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (stats[r.rating] !== undefined) stats[r.rating]++;
    });
    return stats;
  }, [reviews]);

  const isAvailableToday = useMemo(() => {
    if (!tech?.workingDays) return false;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDayShort = days[now.getDay()];
    const currentDayFull = fullDays[now.getDay()];
    
    return tech.workingDays.includes(currentDayShort) || tech.workingDays.includes(currentDayFull);
  }, [tech]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (isTechLoading) return <div className="min-h-screen flex items-center justify-center italic text-muted-foreground text-xl">Loading professional profile...</div>;
  if (!tech) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">Professional not found.</div>;

  return (
    <div className="min-h-screen bg-background pb-32 pt-0">
      <div className="max-w-4xl mx-auto">
        {/* Header Image/Banner */}
        <div className="relative h-48 sm:h-64 md:h-72 bg-gradient-to-br from-primary via-blue-600 to-blue-800 md:rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="absolute top-[5.5rem] sm:top-24 left-4 sm:left-8 right-4 sm:right-8 flex justify-between z-20">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 sm:p-3 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl text-white hover:bg-white/30 transition-all border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex space-x-3">
              <button 
                onClick={handleShare}
                className="p-2 sm:p-3 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl text-white hover:bg-white/30 transition-all border border-white/20"
              >
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              {!isTechnician && (
                <button 
                  onClick={handleFavoriteToggle} 
                  className="p-2 sm:p-3 bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl text-white hover:bg-white/30 transition-all border border-white/20 group"
                >
                  <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'group-hover:text-red-300'}`} />
                </button>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Profile Card Overlay */}
        <div className="px-4 sm:px-6 -mt-16 sm:-mt-24 relative z-20">
          <div className="bg-card rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl text-center border border-border/50 backdrop-blur-sm">
            <div className="relative inline-block mb-4 sm:mb-6">
              <img 
                src={tech.profileImage || `https://i.pravatar.cc/300?u=${tech._id}`} 
                className="w-28 h-28 sm:w-40 sm:h-40 rounded-[2rem] sm:rounded-[2.5rem] border-4 sm:border-8 border-card shadow-2xl object-cover mx-auto transform hover:scale-105 transition-transform duration-500"
                alt={tech.userId?.name}
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 sm:p-2 shadow-lg border-2 sm:border-4 border-card">
                <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2">{tech.userId?.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <span className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
                {tech.category}
              </span>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <div className="flex items-center text-muted-foreground font-bold text-xs sm:text-sm">
                <MapPin className="w-3.5 h-3.5 mr-1 text-primary" /> {tech.location?.address?.split(',')[0] || tech.address?.split(',')[0] || 'Remote'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 sm:pt-10 border-t border-border/50">
              <div className="flex flex-col items-center group">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-blue-50/50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-blue-100/50 transition-all shadow-sm flex-shrink-0">
                  <Briefcase className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />
                </div>
                <span className="text-sm sm:text-xl font-black mb-0.5 sm:mb-1">{tech.experience}+ Yrs</span>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-[0.1em]">Experience</p>
              </div>
              
              <div className="flex flex-col items-center group border-x border-border/50">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-yellow-50/50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-yellow-100/50 transition-all shadow-sm flex-shrink-0">
                  <Star className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-500 fill-yellow-500" />
                </div>
                <span className="text-sm sm:text-xl font-black mb-0.5 sm:mb-1">{tech.averageRating || '5.0'}</span>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-[0.1em]">{tech.totalReviews || 0} Reviews</p>
              </div>
              
              <div className="flex flex-col items-center group">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-green-50/50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-green-100/50 transition-all shadow-sm flex-shrink-0">
                  <Zap className="w-5 h-5 sm:w-7 sm:h-7 text-green-500 fill-green-500/10" />
                </div>
                <span className="text-sm sm:text-xl font-black mb-0.5 sm:mb-1">{tech.jobsDone || '0'}+</span>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-[0.1em]">Jobs Done</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 mt-8 sm:mt-12 space-y-8 sm:space-y-12">
          {/* About Section */}
          <section className="bg-card border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 flex items-center">
              <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-primary rounded-full mr-3 sm:mr-4"></span>
              About Professional
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
              {tech.bio || `Certified ${tech.category} with ${tech.experience}+ years of dedicated experience handling high-end residential and commercial projects. Specializes in ${tech.category?.toLowerCase() || 'professional'} maintenance, emergency repairs, and new installations.`}
            </p>
          </section>

          {/* Portfolio Section */}
          {tech.workImages && tech.workImages.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Work Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tech.workImages.map((img, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border shadow-sm cursor-pointer"
                  >
                    <img src={img} alt={`Work ${i+1}`} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Service Areas */}
          <section>
            <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Service Areas</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {tech.serviceAreas?.map((s, i) => (
                <span key={i} className="px-4 sm:px-6 py-2 sm:py-3 bg-muted/50 text-foreground text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl border border-border hover:border-primary/30 transition-all">
                  {s}
                </span>
              ))}
            </div>
          </section>

          {/* Availability Card */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-primary/5 border-2 border-primary/10 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start md:items-center justify-between gap-4 group cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-3 sm:mb-0 sm:mr-6 group-hover:scale-110 transition-transform flex-shrink-0">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div>
                <span className={`text-lg sm:text-xl font-black block ${isAvailableToday ? 'text-primary' : 'text-orange-500'}`}>
                  {isAvailableToday ? 'Instant Availability' : 'Currently Unavailable'}
                </span>
                <p className="text-xs sm:text-sm font-bold text-muted-foreground mt-0.5">
                  {isAvailableToday 
                    ? `Available: Today (${formatTime(tech.workingHours?.start)} - ${formatTime(tech.workingHours?.end)})`
                    : `Next Available: ${tech.workingDays?.[0] || 'Soon'} (${formatTime(tech.workingHours?.start)})`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0 hidden sm:block" />
          </motion.div>

          {/* Pricing Section */}
          <section>
            <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Pricing Plans</h2>
            <div className="space-y-4">
              <div className="bg-card border border-border/50 hover:border-primary/20 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 flex items-center justify-between shadow-sm transition-all group">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 text-primary flex-shrink-0">
                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-black block">Standard Service</span>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Starting from</p>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-foreground">₹{tech.pricing}</div>
              </div>
            </div>
          </section>

          {/* Ratings & Reviews */}
          <section className="pb-20">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-black">Reviews</h2>
              <Button variant="ghost" className="text-primary font-black text-xs sm:text-sm">See All {tech.totalReviews}</Button>
            </div>
            
            <div className="bg-muted/30 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-12 mb-8 sm:mb-12">
              <div className="text-center flex-shrink-0">
                <h3 className="text-5xl sm:text-7xl font-black mb-1 sm:mb-2">{tech.averageRating || '0'}</h3>
                <div className="flex justify-center mb-2 sm:mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star 
                      key={s} 
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${s <= Math.round(tech.averageRating) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{tech.totalReviews} verified reviews</p>
              </div>
              <div className="flex-1 w-full space-y-2 sm:space-y-3">
                {[5, 4, 3, 2, 1].map(num => {
                  const count = ratingStats[num] || 0;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={num} className="flex items-center space-x-3 sm:space-x-4">
                      <span className="text-xs sm:text-sm font-black w-3 sm:w-4">{num}</span>
                      <div className="flex-1 bg-muted dark:bg-slate-800 rounded-full h-2.5 sm:h-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${percentage}%` }}
                          className="bg-yellow-500 h-full rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-muted-foreground w-10 sm:w-12 text-right">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {reviews.map((review) => (
                <div key={review._id} className="bg-card border rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-base sm:text-xl shadow-inner flex-shrink-0">
                        {review.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-lg font-black">{review.user?.name}</h4>
                        <div className="flex space-x-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] sm:text-xs text-muted-foreground font-black uppercase tracking-widest">{getRelativeTime(review.createdAt)}</span>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium italic pl-0 sm:pl-16">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      {!isTechnician && (
        <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t p-4 sm:p-6 z-40">
          <div className="max-w-4xl mx-auto flex space-x-4">
            <Button 
              onClick={() => {
                if (!user) {
                  toast.error('Please login to book an appointment');
                  navigate('/login', { state: { from: `/technician/${id}` } });
                  return;
                }
                setIsBookingModalOpen(true);
              }}
              className="flex-1 h-12 sm:h-16 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-base sm:text-xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all transform hover:-translate-y-1"
            >
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" /> Book Appointment
            </Button>
          </div>
        </div>
      )}

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        technician={tech} 
      />
    </div>
  );
};

export default TechnicianProfile;
