/**
 * This file manages all the environment variables constants used in the application.
 *
 * The values are injected by Vite:
 * - Development: Docker Compose passes them as container environment variables.
 * - Production:  Docker Compose passes them as build arguments.
 * - Local (without Docker): they are read from `frontend/.env`.
 */
export type AppEnvironment = "mockable" | "development" | "production";

export const VITE_ENVIRONMENT: AppEnvironment = (import.meta.env.VITE_ENVIRONMENT as AppEnvironment) ?? "development";
export const VITE_API_URL: string = import.meta.env.VITE_API_URL ?? "";

/** Firebase web app configuration (public by design). */
export const FIREBASE_CONFIG = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
};

/** Optional Firebase Auth Emulator, useful to work without real credentials. */
export const FIREBASE_AUTH_EMULATOR_URL: string = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL ?? "";

export const IS_MOCKABLE = VITE_ENVIRONMENT === "mockable";
export const IS_DEVELOPMENT = VITE_ENVIRONMENT === "development";
export const IS_PRODUCTION = VITE_ENVIRONMENT === "production";

/**
 * True when the Firebase web app configuration is complete.
 * The login screen uses it to warn the developer instead of failing silently.
 */
export const IS_FIREBASE_CONFIGURED = Boolean(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.authDomain &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.appId
);

/** Message shown when the Firebase configuration is missing. */
export const FIREBASE_NOT_CONFIGURED_MESSAGE =
    "Firebase is not configured yet. Add the VITE_FIREBASE_* values to the .env file and restart the container.";
