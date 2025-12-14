import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading your workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace={false} />;
  }

  return children;
}

