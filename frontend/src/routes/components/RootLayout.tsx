import { useEffect, useState } from "react";
import { Outlet, useNavigation } from "react-router";

import { Loader } from "@/shared/components/loader/Loader";

const LOADER_DELAY_MS = 200;

/**
 * Root layout of the application.
 * Shows a loader while a new section is being loaded.
 */
export const RootLayout = () => {
    const navigation = useNavigation();
    const navigationKey = navigation.state === "loading" ? navigation.location?.key : undefined;
    const [visibleLoaderKey, setVisibleLoaderKey] = useState<string | null>(null);

    useEffect(() => {
        if (!navigationKey)
            return;

        const timeout = setTimeout(() => setVisibleLoaderKey(navigationKey), LOADER_DELAY_MS);
        return () => clearTimeout(timeout);
    }, [navigationKey]);

    const showLoader = navigationKey !== undefined && visibleLoaderKey === navigationKey;

    return (
        <>
            <Outlet />
            {
                showLoader && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <Loader title="Loading section" subtitle="Please wait..." fullScreen={false} size="default" className="bg-transparent" />
                    </div>
                )
            }
        </>
    );
};
