import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/auth/me");
                const userData = response?.data?.user || response?.data || null;
                setUser(userData);
            } catch (error) {
                // Only clear token if server explicitly rejected auth (401 or 403),
                // not on temporary network timeout or server wake-up delay
                if (error?.response?.status === 401 || error?.response?.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("refreshToken");
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const register = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.log(error);
        }
        const keysToRemove = [
            'token',
            'refreshToken',
            'user',
            'flowspace_projects',
            'flowspace_workspaces',
            'flowspace_active_project_id',
            'flowspace_project_workspaces'
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('flowspace_tasks_') || key.startsWith('flowspace_boards_')) {
                localStorage.removeItem(key);
            }
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}