import { useState } from 'react';
import { useGetTechniciansQuery } from '../api/technicianApi';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const SearchTechnicians = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.search || '');
  const [category, setCategory] = useState(location.state?.category || '');
  
  const { data: response, isLoading } = useGetTechniciansQuery({
    category: category || undefined,
    sort: '-averageRating',
  });

  const technicians = response?.data || [];

  const filteredTechs = technicians.filter(tech => 
    tech.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Electrician', 'Plumber', 'AC Repair', 'Carpenter', 'Painter', 'Cleaning'];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-foreground">Find Professionals</h1>
        
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 ring-primary/20 outline-none shadow-sm"
            />
          </div>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="bg-card border rounded-2xl px-4 py-4 text-sm outline-none shadow-sm cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-10 italic text-muted-foreground">Searching...</div>
        ) : (
          <div className="space-y-4">
            {filteredTechs.length > 0 ? (
              filteredTechs.map((tech) => (
                <Link to={`/technician/${tech._id}`} key={tech._id}>
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-card border rounded-[2rem] p-4 flex items-center space-x-4 shadow-sm mt-4 hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={tech.profileImage || `https://i.pravatar.cc/150?u=${tech._id}`} 
                      alt={tech.userId?.name} 
                      className="w-24 h-24 rounded-[1.5rem] object-cover" 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg">{tech.userId?.name}</h4>
                          <p className="text-xs text-primary font-bold uppercase tracking-wide">{tech.category}</p>
                        </div>
                        <div className="font-black text-lg">₹{tech.pricing}</div>
                      </div>
                      
                      <div className="flex items-center mt-3 space-x-4 text-xs font-bold text-muted-foreground">
                        <div className="flex items-center text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-500 mr-1" /> {tech.averageRating || 'New'}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" /> {tech.address ? tech.address.split(',')[0] : 'Nearby'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10 font-bold text-lg">No professionals found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchTechnicians;
