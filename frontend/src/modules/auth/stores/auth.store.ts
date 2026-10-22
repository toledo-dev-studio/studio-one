import { create } from "zustand";

import { IS_FIREBASE_CONFIGURED } from "@/lib/constants/environment.constants";
import { queryClient } from "@/lib/query-client";
import { showAuthErrorToast } from "../helpers/auth-error.helper";
import { onAuthStateChangedAsync } from "../api/on-auth-state-changed.api";
import { signInWithGoogleAsync } from "../api/sign-in-with-google.api";
import { signOutAsync } from "../api/sign-out.api";
import type { AuthUser } from "../interfaces/auth-user";

export type AuthStatus = "authenticated" | "not-authenticated" | "checking";

type AuthStoreSet = (partial: Partial<AuthState>) => void;

export type AuthState = {
    // Properties
    user: AuthUser | null,
    authStatus: AuthStatus,

    // Actions
    setUser: (user: AuthUser) => void,
    clearSession: () => void,
    checkAuthStatus: () => void,
    signInWithGoogle: () => Promise<boolean>,
    logout: () => Promise<void>,
}

// Keeps the Firebase listener alive between calls (React strict mode mounts twice).
let stopAuthStateListener: (() => void) | null = null;

/**
 * Signs the user in with Google.
 * @param set Store setter.
 * @returns True when the session was created.
 */
const signInWithGoogle = async (set: AuthStoreSet): Promise<boolean> => {
    try {
        const user = await signInWithGoogleAsync();
        set({ user, authStatus: "authenticated" });
        return true;
    } catch (error) {
        console.warn(error);
        showAuthErrorToast(error);
        return false;
    }
};

/**
 * Signs the user out and clears the cached data.
 * @param set Store setter.
 */
const logout = async (set: AuthStoreSet): Promise<void> => {
    try {
        await signOutAsync();
    } catch (error) {
        console.warn(error);
    } finally {
        queryClient.clear();
        set({ user: null, authStatus: "not-authenticated" });
    }
};

/**
 * Validates the session on application bootstrap.
 * @param set Store setter.
 */
const checkAuthStatus = (set: AuthStoreSet): void => {
    if (!IS_FIREBASE_CONFIGURED) {
        set({ user: null, authStatus: "not-authenticated" });
        return;
    }

    if (stopAuthStateListener)
        return;

    stopAuthStateListener = onAuthStateChangedAsync((user) => {
        if (user)
            set({ user, authStatus: "authenticated" });
        else
            set({ user: null, authStatus: "not-authenticated" });
    });
};

// Store implementation
export const useAuthStore = create<AuthState>()((set) => (
    {
        // Properties
        user: null,
        authStatus: "checking",

        // Actions
        setUser: (user: AuthUser) => set({ user }),
        clearSession: () => {
            set({
                user: null,
                authStatus: "not-authenticated",
            });
        },
        checkAuthStatus: () => checkAuthStatus(set),
        signInWithGoogle: () => signInWithGoogle(set),
        logout: () => logout(set),
    }
));
