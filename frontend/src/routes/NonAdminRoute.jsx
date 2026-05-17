import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

const NonAdminRoute = ({ children }) => {
  const user = useSelector(selectCurrentUser);

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default NonAdminRoute;
