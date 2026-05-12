import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Hammer, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Hammer className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">KeeBo</span>
        </Link>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {user?.name}
                </span>
                <button
                  onClick={() => dispatch(logout())}
                  className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
