import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ShieldCheck, User, Star
} from 'lucide-react';
import { useGetAllTechniciansQuery } from '../api/adminApi';
import { Button } from '../../../components/ui/Button';

const CATEGORIES = [
  'All', 'Electrician', 'Plumber', 'AC Repair', 'Carpenter', 
  'Painter', 'Cleaning', 'Washing Machine Repair', 'TV Repair',
  'Software Installation Expert', 'CCTV Installation Expert', 
  'Tutor', 'Construction', 'Beauty & Personal Care(Mehendi)'
];

const AdminTechnicians = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [limit, setLimit] = useState(7);

  const { data: techsResponse, isLoading, isFetching } = useGetAllTechniciansQuery({
    search: search || undefined,
    category: category === 'All' ? undefined : category,
    isApproved: 'approved', // Only show verified professionals
    limit: limit
  });

  const technicians = techsResponse?.data || [];
  const totalCount = techsResponse?.totalCount || 0;
  
  const displayedTechs = technicians;
  const hasMore = technicians.length < totalCount;

  return (
    <div className="w-full space-y-10 pb-20 px-4 md:px-0">
      {/* Header section with search and filter */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 md:p-8 rounded-[2.5rem] border shadow-sm gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Verified Professionals</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Directory • {totalCount} Verified</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or place..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
            />
          </div>
          
          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-primary/20 appearance-none cursor-pointer"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="bg-white border rounded-[2.5rem] h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Main Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {displayedTechs.map((tech) => (
                <motion.div 
                  layout
                  key={tech._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => navigate(`/admin/technicians/${tech._id}`)}
                  className="bg-white border rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer text-center space-y-6 group relative overflow-hidden"
                >
                  {/* Unpaid Dues Alert Label */}
                  {tech.outstandingDues > 0 && (
                    <div className="absolute top-4 left-4 bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border border-rose-100 shadow-sm z-10">
                      ₹{tech.outstandingDues} Due
                    </div>
                  )}

                  {/* Suspended Alert Label */}
                  {tech.isSuspended && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-md animate-pulse z-10">
                      Suspended
                    </div>
                  )}

                  <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center mx-auto relative border-2 border-slate-50 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                    {tech.profileImage && tech.profileImage !== 'default.jpg' ? (
                      <img src={tech.profileImage} alt={tech.userId?.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-primary/30" />
                    )}
                    
                    {/* Verified Badge Bottom Right of Image */}
                    {tech.isApproved === 'approved' && (
                      <div className="absolute bottom-1 right-1 z-10 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg ring-4 ring-white">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{tech.category}</p>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">{tech.userId?.name}</h3>
                  </div>

                  <div className="flex items-center justify-center space-x-2 bg-orange-50/50 py-2 rounded-xl border border-orange-100">
                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span className="text-sm font-black text-orange-600">{tech.averageRating || '0.0'}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button 
                onClick={() => setLimit(prev => prev + 10)} 
                disabled={isFetching}
                className="h-16 px-16 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-primary text-white hover:scale-105 transition-transform w-full sm:w-auto"
              >
                {isFetching ? 'Loading Professionals...' : 'View more technicians'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTechnicians;
