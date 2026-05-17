import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useState } from 'react';
import { 
  LayoutDashboard, ShieldCheck, LogOut, Calendar, Settings, UserCircle, Clock, AlertTriangle, Menu, X
} from 'lucide-react';
import { 
  useGetSettlementsQuery, 
  useGetAllTechniciansQuery 
} from '../features/admin/api/adminApi';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: settlementsResponse } = useGetSettlementsQuery();
  const { data: techsResponse } = useGetAllTechniciansQuery({ isApproved: 'approved', limit: 100 });
  
  const pendingCount = (settlementsResponse?.data || []).filter(s => s.status === 'pending').length;
  const defaulterCount = (techsResponse?.data || []).filter(t => t.outstandingDues > 0).length;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin', end: true },
    { label: 'Settlement Queue', icon: <Clock className="w-5 h-5" />, path: '/admin?tab=queue', badge: pendingCount },
    { label: 'Unpaid Dues', icon: <AlertTriangle className="w-5 h-5" />, path: '/admin?tab=defaulters', badge: defaulterCount, badgeColor: 'bg-rose-600 text-white' },
    { label: 'Technicians', icon: <ShieldCheck className="w-5 h-5" />, path: '/admin/technicians' },
    { label: 'Approvals', icon: <Clock className="w-5 h-5" />, path: '/admin/approvals' },
    { label: 'Users', icon: <UserCircle className="w-5 h-5" />, path: '/admin/users' },
    { label: 'All Bookings', icon: <Calendar className="w-5 h-5" />, path: '/admin/bookings' },
    { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' },
  ];

  const checkActive = (item) => {
    if (item.path.includes('?tab=')) {
      return location.pathname + location.search === item.path;
    }
    if (item.path === '/admin') {
      return location.pathname === '/admin' && !location.search.includes('tab=');
    }
    return location.pathname === item.path;
  };

  const SidebarContent = () => (
    <>
      <div className="px-6 h-16 flex items-center mb-6 justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-650 rounded-lg flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-800">KeeBo <span className="text-red-600">Admin</span></h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = checkActive(item);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              <div className="flex items-center space-x-4">
                <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm tracking-tight ${isActive ? 'font-black' : 'font-semibold'}`}>
                  {item.label}
                </span>
              </div>
              {item.badge > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse ${item.badgeColor || 'bg-blue-600 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-650 rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col fixed inset-y-0 z-40 hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-64 bg-white border-r border-slate-200/80 flex flex-col fixed inset-y-0 left-0 z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col overflow-x-hidden">
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-400 truncate">Admin Control Center</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-black text-slate-800">Super Admin</span>
              <span className="text-[10px] text-slate-400 font-bold">System Controller</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100">
              AD
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-8 lg:p-10 flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
