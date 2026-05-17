import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Filter, ArrowRight, Bell, Calendar } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { name: 'Electrician', icon: '⚡', color: 'bg-blue-500/10 text-blue-600' },
  { name: 'Plumber', icon: '🔧', color: 'bg-orange-500/10 text-orange-600' },
  { name: 'AC Repair', icon: '❄️', color: 'bg-cyan-500/10 text-cyan-600' },
  { name: 'Carpenter', icon: '🔨', color: 'bg-amber-500/10 text-amber-600' },
  { name: 'Painter', icon: '🎨', color: 'bg-rose-500/10 text-rose-600' },
  { name: 'Cleaning', icon: '🧹', color: 'bg-emerald-500/10 text-emerald-600' },
  { name: 'Washing Machine Repair', icon: '🧺', color: 'bg-indigo-500/10 text-indigo-600' },
  { name: 'TV Repair', icon: '📺', color: 'bg-slate-500/10 text-slate-600' },
  { name: 'Software Installation Expert', icon: '💻', color: 'bg-violet-500/10 text-violet-600' },
  { name: 'CCTV Installation Expert', icon: '📹', color: 'bg-neutral-500/10 text-neutral-600' },
  { name: 'Tutor', icon: '📚', color: 'bg-lime-500/10 text-lime-600' },
  { name: 'Construction', icon: '🏗️', color: 'bg-stone-500/10 text-stone-600' },
  { name: 'Beauty & Personal Care(Mehendi)', icon: '💅', color: 'bg-pink-500/10 text-pink-600' },
];

import { useGetTechniciansQuery } from '../../technicians/api/technicianApi';
import { useGetBookingsQuery } from '../../bookings/api/bookingApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/authSlice';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const user = useSelector(selectCurrentUser);
  const { data: bookingsData } = useGetBookingsQuery();
  
  const recentBookings = bookingsData?.data?.slice(0, 2) || [];
  const visibleCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 6);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      navigate('/technicians', { state: { search: searchQuery, location: locationQuery } });
    }
  };

  const handleCategoryClick = (category) => {
    navigate('/technicians', { state: { category, location: locationQuery } });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome & Search Section */}
      <section className="bg-card border rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Hello, {user?.name || 'Guest'}! 👋</h1>
          <p className="text-muted-foreground text-lg mb-8">What service do you need today?</p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow shadow-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search for services, technicians..." 
                className="pl-12 h-14 text-base rounded-2xl bg-background border-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            <div className="relative md:w-1/3 shadow-sm">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Location (e.g. Koramangala)" 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="pl-12 h-14 text-base rounded-2xl bg-background border-muted"
              />
            </div>
            <Button onClick={handleSearch} className="h-14 px-8 rounded-2xl flex">Find</Button>
          </div>
        </div>
      </section>

      {/* Recent Bookings Section */}
      {recentBookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Bookings</h2>
            <Link to="/dashboard/bookings">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">Manage All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentBookings.map((booking) => (
              <div key={booking._id} className="bg-card border rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{booking.service}</h4>
                    <p className="text-[10px] text-muted-foreground">with {booking.technician?.userId?.name || 'Pro'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${
                    booking.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Categories</h2>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => setShowAllCategories(!showAllCategories)}
          >
            {showAllCategories ? 'Show Less' : 'View All'}
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {visibleCategories.map((category, index) => (
              <motion.div 
                key={category.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => handleCategoryClick(category.name)}
                className="bg-card border rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 ${category.color}`}>
                  {category.icon}
                </div>
                <span className="font-semibold text-[10px] uppercase tracking-widest text-foreground/80">{category.name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
