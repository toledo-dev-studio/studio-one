import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import authRouter from "@/modules/auth/routes/auth.router";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { Loader } from "@/shared/components/loader/Loader";
import { RootLayout } from "./components/RootLayout";

/**
 * Domain modules are loaded on demand, the first time the user enters them.
 */
const lazyModuleRouters: Record<string, () => Promise<{ default: RouteObject }>> = {
    "/welcome": () => import("@/modules/welcome/routes/welcome.router"),
};

const loadedModuleRouters = new Set<string>();

export const appRouter = createBrowserRouter([
    {
        id: "root",
        element: <RootLayout />,
        hydrateFallbackElement: <Loader title="Loading" />,
        children: [
            /** auth */
            ...authRouter,
            {
                path: "/",
                element: <Navigate to="/welcome" replace />
            },
            /** 404 not found page */
            {
                path: '*',
                element: <NotFoundPage />
            }
        ]
    }
], {
    async patchRoutesOnNavigation({ patch, path }) {
        const firstSegment = "/" + path.split("/")[1];
        const loadModuleRouter = lazyModuleRouters[firstSegment];
        if (!loadModuleRouter || loadedModuleRouters.has(firstSegment))
            return;
        const { default: moduleRouter } = await loadModuleRouter();
        loadedModuleRouters.add(firstSegment);
        patch("root", [moduleRouter]);
    }
});
