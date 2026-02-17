import { createContext, useState, useEffect } from "react";
import api from "../API/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setUser(data);
      } catch (error) {
        setUser(null);
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    await api.post("/auth/login", { email, password });
    // Token is set in cookie by server
    // Fetch profile to get full user data
    const { data: profile } = await api.get("/auth/profile");
    setUser(profile);
    return profile;
  };

  const register = async (name, email, password, role) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    return data;
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateProfile = async (userData) => {
    const { data } = await api.put("/auth/profile", userData);
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
