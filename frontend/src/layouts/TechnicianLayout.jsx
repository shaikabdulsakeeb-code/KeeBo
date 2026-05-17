import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useGetOwnProfileQuery } from '../features/technicians/api/technicianApi';
import { setFormDirty, setPendingNavigation, clearNavigation } from '../features/ui/uiSlice';
import { Button } from '../components/ui/Button';
import { 
  LayoutDashboard, Calendar, Settings, MessageSquare, Star,
  Briefcase, UserCircle, LogOut, ChevronRight, Menu, X, Clock, AlertCircle
} from 'lucide-react';

const TechnicianLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { data: profileData, isLoading: isProfileLoading } = useGetOwnProfileQuery();
  const profile = profileData?.data;

  // Global UI state from Redux
  const isDirty = useSelector((state) => state.ui.isFormDirty);
  const pendingPath = useSelector((state) => state.ui.pendingNavigationPath);
  const showExitModal = !!pendingPath;

  useEffect(() => {
    // If no profile or incomplete profile, go to onboarding
    if (!isProfileLoading) {
      if (!profile || !profile.category) {
        navigate('/technician/onboarding');
      }
    }
  }, [profile, isProfileLoading, navigate]);

  const handleLogout = () => {
    if (isDirty) {
      dispatch(setPendingNavigation('/logout'));
    } else {
      dispatch(logout());
      navigate('/login');
    }
  };

  const handleNavClick = (e, path) => {
    if (isDirty && location.pathname !== path) {
      if (e) e.preventDefault();
      dispatch(setPendingNavigation(path));
      return false;
    }
    setIsMobileSidebarOpen(false);
    return true;
  };

  const confirmExit = () => {
    dispatch(setFormDirty(false));
    const targetPath = pendingPath;
    dispatch(clearNavigation());
    
    if (targetPath === '/logout') {
      dispatch(logout());
      navigate('/login');
    } else if (targetPath) {
      navigate(targetPath);
    }
  };

  const cancelExit = () => {
    dispatch(clearNavigation());
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isApproved = profile?.isApproved === 'approved';
  
  // Define sidebar items (Filtered based on approval status)
  const navItems = isApproved 
    ? [
        { label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, path: '/technician', end: true },
        { label: 'My Bookings', icon: <Calendar className="w-5 h-5" />, path: '/technician/bookings' },
        { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/technician/chat' },
        { label: 'My Reviews', icon: <Star className="w-5 h-5" />, path: '/technician/reviews' },
        { label: 'Profile Settings', icon: <UserCircle className="w-5 h-5" />, path: '/technician/profile-management' },
        { label: 'Logout', icon: <LogOut className="w-5 h-5" />, path: '#', action: handleLogout },
      ]
    : [
        { label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, path: '/technician', end: true },
        { label: 'Profile Settings', icon: <UserCircle className="w-5 h-5" />, path: '/technician/profile-management' },
        { label: 'Logout', icon: <LogOut className="w-5 h-5" />, path: '#', action: handleLogout },
      ];

  const UnsavedChangesModal = ({ onStay, onLeave }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-white/10 rounded-[2.5rem] p-10 max-w-sm w-full space-y-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary"></div>
        <div className="w-20 h-20 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-black tracking-tight">Unsaved Changes</h3>
          <p className="text-muted-foreground text-sm leading-relaxed font-medium">You have made changes that haven't been saved yet. Are you sure you want to discard them and leave?</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button className="h-14 rounded-2xl font-bold bg-primary text-white shadow-xl shadow-primary/20" onClick={onStay}>Stay & Save</Button>
          <Button variant="ghost" className="h-14 rounded-2xl font-bold text-red-500 hover:bg-red-500/10" onClick={onLeave}>Discard Changes</Button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {showExitModal && <UnsavedChangesModal onStay={cancelExit} onLeave={confirmExit} />}
      
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden sticky top-20 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center space-x-2 text-primary font-bold"
        >
          <Menu className="w-5 h-5" />
          <span>Pro Menu</span>
        </button>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {!isApproved ? 'Restricted Access' : (navItems.find(item => location.pathname === item.path || (item.path !== '/technician' && location.pathname.startsWith(item.path)))?.label || 'Pro Center')}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-card border rounded-[2rem] p-6 shadow-sm sticky top-28">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  item.action ? (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-red-500 hover:bg-red-50"
                    >
                      <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                      <span className="font-bold text-sm">{item.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={(e) => handleNavClick(e, item.path)}
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
                  )
                ))}
              </nav>
            </div>
          </aside>

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

      {/* Mobile Sidebar Drawer */}
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
                <span className="text-xl font-black tracking-tight text-primary">Pro Center</span>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map((item) => (
                  item.action ? (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action();
                        if (!isDirty) setIsMobileSidebarOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-200 group text-red-500 hover:bg-red-50"
                    >
                      <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                      <span className="font-bold">{item.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={(e) => handleNavClick(e, item.path)}
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
                  )
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechnicianLayout;
