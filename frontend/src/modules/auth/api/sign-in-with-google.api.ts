import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase";
import { mapFirebaseUser } from "./map-firebase-user";
import type { AuthUser } from "../interfaces/auth-user";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Signs the user in with Google using a popup window.
 * Google is the only provider enabled in the application.
 * @returns The authenticated user.
 */
export const signInWithGoogleAsync = async (): Promise<AuthUser> => {
    const credential = await signInWithPopup(getFirebaseAuth(), googleProvider);

    return mapFirebaseUser(credential.user);
};
