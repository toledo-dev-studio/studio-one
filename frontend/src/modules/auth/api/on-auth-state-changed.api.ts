import { onAuthStateChanged } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase";
import { mapFirebaseUser } from "./map-firebase-user";
import type { AuthUser } from "../interfaces/auth-user";

/**
 * Listens to the Firebase session changes.
 * The callback is executed immediately with the current session state.
 * @param callback Called with the authenticated user or null.
 * @returns Function to stop listening.
 */
export const onAuthStateChangedAsync = (callback: (user: AuthUser | null) => void): (() => void) => {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
        callback(user ? mapFirebaseUser(user) : null);
    });
};
