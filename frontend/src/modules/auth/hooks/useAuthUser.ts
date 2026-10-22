import { useAuthStore } from "../stores/auth.store";

/**
 * Exposes the authentication state and actions to the components.
 */
export const useAuthUser = () => {
    const user = useAuthStore((state) => state.user);
    const authStatus = useAuthStore((state) => state.authStatus);
    const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
    const logout = useAuthStore((state) => state.logout);

    return {
        user,
        authStatus,
        signInWithGoogle,
        logout,
    };
};
