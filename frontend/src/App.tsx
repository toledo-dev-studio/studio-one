import { useEffect, type PropsWithChildren } from "react";
import { RouterProvider } from "react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/shared/shadcn/ui/sonner";
import { TooltipProvider } from "@/shared/shadcn/ui/tooltip";
import { ThemeContextProvider } from "@/context/ThemeContext";
import { LoaderContextProvider } from "@/context/LoaderContext";
import { queryClient } from "@/lib/query-client";
import { appRouter } from "@/routes/app.router";
import { useAuthStore } from "@/modules/auth/stores/auth.store";

/**
 * Resolves the authentication status before the router is rendered.
 * The auth state is handled by Firebase, so the session survives page reloads.
 */
const AuthProvider = ({ children }: PropsWithChildren) => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // The global loader is already displayed by the LoaderContext while checking.
  if (authStatus === "checking")
    return null;

  return children;
}

export const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>

        {/* App context provider */}
        <ThemeContextProvider>

          {/* Toasts follow the active theme, so they live inside the provider */}
          <Toaster />

          {/* Loader context provider with Zustand */}
          <LoaderContextProvider>

            <TooltipProvider>

              {/* Validate the authentication session */}
              <AuthProvider>
                <RouterProvider router={appRouter} />
              </AuthProvider>

            </TooltipProvider>

          </LoaderContextProvider>

          <ReactQueryDevtools initialIsOpen={false} />

        </ThemeContextProvider>

      </QueryClientProvider>
    </>
  )
}
