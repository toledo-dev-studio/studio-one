import { useState } from "react";
import { LockKeyholeIcon } from "lucide-react";

import { Button } from "@/shared/shadcn/ui/button";
import { CardAlert } from "@/shared/components/card-alert/CardAlert";
import { Spinner } from "@/shared/components/spinner/Spinner";
import { FIREBASE_NOT_CONFIGURED_MESSAGE, IS_FIREBASE_CONFIGURED } from "@/lib/constants/environment.constants";
import { useAuthUser } from "../../hooks/useAuthUser";

/**
 * Official Google mark, used in the sign in button.
 */
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.93l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.76-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.29 14.26A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.55.38-2.26v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.47 3.77 1.28 5.36l3.99-3.1Z" />
        <path fill="#EA4335" d="M12 4.79c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.64l4.01 3.1C6.24 6.9 8.88 4.79 12 4.79Z" />
    </svg>
);

/**
 * Sign in page. Google is the only available provider.
 */
export const LoginPage = () => {
    const { signInWithGoogle } = useAuthUser();
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSignIn = async () => {
        setIsSigningIn(true);

        try {
            await signInWithGoogle();
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-2.5">
                <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Sign in
                </p>
                <h1 className="font-heading text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.035em] text-balance sm:text-3xl">
                    Welcome to Studio One
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Use your Google account to open your studio. No new password to remember.
                </p>
            </div>

            {
                !IS_FIREBASE_CONFIGURED && (
                    <CardAlert
                        type="warning"
                        title="Firebase is not configured"
                        message={FIREBASE_NOT_CONFIGURED_MESSAGE}
                    />
                )
            }

            <div className="flex flex-col gap-4">
                <Button
                    variant="outline"
                    className="h-11 w-full gap-3 rounded-xl border-border bg-background px-4 text-[15px] font-medium shadow-xs hover:bg-muted"
                    disabled={isSigningIn || !IS_FIREBASE_CONFIGURED}
                    onClick={handleSignIn}
                >
                    {isSigningIn ? <Spinner variant="foreground" /> : <GoogleIcon />}
                    {isSigningIn ? "Waiting for Google..." : "Continue with Google"}
                </Button>

                <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                    <LockKeyholeIcon className="mt-0.5 size-3.5 shrink-0" />
                    Studio One only uses Google to sign in. We never see your Google password.
                </p>
            </div>
        </div>
    );
};
