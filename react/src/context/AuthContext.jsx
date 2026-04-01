import { useEffect, useState } from "react";
import api, {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "../lib/api";
import AuthContext from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refreshUser = async () => {
    const token = getStoredToken();

    if (!token) {
      setUser(null);
      setIsBootstrapping(false);
      return null;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
      return response.data.user;
    } catch {
      clearStoredToken();
      setUser(null);
      return null;
    } finally {
      setIsBootstrapping(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    setStoredToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });

    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isBootstrapping,
        login,
        changePassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
