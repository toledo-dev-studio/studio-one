import { initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import {
    FIREBASE_AUTH_EMULATOR_URL,
    FIREBASE_CONFIG,
    FIREBASE_NOT_CONFIGURED_MESSAGE,
    IS_FIREBASE_CONFIGURED,
} from "@/lib/constants/environment.constants";

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;

/**
 * Returns the Firebase application, creating it on the first call.
 * @throws When the Firebase configuration is missing.
 */
export const getFirebaseApp = (): FirebaseApp => {
    if (!firebaseApp) {
        if (!IS_FIREBASE_CONFIGURED)
            throw new Error(FIREBASE_NOT_CONFIGURED_MESSAGE);

        firebaseApp = initializeApp(FIREBASE_CONFIG);
    }

    return firebaseApp;
};

/**
 * Returns the Firebase Auth instance, creating it on the first call.
 * Connects to the Auth Emulator when `VITE_FIREBASE_AUTH_EMULATOR_URL` is set.
 * @throws When the Firebase configuration is missing.
 */
export const getFirebaseAuth = (): Auth => {
    if (!firebaseAuth) {
        firebaseAuth = getAuth(getFirebaseApp());

        if (FIREBASE_AUTH_EMULATOR_URL)
            connectAuthEmulator(firebaseAuth, FIREBASE_AUTH_EMULATOR_URL, { disableWarnings: true });
    }

    return firebaseAuth;
};

let firebaseFirestore: Firestore | undefined;

/**
 * Returns the Firestore instance, creating it on the first call.
 * Every document lives under `users/{uid}/chords`, so a user can only reach
 * their own compositions even before the security rules are evaluated.
 * @throws When the Firebase configuration is missing.
 */
export const getFirebaseFirestore = (): Firestore => {
    if (!firebaseFirestore) {
        if (!IS_FIREBASE_CONFIGURED)
            throw new Error(FIREBASE_NOT_CONFIGURED_MESSAGE);

        firebaseFirestore = getFirestore(getFirebaseApp());
    }

    return firebaseFirestore;
};
