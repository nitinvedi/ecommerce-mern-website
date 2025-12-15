import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function TechnicianRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/" replace />;

  if (user.role !== "technician") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
