import { createContext, useState, useEffect } from "react";
import api from "../API/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await api.get("/auth/profile");
          setUser(data);
        } catch (error) {
          console.error(error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    // Fetch profile to get full user data if login response is minimal
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
    localStorage.setItem("token", data.token);
    const { data: profile } = await api.get("/auth/profile");
    setUser(profile);
    return profile;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
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
