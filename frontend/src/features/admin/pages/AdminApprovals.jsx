import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ShieldCheck, User, Star, Clock, AlertCircle
} from 'lucide-react';
import { useGetAllTechniciansQuery } from '../api/adminApi';
import { Button } from '../../../components/ui/Button';

const CATEGORIES = [
  'All', 'Electrician', 'Plumber', 'AC Repair', 'Carpenter', 
  'Painter', 'Cleaning', 'Washing Machine Repair', 'TV Repair',
  'Software Installation Expert', 'CCTV Installation Expert', 
  'Tutor', 'Construction', 'Beauty & Personal Care(Mehendi)'
];

const AdminApprovals = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [limit, setLimit] = useState(7);

  const { data: techsResponse, isLoading, isFetching } = useGetAllTechniciansQuery({
    search: search || undefined,
    category: category === 'All' ? undefined : category,
    isApproved: 'pending', // Only show pending for approval
    limit: limit
  });

  const technicians = techsResponse?.data || [];
  const totalCount = techsResponse?.totalCount || 0;
  const hasMore = technicians.length < totalCount;

  return (
    <div className="w-full space-y-10 pb-20 px-4 md:px-0">
      {/* Header section */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 md:p-8 rounded-[2.5rem] border shadow-sm gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-3 text-orange-500">
            <Clock className="w-6 h-6" />
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Verification Queue</h1>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{totalCount} Professionals Awaiting Review</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search applicants..." 
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
      ) : technicians.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed space-y-4">
          <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Queue is Clear!</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">All professional applications have been processed.</p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {technicians.map((tech) => (
                <motion.div 
                  layout
                  key={tech._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => navigate(`/admin/approvals/${tech._id}`)}
                  className="bg-white border rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer text-center space-y-6 group relative"
                >
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>
                  </div>

                  <div className="w-24 h-24 rounded-[2rem] bg-orange-50 flex items-center justify-center mx-auto relative border-2 border-white overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                    {tech.profileImage && tech.profileImage !== 'default.jpg' ? (
                      <img src={tech.profileImage} alt={tech.userId?.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-orange-300" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{tech.category}</p>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">{tech.userId?.name}</h3>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-slate-400 font-bold text-xs bg-slate-50 py-2 rounded-xl">
                    <AlertCircle className="w-4 h-4" />
                    <span>Review Application</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button 
                onClick={() => setLimit(prev => prev + 10)} 
                disabled={isFetching}
                className="h-16 px-16 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 bg-primary text-white hover:scale-105 transition-transform w-full sm:w-auto"
              >
                {isFetching ? 'Loading Applicants...' : 'Load More Applications'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
