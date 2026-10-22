import { Link, Outlet } from "react-router";

import { Brand } from "@/shared/components/brand/Brand";
import { PageAmbient } from "@/shared/components/page-ambient/PageAmbient";
import { ThemeToggle } from "@/shared/components/theme-toggle/ThemeToggle";

/**
 * Layout of the welcome module.
 */
export const WelcomeLayout = () => {
    return (
        <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
            <PageAmbient />

            <header className="app-header sticky top-0 z-40 border-b border-border/60">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-8">
                    <Link
                        to="/welcome"
                        className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        aria-label="Studio One home"
                    >
                        <Brand subtitle="Composer workspace" />
                    </Link>

                    <ThemeToggle />
                </div>
            </header>

            <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 py-9 sm:px-8 sm:py-14">
                <Outlet />
            </main>

            <footer className="relative z-10 border-t border-border/60 px-5 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center text-xs text-muted-foreground sm:px-8">
                Manage your musical compositions in one place.
            </footer>
        </div>
    );
};

export default WelcomeLayout;
