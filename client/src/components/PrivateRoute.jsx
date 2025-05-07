import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("auth-token"); // hoặc từ context/auth state

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
