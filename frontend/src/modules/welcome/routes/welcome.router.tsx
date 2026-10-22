import { lazy } from "react";
import { type RouteObject } from "react-router";

import { WelcomePage } from "../pages/WelcomePage";
import { AuthenticatedRoute } from "@/routes/protected.router";

const WelcomeLayout = lazy(() => import("@/modules/welcome/layouts/WelcomeLayout"));

export const welcomeRouter: RouteObject = {
    path: "/welcome",
    element:
        <AuthenticatedRoute>
            <WelcomeLayout />
        </AuthenticatedRoute>,
    children: [
        {
            index: true,
            element: <WelcomePage />
        },
        {
            path: "*",
            element: <WelcomePage />
        }
    ]
};

export default welcomeRouter;
