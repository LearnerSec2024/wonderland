import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const TOKEN_STORAGE_KEY = "wonderland_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      try {
        const result = await api.getCurrentUser(token);
        setUser(result.user);
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadCurrentUser();
  }, [token]);

  const saveSession = (authResult) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, authResult.token);
    setToken(authResult.token);
    setUser(authResult.user);
  };

  const register = async (formData) => {
    const result = await api.registerUser(formData);
    saveSession(result);
    return result;
  };

  const login = async (credentials) => {
    const result = await api.loginUser(credentials);
    saveSession(result);
    return result;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(user && token),
      isAuthLoading,
      register,
      login,
      logout,
    }),
    [token, user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
