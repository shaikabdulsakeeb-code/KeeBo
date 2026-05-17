import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Hammer, Menu, X, LogOut, ChevronRight, LayoutDashboard, Plus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';
import { setPendingNavigation } from '../features/ui/uiSlice';
import { useGetOwnProfileQuery } from '../features/technicians/api/technicianApi';
import { useUpdateProfileImageMutation } from '../features/profile/api/userApi';
import { updateUser } from '../features/auth/authSlice';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isDirty = useSelector((state) => state.ui.isFormDirty);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const { data: profileData } = useGetOwnProfileQuery(user?._id, { 
    skip: !isAuthenticated || user?.role !== 'technician' 
  });
  const [updateProfileImage, { isLoading: isUpdatingImage }] = useUpdateProfileImageMutation();
  const fileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  const isApproved = profileData?.data?.isApproved === 'approved';

  const handleProfileImageClick = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleMobileProfileImageClick = (e) => {
    e.preventDefault();
    mobileFileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const result = await updateProfileImage(formData).unwrap();
      dispatch(updateUser({ profileImage: result.data.profileImage }));
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile picture');
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (e, path) => {
    if (isDirty && location.pathname !== path) {
      e.preventDefault();
      dispatch(setPendingNavigation(path));
      return false;
    }
    return true;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Technicians', path: '/technicians' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ].filter(link => {
    if (link.name === 'Technicians') return isAuthenticated && user?.role !== 'technician';
    return true;
  });

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" onClick={(e) => handleNavClick(e, '/')} className="flex items-center space-x-2 group">
          <div className="p-2 bg-primary rounded-xl group-hover:scale-105 transition-transform">
            <Hammer className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">KeeBo</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={(e) => handleNavClick(e, link.path)}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4 border-l pl-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent transition-colors text-foreground/80"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">

                {(() => {
                  const isTechnician = user?.role === 'technician';
                  const isAdmin = user?.role === 'admin';
                  const hasProfile = !!profileData?.data?.category;
                  const dashboardPath = isAdmin ? '/admin' : isTechnician ? (hasProfile ? '/technician' : '/technician/onboarding') : '/dashboard';

                  return (
                    <Link to={dashboardPath} onClick={(e) => handleNavClick(e, dashboardPath)}>
                      <Button variant="ghost" className="font-medium">Dashboard</Button>
                    </Link>
                  )
                })()}
                <div className="flex items-center space-x-3 bg-accent/50 rounded-full py-1 px-1 pr-4 border">
                  <div 
                    onClick={handleProfileImageClick}
                    className={`w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all relative group ${isUpdatingImage ? 'opacity-50' : ''}`}
                  >
                    {isUpdatingImage ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : null}
                    {(() => {
                      const userImageUrl = (user?.profileImage && user.profileImage !== 'default.jpg') 
                        ? user.profileImage 
                        : (profileData?.data?.profileImage || 'default.jpg');
                        
                      return userImageUrl && userImageUrl !== 'default.jpg' ? (
                          <img src={userImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {user?.name?.charAt(0) || 'U'}
                          {/* Subtle transparent Plus icon badge */}
                          <div className="absolute bottom-0 right-0 p-0.5 bg-black/10 rounded-full translate-x-1 translate-y-1">
                            <Plus className="w-2.5 h-2.5 text-foreground/30 stroke-[3px]" />
                          </div>
                        </div>
                      )
                    })()}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                      <Plus className="w-5 h-5 text-white/80 stroke-[2px]" />
                      <span className="text-[6px] text-white/90 font-black tracking-[0.2em] uppercase mt-1">Update</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <span 
                    onClick={handleProfileImageClick}
                    className="text-sm font-medium max-w-[100px] truncate cursor-pointer hover:text-primary transition-colors"
                    title="Click to update profile picture"
                  >
                    {user?.name}
                  </span>
                  <button
                    onClick={() => {
                        if (isDirty) {
                            dispatch(setPendingNavigation('/logout'));
                        } else {
                            dispatch(logout());
                            navigate('/login');
                        }
                    }}
                    className="text-destructive hover:text-destructive/80 transition-colors ml-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="font-medium">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button className="font-medium shadow-md shadow-primary/20">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center space-x-3">
          {isAuthenticated && (() => {
            const isTechnician = user?.role === 'technician';
            const isAdmin = user?.role === 'admin';
            const hasProfile = !!profileData?.data?.category;
            const dashboardPath = isAdmin ? '/admin' : isTechnician ? (hasProfile ? '/technician' : '/technician/onboarding') : '/dashboard';
            
            return (
              <div className="relative group">
                <div 
                  onClick={handleMobileProfileImageClick}
                  className={`w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm border border-primary/20 overflow-hidden cursor-pointer ${isUpdatingImage ? 'opacity-50' : ''}`}
                >
                  {isUpdatingImage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    (() => {
                      const userImageUrl = (user?.profileImage && user.profileImage !== 'default.jpg') 
                        ? user.profileImage 
                        : (profileData?.data?.profileImage || 'default.jpg');

                      return userImageUrl && userImageUrl !== 'default.jpg' ? (
                          <img src={userImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          user?.name?.charAt(0) || 'U'
                      );
                    })()
                  )}
                </div>
                <input 
                  type="file" 
                  ref={mobileFileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            );
          })()}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={(e) => handleNavClick(e, link.path)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 text-foreground font-medium transition-colors"
                >
                  {link.name}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border/50 flex flex-col space-y-3">
                {isAuthenticated ? (
                  <div className="pt-2">
                    <div className="flex items-center justify-between bg-orange-100 dark:bg-orange-950/30 p-2 rounded-full border border-orange-200 dark:border-orange-900/50 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div 
                          onClick={handleMobileProfileImageClick}
                          className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md cursor-pointer relative overflow-hidden"
                        >
                          {(() => {
                            const userImageUrl = (user?.profileImage && user.profileImage !== 'default.jpg') 
                              ? user.profileImage 
                              : (profileData?.data?.profileImage || 'default.jpg');
                            return userImageUrl && userImageUrl !== 'default.jpg' ? (
                                <img src={userImageUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0) || 'U'
                            );
                          })()}
                        </div>
                        <span 
                          onClick={handleMobileProfileImageClick}
                          className="font-bold text-foreground text-base pr-4 cursor-pointer hover:text-primary transition-colors"
                        >
                          {user?.name}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                            if (isDirty) {
                                dispatch(setPendingNavigation('/logout'));
                                setIsMobileMenuOpen(false);
                            } else {
                                dispatch(logout());
                                navigate('/login');
                            }
                        }}
                        className="p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-orange-100 dark:border-orange-900/20 text-foreground hover:bg-orange-50 transition-colors"
                        aria-label="Logout"
                      >
                        <LogOut className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 mt-4">
                      {(() => {
                        const isTechnician = user?.role === 'technician';
                        const isAdmin = user?.role === 'admin';
                        const hasProfile = !!profileData?.data?.category;
                        const dashboardPath = isAdmin ? '/admin' : isTechnician ? (hasProfile ? '/technician' : '/technician/onboarding') : '/dashboard';
                        
                        return (
                          <Link to={dashboardPath} onClick={(e) => handleNavClick(e, dashboardPath)}>
                            <Button className="w-full justify-start rounded-2xl h-12 font-bold" variant="outline">
                              <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                            </Button>
                          </Link>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Link to="/login">
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/register">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Marquee Banner for Technicians with NO Profile */}
      {isAuthenticated && user?.role === 'technician' && (!profileData?.data || !profileData?.data?.category) && location.pathname !== '/technician/onboarding' && (
        <div className="bg-primary text-primary-foreground py-2 overflow-hidden border-b border-primary/20 shadow-lg">
          <div className="flex items-center whitespace-nowrap animate-marquee">
            <span className="text-xs font-black uppercase tracking-[0.2em] px-4">
              Action Required: Registration is not completed • Visit your dashboard to finish onboarding • Your profile is currently hidden from customers • Complete your setup to start earning • 
            </span>
            <span className="text-xs font-black uppercase tracking-[0.2em] px-4">
              Action Required: Registration is not completed • Visit your dashboard to finish onboarding • Your profile is currently hidden from customers • Complete your setup to start earning • 
            </span>
          </div>
          <div className="flex justify-center mt-1">
            <Link 
              to="/technician/onboarding" 
              onClick={(e) => handleNavClick(e, '/technician/onboarding')}
              className="text-[10px] font-bold bg-white text-primary px-3 py-0.5 rounded-full hover:bg-white/90 transition-colors flex items-center"
            >
              COMPLETE NOW <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
