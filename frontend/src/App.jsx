import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { socket } from './lib/socket';
import { ThemeProvider } from './hooks/useTheme';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/shared/ScrollToTop';
import { logout } from './features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from './components/ui/Button';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboarding = location.pathname === '/technician/onboarding';
  const isAdmin = location.pathname.startsWith('/admin');
  
  const { user, token } = useSelector((state) => state.auth);
  const [deletedAccountMessage, setDeletedAccountMessage] = useState(null);

  useEffect(() => {
    // Disconnect and reconnect to clear any stale socket rooms on the server if user changes
    socket.disconnect();
    socket.connect();

    const handleConnect = () => {
      if (user && token) {
        if (user.role === 'admin') {
          socket.emit('joinAdmin');
        } else {
          socket.emit('join', {
            userId: user._id || user.id,
            role: user.role
          });
        }
      }
    };

    const handleAccountDeleted = (data) => {
      setDeletedAccountMessage(data.message || 'Your account has been permanently deleted from the organisation.');
    };

    socket.on('connect', handleConnect);
    socket.on('accountDeleted', handleAccountDeleted);
    
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('accountDeleted', handleAccountDeleted);
    };
  }, [user, token]);

  const handleCloseDeletedModal = () => {
    setDeletedAccountMessage(null);
    dispatch(logout());
    navigate('/register');
  };

  return (
    <ThemeProvider>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {!isOnboarding && !isAdmin && <Navbar />}
        <main className={isOnboarding || isAdmin ? '' : 'pt-20'}>
          <AppRoutes />
        </main>
      </div>

      {/* Permanently Deleted Account Notification Modal */}
      <AnimatePresence>
        {deletedAccountMessage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/85 backdrop-blur-xl px-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-card border-2 border-destructive/20 rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
            >
              {/* Outer soft glowing background rings */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-destructive/5 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-destructive/5 rounded-full -ml-20 -mb-20"></div>

              <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner animate-pulse">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              
              <h2 className="text-3xl font-black text-foreground tracking-tight mb-4">Account Terminated</h2>
              <p className="text-muted-foreground font-semibold leading-relaxed mb-10 text-base">
                {deletedAccountMessage}
              </p>
              
              <Button 
                onClick={handleCloseDeletedModal}
                size="lg"
                variant="destructive"
                className="w-full rounded-2xl py-6 font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-destructive/25 hover:shadow-destructive/40 transition-all hover:scale-[1.02]"
              >
                <LogOut className="w-5 h-5" /> Acknowledge & Register
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
