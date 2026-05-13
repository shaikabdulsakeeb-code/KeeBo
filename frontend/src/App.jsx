import { ThemeProvider } from './hooks/useTheme';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main>
          <AppRoutes />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
