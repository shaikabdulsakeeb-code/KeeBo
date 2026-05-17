import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { LayoutDashboard, Calendar, Settings, Heart, LogOut, Menu, X, ChevronRight } from 'lucide-react';

const UserLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard', end: true },
    { label: 'My Bookings', icon: <Calendar className="w-5 h-5" />, path: '/dashboard/bookings' },
    { label: 'Favorites', icon: <Heart className="w-5 h-5" />, path: '/dashboard/favorites' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {/* Mobile Sidebar Toggle - YouTube style floating button or part of a sub-header */}
      <div className="lg:hidden sticky top-20 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center space-x-2 text-primary font-bold"
        >
          <Menu className="w-5 h-5" />
          <span>Dashboard Menu</span>
        </button>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {navItems.find(item => location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)))?.label || 'Dashboard'}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
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

              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 mt-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Logout</span>
              </button>
            </div>
          </aside>

          {/* Mobile Sidebar Drawer (YouTube style) */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
                />
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 left-0 bottom-0 w-[280px] bg-background z-[70] lg:hidden shadow-2xl flex flex-col"
                >
                  <div className="p-6 border-b flex items-center justify-between">
                    <span className="text-xl font-black tracking-tight text-primary">KeeBo Dashboard</span>
                    <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={({ isActive }) => `
                          flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200
                          ${isActive 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-muted-foreground hover:bg-accent'}
                        `}
                      >
                        <div className="flex items-center space-x-4">
                          <span className={location.pathname === item.path ? 'text-primary' : ''}>{item.icon}</span>
                          <span className="font-bold">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </NavLink>
                    ))}
                  </nav>

                  <div className="p-4 border-t">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <main className="lg:col-span-9 w-full">
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
