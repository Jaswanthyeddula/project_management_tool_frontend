import axios from "axios";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://project-management-tool-backend-v3-264n.onrender.com/api",
    withCredentials: false,
});
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default api;