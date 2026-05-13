import { motion } from 'framer-motion';
import { Search, MapPin, Star, ShieldCheck, Zap, Heart, Menu, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useGetTechniciansQuery } from '../features/technicians/api/technicianApi';

const CATEGORIES = [
  { name: 'Electrician', icon: '⚡', color: 'bg-blue-500/10' },
  { name: 'Plumber', icon: '🔧', color: 'bg-orange-500/10' },
  { name: 'AC Repair', icon: '❄️', color: 'bg-cyan-500/10' },
  { name: 'Carpenter', icon: '🔨', color: 'bg-amber-500/10' },
  { name: 'Painter', icon: '🎨', color: 'bg-rose-500/10' },
  { name: 'Cleaning', icon: '🧹', color: 'bg-emerald-500/10' },
  { name: 'Appliance', icon: '🔌', color: 'bg-indigo-500/10' },
  { name: 'More', icon: '➕', color: 'bg-slate-500/10' },
];

const TOP_TECHS = [
  { name: 'Amit Sharma', role: 'Electrician', rating: '4.9', reviews: '218', distance: '1.2 km', image: 'https://i.pravatar.cc/150?u=amit' },
  { name: 'Ravi Kumar', role: 'Plumber', rating: '4.8', reviews: '186', distance: '1.5 km', image: 'https://i.pravatar.cc/150?u=ravi' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { data: techResponse } = useGetTechniciansQuery({ sort: '-averageRating', limit: 4 });
  const topTechs = techResponse?.data || [];

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate('/technicians', { state: { search: e.target.value } });
    }
  };

  const handleCategoryClick = (category) => {
    if (category === 'More') {
      navigate('/technicians');
    } else {
      navigate('/technicians', { state: { category } });
    }
  };
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile-Style Header (Inspired by Image 5) */}
      <header className="pt-12 pb-6 px-6 bg-card border-b rounded-b-[2.5rem] shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center">
              Hello, User <span className="ml-2">👋</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">What service do you need today?</p>
          </div>
          <button className="p-3 bg-muted rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            onKeyDown={handleSearch}
            placeholder="Search for services like plumber, electrician..." 
            className="w-full bg-muted/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-bold">Koramangala, Bengaluru</span>
          <button className="text-primary font-bold text-xs hover:underline ml-auto">Change</button>
        </div>
      </header>

      <div className="px-6 mt-8">
        {/* Banner Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-primary rounded-[2rem] p-6 text-primary-foreground relative overflow-hidden shadow-xl shadow-primary/30"
        >
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded-full">Limited Offer</span>
            <h2 className="text-2xl font-bold mt-3 leading-tight">25% OFF on first<br />booking today</h2>
            <Button className="mt-4 bg-white text-primary hover:bg-white/90 rounded-xl px-6 font-bold text-sm">Claim Now</Button>
          </div>
          <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </motion.div>

        {/* Categories Section */}
        <section className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-extrabold">Categories</h3>
            <button onClick={() => navigate('/technicians')} className="text-primary font-bold text-xs">See All</button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div 
                key={i} 
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-2xl transition-all group-hover:shadow-lg mb-2`}>
                  {cat.icon}
                </div>
                <span className="text-[10px] font-bold text-center text-muted-foreground group-hover:text-foreground">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Rated Technicians */}
        <section className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-extrabold">Top Rated Technicians</h3>
            <button onClick={() => navigate('/technicians')} className="text-primary font-bold text-xs">See All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topTechs.map((tech) => (
              <Link to={`/technician/${tech._id}`} key={tech._id}>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-card border rounded-[2rem] p-4 flex items-center space-x-4 shadow-sm"
                >
                  <img src={tech.profileImage || `https://i.pravatar.cc/150?u=${tech._id}`} alt={tech.userId?.name} className="w-20 h-20 rounded-[1.5rem] object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{tech.userId?.name}</h4>
                        <p className="text-[10px] text-primary font-bold">{tech.category}</p>
                      </div>
                      <Heart className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center mt-2 space-x-3 text-[10px] font-bold">
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-3 h-3 fill-yellow-500 mr-1" /> {tech.averageRating || 'New'} ({tech.totalReviews || 0})
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" /> Nearby
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Hero CTA for Desktop View */}
        <section className="mt-20 py-20 text-center bg-card rounded-[3rem] border shadow-inner hidden md:block">
          <h2 className="text-5xl font-black mb-6 leading-tight">Expert Services,<br />At Your Doorstep.</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10">Connect with the best local professionals for all your home needs with guaranteed satisfaction.</p>
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button className="btn-accent px-10 py-8 text-xl">Get Started Now</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="rounded-[1.25rem] px-10 py-8 text-xl font-bold">Sign In</Button>
            </Link>
          </div>
        </section>
      </div>
      
      {/* Mobile Navigation Bar (Inspired by Image 5) */}
      <div className="fixed bottom-0 left-0 w-full bg-card border-t px-6 py-4 flex justify-between items-center md:hidden z-50">
        <button className="flex flex-col items-center text-primary">
          <Zap className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center text-muted-foreground">
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Search</span>
        </button>
        <button className="flex flex-col items-center text-muted-foreground">
          <Star className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Bookings</span>
        </button>
        <button className="flex flex-col items-center text-muted-foreground">
          <ShieldCheck className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
