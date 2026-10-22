import { type PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuthStore } from "@/modules/auth/stores/auth.store";

/**
 * Validate if a user is authenticated, if not return to login page.
 * @param children Content for the view.
 * @returns Children, null or redirect view depending on the auth status.
 */
export const AuthenticatedRoute = ({ children }: PropsWithChildren) => {
    const location = useLocation();
    const authStatus = useAuthStore((state) => state.authStatus);

    if (authStatus === "checking")
        return null;

    if (authStatus === "not-authenticated")
        return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;

    return children;
}

/**
 * Validate if a user is already authenticated and tries to access an auth page.
 * @param children Content for the view.
 * @returns Children, null or redirect view depending on the auth status.
 */
export const NotAuthenticatedRoute = ({ children }: PropsWithChildren) => {
    const authStatus = useAuthStore((state) => state.authStatus);

    if (authStatus === "checking")
        return null;

    if (authStatus === "authenticated")
        return <Navigate to="/welcome" replace />;

    return children;
}
