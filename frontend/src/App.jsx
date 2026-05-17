import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { socket } from './lib/socket';
import { ThemeProvider } from './hooks/useTheme';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/shared/ScrollToTop';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isOnboarding = location.pathname === '/technician/onboarding';
  const isAdmin = location.pathname.startsWith('/admin');
  
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && token) {
      socket.connect();
      if (user.role === 'admin') {
        socket.emit('joinAdmin');
      } else {
        socket.emit('join', user._id || user.id);
      }
    } else {
      socket.disconnect();
    }
    
    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  return (
    <ThemeProvider>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {!isOnboarding && !isAdmin && <Navbar />}
        <main className={isOnboarding || isAdmin ? '' : 'pt-20'}>
          <AppRoutes />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
