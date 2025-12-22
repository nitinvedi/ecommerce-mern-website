import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { api, API_ENDPOINTS, setAuthToken } from "../config/api";

export default function GoogleOneTap() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Should not show if user is logged in
    if (user) return;

    // Check if Google script is loaded
    if (!window.google) return;

    const handleCredentialResponse = async (response) => {
      try {
        console.log("One Tap Credential Received", response);
        const data = await api.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
          credential: response.credential
        });
        
        if (data.token || data.data?.token) {
            setAuthToken(data.token || data.data.token);
            await refreshProfile();
            // Redirect logic (Smart Redirect)
            // If on login page, go to dashboard. Otherwise stay on current page (seamless login).
            if (location.pathname === '/login' || location.pathname === '/signup') {
                navigate('/dashboard');
            }
        }
      } catch (error) {
        console.error("One Tap Login Failed", error);
        // Silent fail is preferred for One Tap to not annoy user
      }
    };

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      cancel_on_tap_outside: false, // User choice
    });

    // Prompt logic with cooldown handling is built-in by Google
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log("One Tap skipped/not displayed:", notification.getNotDisplayedReason());
      }
    });

  }, [user]);

  return null; // This component renders nothing visible itself
}
