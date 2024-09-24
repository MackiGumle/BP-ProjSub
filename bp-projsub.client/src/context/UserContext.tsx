import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
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
};

type UserContextType = {
    user: UserProfile | null;
    token: string | null;

    // register: (email: string, name: string, surname: string, password: string) => void;
    login: (username: string, password: string) => void;
    logout: () => void;
    isLoggedIn: () => boolean;
    hasRole: (role: string) => boolean;
};

type Props = { children: React.ReactNode };

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: Props) => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    //const [roles, setRoles] = useState<string[] | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const storage_user = localStorage.getItem("user");
        const storage_token = localStorage.getItem("token");
        if (storage_user && storage_token) {
            setUser(JSON.parse(storage_user));
            setToken(storage_token);
            axios.defaults.headers.common["Authorization"] = "Bearer " + storage_token;
        }
        setIsReady(true);
    }, []);

    // const register = async (email: string, name: string, surname: string, password: string) => {
    //     try {
    //         const response = await axios.post<LoginResponse>("Auth/register", {
    //             email,
    //             name,
    //             surname,
    //             password,
    //         });
            
    //         const data = response.data;

    //         setUser({id: data.id, username: data.username, email: data.email});
    //         setToken(data.token);
    //         setRoles(data.roles);
    //         localStorage.setItem("user", JSON.stringify(user));
    //         localStorage.setItem("token", token ?? "");
    //         navigate("/home");
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    const login = async (email: string, password: string) => {
        try {
          await axios.post<LoginResponse>("api/Auth/login", { email, password })
            .then(response => {
              const { id, username, email: userEmail, token, roles } = response.data;
              
              setUser({ id, username, email: userEmail, roles });
              setToken(token);
            //   setRoles(roles);
      
              localStorage.setItem("user", JSON.stringify({ id, username, email: userEmail, roles }));
              localStorage.setItem("token", token ?? "");
      
              console.log("Success: logged in");
              navigate("/");
            })
            .catch(error => {
              console.error("Login failed:", error);
            });
        } catch (error) {
          console.error("An unexpected error occurred:", error);
        }
      };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        navigate("/login", {replace: true});
    };

    const isLoggedIn = (): boolean => {
        return !!token;
    };

    const hasRole = (role: string): boolean => {
        return user?.roles?.includes(role) ?? false;
    };

    return (
        <UserContext.Provider value={{ user, token, login, logout, isLoggedIn, hasRole }}>
            {isReady ? children : null}
        </UserContext.Provider>
    );
}

export const useAuth = () => React.useContext(UserContext);