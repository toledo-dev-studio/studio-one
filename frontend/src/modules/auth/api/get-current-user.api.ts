import { getFirebaseAuth } from "@/lib/firebase";
import { mapFirebaseUser } from "./map-firebase-user";
import type { AuthUser } from "../interfaces/auth-user";

/**
 * Returns the user of the current session, if any.
 * @returns The authenticated user or null.
 */
export const getCurrentUserAsync = async (): Promise<AuthUser | null> => {
    const user = getFirebaseAuth().currentUser;

    return user ? mapFirebaseUser(user) : null;
};
