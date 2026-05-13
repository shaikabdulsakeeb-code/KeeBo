import { motion } from 'framer-motion';
import { 
  Users, Briefcase, TrendingUp, DollarSign, Activity, 
  AlertTriangle, CheckCircle, Search, Filter, Download, Calendar, ChevronRight 
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useGetAdminStatsQuery, useGetPendingTechniciansQuery, useVerifyTechnicianMutation } from '../api/adminApi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { data: statsResponse, isLoading: isStatsLoading } = useGetAdminStatsQuery();
  const { data: techsResponse, isLoading: isTechsLoading } = useGetPendingTechniciansQuery();
  const [verifyTech] = useVerifyTechnicianMutation();

  const statsData = statsResponse?.data || {};
  const technicians = techsResponse?.data || [];
  
  const stats = [
    { label: 'Total Technicians', value: statsData.totalTechnicians || '1,284', trend: '+12%', icon: <Briefcase className="w-5 h-5 text-blue-500" /> },
    { label: 'Active Bookings', value: statsData.totalBookings || '342', trend: 'Live', icon: <Activity className="w-5 h-5 text-orange-500" /> },
    { label: 'Total Customers', value: statsData.totalUsers || '8,920', trend: '+8%', icon: <Users className="w-5 h-5 text-cyan-500" /> },
    { label: 'Revenue This Month', value: `₹${statsData.totalRevenue?.toLocaleString() || '4,82,300'}`, trend: '+21%', icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
  ];

  const handleVerify = async (id, status) => {
    try {
      await verifyTech({ id, status }).unwrap();
      toast.success(`Technician ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to verify technician');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white border rounded-xl px-4 py-2 flex items-center text-sm font-bold text-slate-600 shadow-sm">
            <Calendar className="w-4 h-4 mr-2" /> Oct 1 - Oct 31, 2025
          </div>
          <Button className="btn-primary flex items-center rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </header>

      {/* Metric Cards (Inspired by Image 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white border rounded-[1.5rem] p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-xl">{stat.icon}</div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900">{isStatsLoading ? '...' : stat.value}</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Revenue Trend Chart Placeholder */}
        <div className="lg:col-span-2 bg-white border rounded-[2rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black">Revenue Trend</h2>
              <p className="text-xs text-slate-400">Last 7 days performance</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold">7D</button>
              <button className="px-3 py-1 text-xs font-bold text-slate-400">30D</button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between px-4 pb-4 border-b border-l gap-2 opacity-80">
            {[40, 60, 45, 80, 55, 90, 75].map((height, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }} animate={{ height: `${height}%` }}
                className="w-full bg-blue-500/10 hover:bg-blue-500/20 rounded-t-lg transition-colors relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {height}k
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bookings by Category Pie Chart Placeholder */}
        <div className="bg-white border rounded-[2rem] p-8 shadow-sm">
          <h2 className="text-xl font-black mb-2">Bookings by Category</h2>
          <p className="text-xs text-slate-400 mb-8">This month</p>
          <div className="relative w-48 h-48 mx-auto mb-8">
            <svg viewBox="0 0 100 100" className="rotate-[-90deg]">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563EB" strokeWidth="12" strokeDasharray="180 251" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FF7A00" strokeWidth="12" strokeDasharray="40 251" strokeDashoffset="-180" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#06B6D4" strokeWidth="12" strokeDasharray="30 251" strokeDashoffset="-220" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">1,150</span>
              <span className="text-[10px] font-bold text-slate-400">Total</span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Electrician', val: 420, color: 'bg-blue-500' },
              { label: 'Plumber', val: 310, color: 'bg-orange-500' },
              { label: 'AC Repair', val: 240, color: 'bg-cyan-500' },
            ].map((cat, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                <div className="flex items-center"><div className={`w-2 h-2 rounded-full ${cat.color} mr-2`}></div> {cat.label}</div>
                <span>{cat.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Approvals Table (Inspired by Image 3) */}
      <section className="bg-white border rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black">Pending Technician Approvals</h2>
            <p className="text-xs text-slate-400">Review and approve new technician applications</p>
          </div>
          <button className="text-blue-600 font-bold text-xs flex items-center">View all <ChevronRight className="w-4 h-4 ml-1" /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="pb-4 pr-4">Technician</th>
                <th className="pb-4 pr-4">Category</th>
                <th className="pb-4 pr-4">Location</th>
                <th className="pb-4 pr-4 text-center">Documents</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isTechsLoading ? (
                <tr><td colSpan="5" className="py-10 text-center italic text-slate-400">Loading requests...</td></tr>
              ) : technicians.filter(t => t.isApproved === 'pending').length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-slate-400">No pending verifications.</td></tr>
              ) : (
                technicians.filter(t => t.isApproved === 'pending').map((tech) => (
                  <tr key={tech._id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-5 pr-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                          {tech.userId?.name?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{tech.userId?.name}</p>
                          <p className="text-[10px] text-slate-400">{tech.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 pr-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black">{tech.category}</span>
                    </td>
                    <td className="py-5 pr-4 text-sm font-bold text-slate-600">{tech.address || 'Bengaluru'}</td>
                    <td className="py-5 pr-4 text-center">
                      <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-black">
                        <CheckCircle className="w-3 h-3 mr-1" /> 4/4
                      </span>
                    </td>
                    <td className="py-5 text-right space-x-2">
                      <button onClick={() => handleVerify(tech._id, 'approved')} className="btn-accent px-4 py-2 text-[10px] rounded-xl shadow-none">Approve</button>
                      <button onClick={() => handleVerify(tech._id, 'rejected')} className="px-4 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-xl">Reject</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
