import { useState, useMemo } from 'react';
import { useGetTechniciansQuery } from '../api/technicianApi';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const SearchTechnicians = () => {
  const locationState = useLocation();
  const [searchTerm, setSearchTerm] = useState(locationState.state?.search || '');
  const [locationTerm, setLocationTerm] = useState(locationState.state?.location || '');
  const [category, setCategory] = useState(locationState.state?.category || '');
  const [sortBy, setSortBy] = useState('rating');
  const [visibleCount, setVisibleCount] = useState(4);
  
  const { data: response, isLoading } = useGetTechniciansQuery({
    category: category || undefined,
    isApproved: 'approved'
  });

  const technicians = response?.data || [];

  const filteredTechs = useMemo(() => {
    let techs = technicians.filter(tech => {
      const matchesSearch = !searchTerm || 
        tech.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !locationTerm || 
        tech.location?.address?.toLowerCase().includes(locationTerm.toLowerCase()) ||
        tech.serviceAreas?.some(area => area.toLowerCase().includes(locationTerm.toLowerCase()));
      
      return matchesSearch && matchesLocation;
    });

    if (sortBy === 'rating') {
      techs.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === 'price-low') {
      techs.sort((a, b) => a.pricing - b.pricing);
    } else if (sortBy === 'price-high') {
      techs.sort((a, b) => b.pricing - a.pricing);
    }

    return techs;
  }, [technicians, searchTerm, locationTerm, sortBy]);

  const visibleTechs = filteredTechs.slice(0, visibleCount);

  const categories = [
    'Electrician', 'Plumber', 'AC Repair', 'Carpenter', 'Painter', 'Cleaning',
    'Washing Machine Repair', 'TV Repair', 'Software Installation Expert', 
    'CCTV Installation Expert', 'Tutor', 'Construction', 'Beauty & Personal Care(Mehendi)'
  ];

  const handleViewMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-4xl font-black text-foreground tracking-tight">Find Experts</h1>
          <div className="flex items-center space-x-2 text-sm font-bold text-muted-foreground">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">{filteredTechs.length} Results</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="relative col-span-1 md:col-span-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setVisibleCount(4);}}
              className="w-full bg-card border rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 ring-primary/20 outline-none shadow-sm"
            />
          </div>
          <div className="relative col-span-1 md:col-span-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Location..." 
              value={locationTerm}
              onChange={(e) => {setLocationTerm(e.target.value); setVisibleCount(4);}}
              className="w-full bg-card border rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 ring-primary/20 outline-none shadow-sm"
            />
          </div>
          <select 
            value={category} 
            onChange={(e) => {setCategory(e.target.value); setVisibleCount(4);}}
            className="bg-card border rounded-2xl px-4 py-4 text-sm outline-none shadow-sm cursor-pointer appearance-none font-bold"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-card border rounded-2xl px-4 py-4 text-sm outline-none shadow-sm cursor-pointer appearance-none font-bold text-primary"
          >
            <option value="rating">Top Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-20 italic text-muted-foreground animate-pulse">Searching for best matches...</div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {visibleTechs.length > 0 ? (
                visibleTechs.map((tech, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={tech._id}
                  >
                    <Link to={`/technician/${tech._id}`}>
                      <div className="bg-card border rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                        
                        <img 
                          src={tech.profileImage || `https://i.pravatar.cc/150?u=${tech._id}`} 
                          alt={tech.userId?.name} 
                          className="w-32 h-32 rounded-[2rem] object-cover shadow-md group-hover:scale-105 transition-transform" 
                        />
                        
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-black text-2xl group-hover:text-primary transition-colors">{tech.userId?.name}</h4>
                              <p className="text-xs text-primary font-black uppercase tracking-widest">{tech.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Starting from</p>
                              <div className="text-2xl font-black text-foreground">₹{tech.pricing}<span className="text-xs text-muted-foreground font-bold">/hr</span></div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center mt-4 gap-4 text-xs font-bold">
                            <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                              <Star className="w-3 h-3 fill-yellow-500 mr-1" /> {tech.averageRating || 'New'}
                            </div>
                            <div className="flex items-center text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                              <MapPin className="w-3 h-3 mr-1" /> {tech.location?.address ? tech.location.address.split(',')[0] : 'Nearby'}
                            </div>
                            <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                              <Filter className="w-3 h-3 mr-1" /> {tech.experience}+ Yrs Exp
                            </div>
                          </div>

                          <div className="mt-6 flex items-center text-primary font-black text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            View Profile & Book <ArrowRight className="ml-2 w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-card rounded-[3rem] border border-dashed border-muted-foreground/30">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-black mb-2">No professionals found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
                </div>
              )}
            </AnimatePresence>

            {visibleCount < filteredTechs.length && (
              <div className="pt-10 text-center">
                <Button 
                  onClick={handleViewMore}
                  variant="outline" 
                  size="lg"
                  className="rounded-full px-12 py-8 text-lg font-black border-2 border-primary/20 hover:border-primary text-primary transition-all shadow-lg hover:shadow-primary/10"
                >
                  View More Professionals
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchTechnicians;
