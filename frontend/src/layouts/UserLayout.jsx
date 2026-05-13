import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { LayoutDashboard, Calendar, Settings, Heart, LogOut } from 'lucide-react';

const UserLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { label: 'Marketplace', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard', end: true },
    { label: 'My Bookings', icon: <Calendar className="w-5 h-5" />, path: '/dashboard/bookings' },
    { label: 'Favorites', icon: <Heart className="w-5 h-5" />, path: '/dashboard/favorites' },
    { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/dashboard/settings' },
  ];

  return (
    <div className="flex flex-col min-h-screen pt-20 bg-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Dashboard Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-card border rounded-[2rem] p-6 shadow-sm sticky top-28">
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

              <div className="mt-10 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Need Help?</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">Our 24/7 concierge is here to assist you with any service issue.</p>
                <button className="text-[10px] font-black text-primary hover:underline">Contact Support</button>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 mt-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Logout</span>
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

export default UserLayout;
