import type { User as FirebaseUser } from "firebase/auth";

import type { AuthUser } from "../interfaces/auth-user";

/**
 * Converts a Firebase user into the application auth user.
 * @param user Firebase user.
 * @returns Application auth user.
 */
export const mapFirebaseUser = (user: FirebaseUser): AuthUser => ({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    providerId: user.providerData?.[0]?.providerId ?? null,
});
