/**
 * Authenticated user exposed to the application.
 * It hides the Firebase specific types so the UI never depends on the SDK.
 */
export interface AuthUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    providerId: string | null;
}
