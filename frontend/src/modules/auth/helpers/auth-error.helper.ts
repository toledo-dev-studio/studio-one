import { showErrorToast } from "@/lib/helpers/error-toast.helper";

/**
 * Friendly messages for the Firebase authentication errors.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
    "auth/popup-closed-by-user": "The Google sign in window was closed before finishing.",
    "auth/cancelled-popup-request": "The Google sign in window was closed before finishing.",
    "auth/popup-blocked": "Your browser blocked the Google sign in window. Allow popups for this site and try again.",
    "auth/network-request-failed": "Network error while contacting Google. Check your connection and try again.",
    "auth/unauthorized-domain": "This domain is not authorized in the Firebase console. Add it to the authorized domains.",
    "auth/operation-not-allowed": "Google sign in is not enabled yet in the Firebase console.",
    "auth/configuration-not-found": "The Firebase configuration is missing or invalid.",
    "auth/too-many-requests": "Too many attempts. Please try again in a few minutes.",
    "auth/user-disabled": "This account has been disabled.",
};

/**
 * Translates a Firebase error into a message the user can understand.
 * @param error Error thrown by the Firebase SDK.
 * @returns Human readable message.
 */
export const getAuthErrorMessage = (error: unknown): string => {
    const code = (typeof error === "object" && error !== null && "code" in error)
        ? String((error as { code: unknown }).code)
        : "";

    return AUTH_ERROR_MESSAGES[code] ?? "We could not sign you in with Google. Please try again.";
};

/**
 * Shows the error of a failed authentication attempt.
 * @param error Error thrown by the Firebase SDK.
 */
export const showAuthErrorToast = (error: unknown): void => {
    showErrorToast("Sign in failed", getAuthErrorMessage(error));
};
