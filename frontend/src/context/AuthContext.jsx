import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { api, API_ENDPOINTS, getAuthToken, removeAuthToken, setAuthToken } from "../config/api.js";

export const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  refreshProfile: async () => null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get(API_ENDPOINTS.USERS.PROFILE);
      setUser(response.data);
      return response.data;
    } catch (_error) {
      removeAuthToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = useCallback(async ({ email, password }) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const token = response.data?.token || response.token;
      if (token) {
        setAuthToken(token);
        // Set loading to true while we fetch profile
        setLoading(true);
        // Refresh profile to get full user data
        const userData = await loadProfile();
        return { ...response, user: userData };
      } else {
        setUser(response.data?.user || null);
        setLoading(false);
      }
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [loadProfile]);

  const register = useCallback(async (payload) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, payload);
      const token = response.data?.token || response.token;
      if (token) {
        setAuthToken(token);
        // Set loading to true while we fetch profile
        setLoading(true);
        // Refresh profile to get full user data
        const userData = await loadProfile();
        return { ...response, user: userData };
      } else {
        setUser(response.data?.user || null);
        setLoading(false);
      }
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [loadProfile]);

  const logout = useCallback(() => {
    removeAuthToken();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    return loadProfile();
  }, [loadProfile]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    refreshProfile,
  }), [user, loading, login, register, logout, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;

