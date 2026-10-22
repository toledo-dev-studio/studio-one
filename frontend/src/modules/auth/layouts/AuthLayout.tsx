import { Outlet } from "react-router";
import { CheckIcon } from "lucide-react";

import { Brand, BrandMark } from "@/shared/components/brand/Brand";
import { PageAmbient } from "@/shared/components/page-ambient/PageAmbient";
import { StaffLines } from "@/shared/components/staff-lines/StaffLines";
import { ThemeToggle } from "@/shared/components/theme-toggle/ThemeToggle";

const HIGHLIGHTS = [
    "One library for scores and drafts",
    "Details that stay with the music",
    "Ready wherever you write",
];

/**
 * Layout for the authentication pages.
 */
export const AuthLayout = () => {
    return (
        <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
            <PageAmbient />

            <header className="relative z-10 flex items-center justify-between gap-4 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
                <div className="lg:hidden">
                    <Brand subtitle="Composer workspace" />
                </div>
                <ThemeToggle className="ml-auto" />
            </header>

            <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-7 sm:px-8 sm:py-10">
                <div className="grid w-full max-w-5xl animate-rise overflow-hidden rounded-[26px] border border-border/70 bg-card shadow-2xl shadow-primary/10 lg:min-h-[34rem] lg:grid-cols-[1.05fr_0.95fr]">
                    <aside className="brand-panel relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
                        <StaffLines className="text-white/30" />

                        <div className="relative flex items-center gap-3">
                            <BrandMark className="size-10 rounded-xl" />
                            <div className="flex flex-col">
                                <p className="font-heading text-lg font-semibold leading-none tracking-[-0.02em]">
                                    Studio One
                                </p>
                                <p className="mt-1.5 text-[10px] font-medium uppercase leading-none tracking-[0.2em] text-white/50">
                                    Composer workspace
                                </p>
                            </div>
                        </div>

                        <div className="relative flex flex-col gap-7">
                            <div className="flex flex-col gap-4">
                                <h2 className="max-w-sm font-heading text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-balance">
                                    Your music, in one quiet place.
                                </h2>
                                <p className="max-w-xs text-sm leading-relaxed text-white/65">
                                    A calm home for every score, draft and release — built for the way composers think.
                                </p>
                            </div>

                            <ul className="flex flex-col gap-3">
                                {HIGHLIGHTS.map((highlight) => (
                                    <li key={highlight} className="flex items-center gap-3 text-sm text-white/80">
                                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
                                            <CheckIcon className="size-3" />
                                        </span>
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <p className="relative text-xs leading-relaxed text-white/45">
                            Every score begins with a single line.
                        </p>
                    </aside>

                    <div className="flex items-center p-6 sm:p-10 lg:p-12">
                        <div className="mx-auto w-full max-w-sm">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-xs text-muted-foreground sm:px-8">
                Manage your musical compositions in one place.
            </footer>
        </div>
    );
};

export default AuthLayout;
