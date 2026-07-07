import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');

  // If no token → redirect to login immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists → show the page
  return children;
}

export default PrivateRoute;
