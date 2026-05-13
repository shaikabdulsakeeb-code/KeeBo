import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Filter, ArrowRight, Bell, Calendar } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Electrician', icon: '⚡', color: 'bg-blue-500/10 text-blue-600' },
  { name: 'Plumber', icon: '🔧', color: 'bg-orange-500/10 text-orange-600' },
  { name: 'AC Repair', icon: '❄️', color: 'bg-cyan-500/10 text-cyan-600' },
  { name: 'Carpenter', icon: '🔨', color: 'bg-amber-500/10 text-amber-600' },
  { name: 'Painter', icon: '🎨', color: 'bg-rose-500/10 text-rose-600' },
  { name: 'Cleaning', icon: '🧹', color: 'bg-emerald-500/10 text-emerald-600' },
];

import { useGetTechniciansQuery } from '../../technicians/api/technicianApi';
import { useGetBookingsQuery } from '../../bookings/api/bookingApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../auth/authSlice';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const user = useSelector(selectCurrentUser);
  const { data: techniciansData, isLoading } = useGetTechniciansQuery({ limit: 6 });
  const { data: bookingsData } = useGetBookingsQuery();
  
  const technicians = techniciansData?.data || [];
  const recentBookings = bookingsData?.data?.slice(0, 2) || [];

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      navigate('/technicians', { state: { search: searchQuery } });
    }
  };

  const handleCategoryClick = (category) => {
    navigate('/technicians', { state: { category } });
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
                placeholder="Current Location" 
                defaultValue="Koramangala, Bengaluru"
                className="pl-12 h-14 text-base rounded-2xl bg-background border-muted"
              />
            </div>
            <Button onClick={handleSearch} className="h-14 px-8 rounded-2xl hidden md:flex">Find</Button>
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
          <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">View All</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category, index) => (
            <motion.div 
              key={index}
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
        </div>
      </section>

      {/* Nearby Technicians */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Nearby Professionals</h2>
          <Button variant="outline" size="sm" className="rounded-full">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 text-center text-muted-foreground italic">
              Finding the best professionals for you...
            </div>
          ) : technicians.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No technicians found in your area yet.
            </div>
          ) : (
            technicians.map((tech) => (
              <div key={tech._id} className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-lg transition-shadow group">
                <div className="flex items-start space-x-4 mb-4">
                  <img 
                    src={tech.profileImage?.startsWith('http') ? tech.profileImage : `https://i.pravatar.cc/150?u=${tech._id}`} 
                    alt={tech.userId?.name} 
                    className="w-16 h-16 rounded-2xl object-cover" 
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">{tech.userId?.name}</h3>
                      <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-lg">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 mr-1" />
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{tech.averageRating || 'N/A'}</span>
                      </div>
                    </div>
                    <p className="text-sm text-primary font-medium">{tech.category}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" /> {tech.location?.address || 'Service Area'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Starting from</span>
                    <span className="font-bold text-lg">${tech.pricing}/hr</span>
                  </div>
                  <Link to={`/technician/${tech._id}`}>
                    <Button className="rounded-xl group-hover:scale-105 transition-transform">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" className="rounded-full border-primary/20 text-primary hover:bg-primary/5">
            Explore More <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
