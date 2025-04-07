import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("user"); // You can check token/session instead
  return isAuthenticated ? children : <Navigate to="/" />;
}
