import { QueryClient, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  roles: string[];
};

type LoginResponse = {
  id: string;
  username: string;
  email: string;
  token: string;
  roles: string[];
  expires: string;
};

type UserContextType = {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  hasRole: (role: string) => boolean;
  getRole: () => string;
};

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeAuth = () => {
      const storage_user = localStorage.getItem("user");
      const storage_token = localStorage.getItem("token");
      const storage_expires = localStorage.getItem("expires");

      if (storage_user && storage_token && storage_expires) {
        const expirationTime = new Date(storage_expires); // this actually converts to the right UTC time
        const currentTime = new Date();
        
        if (expirationTime > currentTime) {
          try {
            const parsedUser = JSON.parse(storage_user);
            setUser(parsedUser);
            setToken(storage_token);
            axios.defaults.headers.common["Authorization"] = "Bearer " + storage_token;
          } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.clear();
          }
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("expires");
        }
      }
      setIsReady(true);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>("/api/Auth/login", { email, password });
      const { id, username, email: userEmail, token, roles, expires } = response.data;

      setUser({ id, username, email: userEmail, roles });
      setToken(token);
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;

      localStorage.setItem("user", JSON.stringify({ id, username, email: userEmail, roles }));
      localStorage.setItem("token", token);
      localStorage.setItem("expires", expires);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    queryClient.clear();
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("expires");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptorId);
  }, [logout]);

  const isLoggedIn = (): boolean => {
    return !!token;
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const getRole = (): string => {
    if (!isLoggedIn()) return "None";
    if (user?.roles?.includes("Admin")) return "Admin";
    if (user?.roles?.includes("Teacher")) return "Teacher";
    return "Student";
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, isLoggedIn, hasRole, getRole }}>
      {isReady ? children : null}
    </UserContext.Provider>
  );
};

export const useAuth = () => React.useContext(UserContext);