import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { 
  LayoutDashboard, Calendar, Settings, MessageSquare, 
  Briefcase, UserCircle, LogOut, ChevronRight 
} from 'lucide-react';

const TechnicianLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, path: '/technician', end: true },
    { label: 'My Bookings', icon: <Calendar className="w-5 h-5" />, path: '/technician/bookings' },
    { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/technician/chat' },
    { label: 'My Services', icon: <Briefcase className="w-5 h-5" />, path: '/technician/services' },
    { label: 'Profile Settings', icon: <UserCircle className="w-5 h-5" />, path: '/technician/settings' },
  ];

  return (
    <div className="flex flex-col min-h-screen pt-20 bg-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Dashboard Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-card border rounded-[2rem] p-6 shadow-sm sticky top-28">
              <div className="mb-8 px-4">
                <h2 className="text-xl font-bold">Pro Center</h2>
                <p className="text-xs text-muted-foreground">Manage your business</p>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group
                      ${isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-muted-foreground hover:bg-accent hover:text-white'}
                    `}
                  >
                    <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                    <span className="font-bold text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="mt-10 p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Live Support</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">Questions about a booking? Talk to our pro success team.</p>
                <button className="text-[10px] font-black text-green-600 hover:underline">Open Pro Chat</button>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-4 mt-6 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-100 group shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="font-bold text-sm">Sign Out</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TechnicianLayout;
