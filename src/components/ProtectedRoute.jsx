import { Navigate, Outlet } from "react-router-dom"; 
import { useSelector } from "react-redux";

function ProtectedRoute() { 
  const { user, token } = useSelector((state) => state.auth);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; 
}

export default ProtectedRoute;