import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RequireRole = ({ allowedRoles, children }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const location = useLocation();

  console.log('🔒 RequireRole - currentUser:', currentUser);

  if (!currentUser) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role_id)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireRole;