import { Link } from "react-router";
import { ArrowLeftIcon, CompassIcon } from "lucide-react";

import { Brand } from "@/shared/components/brand/Brand";
import { PageAmbient } from "@/shared/components/page-ambient/PageAmbient";
import { StaffLines } from "@/shared/components/staff-lines/StaffLines";
import { ThemeToggle } from "@/shared/components/theme-toggle/ThemeToggle";
import { buttonVariants } from "@/shared/shadcn/ui/button";
import { cn } from "@/lib/extensions/utils";

/**
 * 404 page.
 */
export const NotFoundPage = () => {
    return (
        <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
            <PageAmbient />

            <header className="relative z-10 flex items-center justify-between gap-4 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
                <Brand subtitle="Composer workspace" />
                <ThemeToggle />
            </header>

            <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
                <div className="relative w-full max-w-lg animate-rise overflow-hidden rounded-[26px] border border-border/70 bg-card p-8 text-center shadow-2xl shadow-primary/10 sm:p-12">
                    <StaffLines className="text-primary/15" />

                    <div className="relative flex flex-col items-center gap-4">
                        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                            <CompassIcon className="size-5" />
                        </span>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Error 404
                        </p>
                        <h1 className="font-heading text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-balance">
                            This page went quiet.
                        </h1>
                        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                            The page you were looking for does not exist or has moved.
                            Your studio is still right where you left it.
                        </p>
                        <Link
                            to="/welcome"
                            className={cn(buttonVariants({ variant: "default" }), "mt-2 h-10 gap-2 rounded-xl px-4")}
                        >
                            <ArrowLeftIcon />
                            Back to the studio
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-xs text-muted-foreground sm:px-8">
                Manage your musical compositions in one place.
            </footer>
        </div>
    );
};
