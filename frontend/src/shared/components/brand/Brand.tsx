import { Music2Icon } from "lucide-react";

import { cn } from "@/lib/extensions/utils";

interface BrandMarkProps {
    className?: string;
    iconClassName?: string;
}

/**
 * The Studio One mark: a gradient tile with a musical note.
 */
export const BrandMark = ({ className, iconClassName }: BrandMarkProps) => {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "brand-mark grid size-9 shrink-0 place-items-center rounded-[11px] text-white shadow-sm ring-1 ring-white/20",
                className
            )}
        >
            <Music2Icon className={cn("size-5", iconClassName)} strokeWidth={2.2} />
        </span>
    );
};

interface BrandProps {
    className?: string;
    subtitle?: string;
    subtitleClassName?: string;
    markClassName?: string;
}

/**
 * Brand lockup used by the app chrome and the auth screen.
 */
export const Brand = ({ className, subtitle, subtitleClassName, markClassName }: BrandProps) => {
    return (
        <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
            <BrandMark className={markClassName} />
            <span className="flex min-w-0 flex-col">
                <span className="truncate font-heading text-[15px] font-semibold leading-none tracking-[-0.02em]">
                    Studio One
                </span>
                {subtitle && (
                    <span className={cn(
                        "mt-1 truncate text-[10px] font-medium uppercase leading-none tracking-[0.18em] text-muted-foreground",
                        subtitleClassName
                    )}>
                        {subtitle}
                    </span>
                )}
            </span>
        </span>
    );
};
