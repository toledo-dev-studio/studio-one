import { signOut } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase";

/**
 * Signs the current user out.
 */
export const signOutAsync = async (): Promise<void> => {
    await signOut(getFirebaseAuth());
};
