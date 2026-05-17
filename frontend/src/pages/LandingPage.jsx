import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, MapPin, ArrowRight, ShieldCheck, Zap, Clock, 
  Droplets, Snowflake, Hammer, Palette, Brush, Waves, 
  Tv, Laptop, Cctv, BookOpen, Building, Sparkles 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import Carousel from '../components/ui/Carousel';
import Footer from '../components/Footer';
import { useGetTechniciansQuery, useGetServiceStatsQuery } from '../features/technicians/api/technicianApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';

const CAROUSEL_ITEMS = [
  {
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=2069',
    title: 'Expert Electricians at Your Doorstep',
    description: 'Safe and reliable electrical services for your home and office.'
  },
  {
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=2070',
    title: 'Professional Plumbing Solutions',
    description: 'From leaks to installations, we handle it all with precision.'
  },
  {
    image: 'https://images.unsplash.com/photo-1599939575322-792a12b33503?auto=format&fit=crop&q=80&w=2069',
    title: 'Beat the Heat with AC Repair',
    description: 'Fast and efficient air conditioning services to keep you cool.'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isTechnician = user?.role === 'technician';
  
  // Fetch top rated 4 technicians
  const { data: techResponse, isLoading: techsLoading } = useGetTechniciansQuery({ 
    sort: '-averageRating', 
    limit: 4,
    isApproved: 'approved' 
  });
  const topTechs = techResponse?.data || [];

  // Fetch service stats (most technicians)
  const { data: statsResponse, isLoading: statsLoading } = useGetServiceStatsQuery();
  const serviceStats = statsResponse?.data || [];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Electrician': return <Zap className="w-8 h-8" />;
      case 'Plumber': return <Droplets className="w-8 h-8" />;
      case 'AC Repair': return <Snowflake className="w-8 h-8" />;
      case 'Carpenter': return <Hammer className="w-8 h-8" />;
      case 'Painter': return <Palette className="w-8 h-8" />;
      case 'Cleaning': return <Brush className="w-8 h-8" />;
      case 'Washing Machine Repair': return <Waves className="w-8 h-8" />;
      case 'TV Repair': return <Tv className="w-8 h-8" />;
      case 'Software Installation Expert': return <Laptop className="w-8 h-8" />;
      case 'CCTV Installation Expert': return <Cctv className="w-8 h-8" />;
      case 'Tutor': return <BookOpen className="w-8 h-8" />;
      case 'Construction': return <Building className="w-8 h-8" />;
      case 'Beauty & Personal Care(Mehendi)': return <Sparkles className="w-8 h-8" />;
      default: return <Zap className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Carousel */}
      <section className="pt-20 sm:pt-24 pb-6 sm:pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <Carousel items={CAROUSEL_ITEMS} />
      </section>

      {/* Services Section (Most Technicians) */}
      <section className="py-10 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-4">In-Demand Services</h2>
            <p className="text-sm sm:text-base text-muted-foreground">The most popular categories chosen by our community.</p>
          </div>
          {isAuthenticated && !isTechnician && (
            <Button variant="ghost" className="font-bold text-primary flex items-center p-0 hover:bg-transparent" onClick={() => navigate('/technicians')}>
              View All Services <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {statsLoading ? (
             [...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-[2rem]"></div>
            ))
          ) : (
            serviceStats.slice(0, 8).map((stat, i) => (
              <motion.div
                key={stat._id}
                whileHover={{ y: -10 }}
                onClick={() => !isTechnician && navigate('/technicians', { state: { category: stat._id } })}
                className="bg-card border p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] cursor-pointer hover:shadow-xl transition-all text-center group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl sm:text-2xl mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  {getCategoryIcon(stat._id)}
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-1">{stat._id}</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.count} Technicians</p>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Top Rated Technicians Section */}
      <section className="py-10 sm:py-20 bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-4">Top Rated Experts</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Certified professionals with the highest customer ratings.</p>
            </div>
            {isAuthenticated && !isTechnician && (
              <Button variant="ghost" className="font-bold text-primary flex items-center p-0 hover:bg-transparent" onClick={() => navigate('/technicians')}>
                See All Experts <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {techsLoading ? (
               [...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-[2.5rem]"></div>
              ))
            ) : (
              topTechs.map((tech) => (
                <motion.div
                  key={tech._id}
                  whileHover={{ y: -10 }}
                  className="bg-card border rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="relative h-40 sm:h-48">
                    <img 
                      src={tech.profileImage || `https://i.pravatar.cc/150?u=${tech._id}`} 
                      alt={tech.userId?.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm border border-black/5 dark:border-white/10">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-black text-slate-900 dark:text-white">{tech.averageRating || 'New'}</span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest mb-1">{tech.category}</p>
                    <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{tech.userId?.name}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-muted-foreground text-xs font-bold">
                        <MapPin className="w-3 h-3 mr-1" /> Nearby
                      </div>
                      <Link to={`/technician/${tech._id}`}>
                        <Button size="sm" className="rounded-xl font-bold">Profile</Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Us Preview Section */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative bg-card border rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl overflow-hidden">
               <h3 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6 leading-tight text-center sm:text-left">Why Choose <span className="text-primary">KeeBo</span>?</h3>
               <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg">Verified Professionals</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Every pro is background checked and verified.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg">24/7 Availability</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Book services at your convenience, anytime.</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-8 leading-tight">We bring the best experts directly to your home.</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-10 leading-relaxed">
              KeeBo is your one-stop destination for all your home service needs. From electrical work to plumbing and cleaning, we connect you with skilled professionals who care about your home as much as you do.
            </p>
            <Link to="/about">
              <Button size="lg" className="rounded-[1.25rem] sm:rounded-[1.5rem] px-6 sm:px-10 py-4 sm:py-7 text-sm sm:text-lg font-bold group w-full sm:w-auto">
                Learn more about us <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
