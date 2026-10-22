import axios from "axios";

import { queryClient } from "@/lib/query-client";
import { VITE_API_URL } from "@/lib/constants/environment.constants";
import { useAuthStore } from "@/modules/auth/stores/auth.store";

/**
 * Axios instance shared by every API function.
 */
const api = axios.create({
    baseURL: VITE_API_URL,
    withCredentials: true,
});

// Interceptor for 401 response code (the cookie is removed automatically by backend)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear authentication cache and state in Zustand store
            // Routes will redirect to the login page because authStatus will be "not-authenticated"
            queryClient.clear();
            useAuthStore.getState().clearSession();
        }
        return Promise.reject(error);
    }
);

export { api };
