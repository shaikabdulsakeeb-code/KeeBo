import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-destructive mb-4">401</h1>
      <h2 className="text-2xl font-semibold mb-6">Unauthorized Access</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        You do not have permission to view this page. Please log in with appropriate credentials.
      </p>
      <Link 
        to="/login" 
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Go to Login
      </Link>
    </div>
  );
}
