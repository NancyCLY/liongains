import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/*
Checks global auth state
Blocks access if not logged in
Redirects to login
Makes protected pages clean and simple
*/


export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  // If auth context is still loading, we may want a loading state
  if (currentUser === undefined) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
