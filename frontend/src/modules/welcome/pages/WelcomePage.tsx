import {
    ListMusicIcon,
    LogOutIcon,
    MusicIcon,
    PenLineIcon,
    Share2Icon,
    SlidersHorizontalIcon,
    SparklesIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";
import { Badge } from "@/shared/shadcn/ui/badge";
import { Button } from "@/shared/shadcn/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/shadcn/ui/card";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { StaffLines } from "@/shared/components/staff-lines/StaffLines";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";

/**
 * Friendly label of the identity provider used to sign in.
 */
const PROVIDER_LABELS: Record<string, string> = {
    "google.com": "Google",
};

const NEXT_STEPS = [
    {
        icon: PenLineIcon,
        title: "Write your first composition",
        description: "Give it a title, a key and a tempo. Everything starts in one place.",
    },
    {
        icon: SlidersHorizontalIcon,
        title: "Organize by instrument",
        description: "Keep parts, tempo and notes attached to the work they belong to.",
    },
    {
        icon: Share2Icon,
        title: "Share it when it is ready",
        description: "Move from private draft to published piece without losing the thread.",
    },
];

/**
 * Returns a greeting based on the local time of day.
 */
const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12)
        return "Good morning";

    if (hour < 18)
        return "Good afternoon";

    return "Good evening";
};

/**
 * Welcome page, displayed right after the user signs in.
 */
export const WelcomePage = () => {
    const { user, logout } = useAuthUser();

    const displayName = user?.displayName ?? user?.email ?? "Composer";
    const firstName = displayName.trim().split(/\s+/)[0] || "Composer";
    const initials = displayName
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const providerLabel = user?.providerId
        ? PROVIDER_LABELS[user.providerId] ?? user.providerId
        : "Google";
    const today = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(new Date());

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="flex animate-rise flex-col gap-10 sm:gap-12">
            <PageTitle
                eyebrow={today}
                title={`${getGreeting()}, ${firstName}.`}
                subtitle="Your studio is ready. Here is what is waiting for you, and what comes next."
                actions={
                    <Badge
                        variant="outline"
                        className="h-8 gap-1.5 rounded-full border-border/80 bg-card px-3.5 text-xs font-medium text-muted-foreground"
                    >
                        <SparklesIcon className="text-primary" />
                        Compositions coming next
                    </Badge>
                }
            />

            <div className="grid gap-5 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListMusicIcon className="text-primary" />
                            Compositions
                        </CardTitle>
                        <CardDescription>
                            Everything you write, in one library.
                        </CardDescription>
                        <CardAction>
                            <Badge variant="secondary" className="rounded-full">
                                In progress
                            </Badge>
                        </CardAction>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col justify-center">
                        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-muted/40 px-6 py-12">
                            <StaffLines className="text-primary/20" />
                            <div className="relative flex flex-col items-center gap-4 text-center">
                                <span className="grid size-12 place-items-center rounded-2xl bg-card shadow-sm ring-1 ring-border">
                                    <MusicIcon className="size-5 text-primary" />
                                </span>
                                <div className="flex flex-col gap-1.5">
                                    <p className="font-heading text-lg font-semibold tracking-[-0.02em]">
                                        No compositions yet
                                    </p>
                                    <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                                        Your scores, drafts and published works will live here.
                                        The compositions module is the next chapter of Studio One.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-primary/40" />
                            Empty library
                        </span>
                        <span>Ready when you are</span>
                    </CardFooter>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Your account</CardTitle>
                        <CardDescription>Profile and session.</CardDescription>
                        <CardAction>
                            <Badge variant="outline" className="rounded-full">
                                {providerLabel}
                            </Badge>
                        </CardAction>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <Avatar size="lg" className="size-12">
                                {user?.photoURL && <AvatarImage src={user.photoURL} alt={displayName} />}
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col gap-1">
                                <p className="truncate font-medium leading-none">
                                    {displayName}
                                </p>
                                {user?.email && (
                                    <p className="truncate text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        <dl className="flex flex-col gap-3 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">Session</dt>
                                <dd className="flex items-center gap-1.5 font-medium">
                                    <span className="size-1.5 rounded-full bg-success" />
                                    Active
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">Sign-in</dt>
                                <dd className="font-medium">{providerLabel}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">Privacy</dt>
                                <dd className="text-xs text-muted-foreground">Password never shared</dd>
                            </div>
                        </dl>
                    </CardContent>

                    <CardFooter>
                        <Button
                            variant="outline"
                            className="h-9 w-full gap-2"
                            onClick={handleLogout}
                        >
                            <LogOutIcon />
                            Sign out
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <section className="flex flex-col gap-5">
                <SectionTitle
                    title="Next steps"
                    description="A short path from an empty studio to a finished piece."
                />

                <ol className="grid gap-4 sm:grid-cols-3">
                    {NEXT_STEPS.map((step, index) => {
                        const Icon = step.icon;

                        return (
                            <li
                                key={step.title}
                                className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 transition-colors hover:border-primary/30"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="font-heading text-xs font-semibold tabular-nums text-muted-foreground/60">
                                        0{index + 1}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="font-medium leading-snug">{step.title}</p>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </section>
        </div>
    );
};
