import { InfoIcon, TriangleAlertIcon } from "lucide-react";

import { cn } from "@/lib/extensions/utils";

interface Props {
    type?: "info" | "warning";
    title: string;
    message: string;
}

/**
 * Inline notice used to explain the state of the application (for example,
 * when the Firebase configuration is missing).
 */
export const CardAlert = ({ type = "info", title, message }: Props) => {
    const isWarning = type === "warning";

    return (
        <div
            role="status"
            className={cn(
                "flex items-start gap-3 rounded-xl border p-3.5",
                isWarning
                    ? "border-warning/30 bg-warning/10"
                    : "border-primary/20 bg-primary/5"
            )}
        >
            <span className={cn(
                "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full",
                isWarning ? "bg-warning/15 text-warning" : "bg-primary/10 text-primary"
            )}>
                {isWarning
                    ? <TriangleAlertIcon className="size-3.5" />
                    : <InfoIcon className="size-3.5" />}
            </span>
            <div className="flex flex-col gap-1">
                <p className="text-[13px] font-semibold leading-none text-foreground">
                    {title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {message}
                </p>
            </div>
        </div>
    );
};
