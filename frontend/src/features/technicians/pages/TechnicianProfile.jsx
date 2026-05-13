import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetTechnicianByIdQuery, useGetTechnicianReviewsQuery } from '../api/technicianApi';
import { useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '../../profile/api/userApi';
import BookingModal from '../../bookings/components/BookingModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MapPin, Briefcase, CheckCircle, ShieldCheck, 
  MessageSquare, Phone, Calendar, ArrowLeft, Share2, Heart,
  Zap, Clock, DollarSign, ChevronRight
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';

const TechnicianProfile = () => {
  const { id } = useParams();
  const { data: techResponse, isLoading: isTechLoading } = useGetTechnicianByIdQuery(id);
  const { data: reviewsResponse } = useGetTechnicianReviewsQuery(id);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const { data: favoritesResponse } = useGetFavoritesQuery();
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const favorites = favoritesResponse?.data || [];
  const isFavorite = favorites.some(fav => typeof fav === 'object' ? fav._id === id : fav === id);

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(id).unwrap();
      } else {
        await addFavorite(id).unwrap();
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const tech = techResponse?.data;
  const reviews = reviewsResponse?.data || [];

  if (isTechLoading) return <div className="min-h-screen flex items-center justify-center italic text-muted-foreground">Loading professional profile...</div>;
  if (!tech) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Technician not found.</div>;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header Image/Banner (Inspired by Image 5) */}
      <div className="relative h-64 bg-gradient-to-br from-primary to-blue-700">
        <div className="absolute top-12 left-6 right-6 flex justify-between">
          <Link to="/dashboard">
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white"><ArrowLeft className="w-5 h-5" /></button>
          </Link>
          <div className="flex space-x-2">
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white"><Share2 className="w-5 h-5" /></button>
            <button onClick={handleFavoriteToggle} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Card Overlay */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="bg-card rounded-[2.5rem] p-8 shadow-xl text-center border">
          <div className="relative inline-block mb-4">
            <img 
              src={tech.profileImage || `https://i.pravatar.cc/300?u=${tech._id}`} 
              className="w-32 h-32 rounded-full border-4 border-card shadow-lg object-cover mx-auto"
              alt={tech.userId?.name}
            />
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md">
              <CheckCircle className="w-6 h-6 text-green-500 fill-green-500 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black">{tech.userId?.name}</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            {tech.category} <span className="mx-2">•</span> {tech.address?.split(',')[0]}
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center">
              <Briefcase className="w-5 h-5 text-primary mb-2" />
              <span className="text-xs font-black">{tech.experience}+ Yrs</span>
              <p className="text-[10px] text-muted-foreground font-bold">Exp</p>
            </div>
            <div className="flex flex-col items-center border-x">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mb-2" />
              <span className="text-xs font-black">{tech.averageRating} Rating</span>
              <p className="text-[10px] text-muted-foreground font-bold">{tech.totalReviews} Reviews</p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="w-5 h-5 text-primary mb-2" />
              <span className="text-xs font-black">200+</span>
              <p className="text-[10px] text-muted-foreground font-bold">Jobs Done</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-10">
        {/* Services Section */}
        <section>
          <h2 className="text-xl font-extrabold mb-4">Service Areas</h2>
          <div className="flex flex-wrap gap-2">
            {tech.serviceAreas?.map((s, i) => (
              <span key={i} className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/20">
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Availability Card */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-black text-green-700">Available: Today & Tomorrow</span>
          </div>
          <ChevronRight className="w-5 h-5 text-green-600" />
        </div>

        {/* Pricing List */}
        <section>
          <h2 className="text-xl font-extrabold mb-4">Pricing</h2>
          <div className="space-y-3">
            <div className="bg-muted/30 rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-primary/20 transition-all">
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-xl shadow-sm mr-4 text-primary opacity-70">
                  <Zap />
                </div>
                <span className="text-sm font-bold">Base Service Rate</span>
              </div>
              <span className="text-sm font-black">₹{tech.pricing}</span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-xl font-extrabold mb-4">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Certified {tech.category} with {tech.experience}+ years of experience handling residential and commercial wiring, panel repairs, and emergency fixes. Known for punctuality, clean work, and transparent pricing.
          </p>
        </section>

        {/* Ratings & Reviews */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold">Ratings & Reviews</h2>
            <button className="text-primary font-bold text-xs">See All</button>
          </div>
          
          <div className="flex items-center space-x-8 mb-10">
            <div className="text-center">
              <h3 className="text-5xl font-black">{tech.averageRating}</h3>
              <div className="flex justify-center my-2">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-yellow-500 text-yellow-500" />)}
              </div>
              <p className="text-[10px] text-muted-foreground font-bold">{tech.totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(num => (
                <div key={num} className="flex items-center space-x-2">
                  <span className="text-[10px] font-black w-2">{num}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${num === 5 ? 85 : num === 4 ? 12 : 3}%` }}
                      className="bg-primary h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-card border-b pb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-[10px]">
                      {review.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{review.user?.name}</h4>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-2 h-2 fill-yellow-500 text-yellow-500" />)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold">2d ago</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Fixed Bottom Action Bar (Inspired by Image 5) */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t p-6 flex space-x-4 z-40">
        <Button 
          onClick={() => setIsBookingModalOpen(true)}
          className="flex-1 btn-accent py-6 rounded-2xl flex items-center justify-center text-lg"
        >
          <Calendar className="w-5 h-5 mr-2" /> Book Service
        </Button>
        <Button variant="outline" className="p-4 rounded-2xl border-2 border-primary text-primary hover:bg-primary/5">
          <Phone className="w-6 h-6" />
        </Button>
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        technician={tech} 
      />
    </div>
  );
};

export default TechnicianProfile;
