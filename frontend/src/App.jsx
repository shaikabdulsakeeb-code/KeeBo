import { ThemeProvider } from './hooks/useTheme';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/shared/ScrollToTop';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isOnboarding = location.pathname === '/technician/onboarding';
  const isAdmin = location.pathname.startsWith('/admin');

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
