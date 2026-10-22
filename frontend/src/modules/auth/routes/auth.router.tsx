import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { LoginPage } from "../pages/login/LoginPage";
import { NotAuthenticatedRoute } from "@/routes/protected.router";

const AuthLayout = lazy(() => import("@/modules/auth/layouts/AuthLayout"));

export const authRouter: RouteObject[] = [
    {
        path: "/auth",
        element:
            <NotAuthenticatedRoute>
                <AuthLayout />
            </NotAuthenticatedRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="/auth/login" replace />
            },
            {
                path: "login",
                element: <LoginPage />
            }
        ]
    }
];

export default authRouter;
