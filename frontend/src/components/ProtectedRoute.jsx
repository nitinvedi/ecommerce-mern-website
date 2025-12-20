import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading your workspace...
      </div>
    );
  }

  if (!user) {
    // Redirect to home (which might open auth modal?) 
    // OR we can just redirect to "/" but if the user wants to go to /dashboard, 
    // and they are redirected to /, they might be confused.
    // Ideally, we should redirect to a login page if one exists.
    // But since we use a Modal, we usually redirect to Home and Open Modal.
    // However, the request implies "Redirect to intended destination".
    // If we redirect to "/", we lose the context unless we pass state.
    // We pass the full path as a string to be robust.
    const returnUrl = location.pathname + location.search;
    return <Navigate to="/" state={{ from: returnUrl, openAuth: true }} replace />;
  }

  return children;
}

