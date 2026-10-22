import { cn } from "@/lib/extensions/utils";

interface Props {
    className?: string;
}

/**
 * Soft brand glow used behind full-page layouts.
 */
export const PageAmbient = ({ className }: Props) => {
    return (
        <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
            <div className="absolute -top-48 left-1/2 h-[28rem] w-[min(56rem,110vw)] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />
            <div className="absolute -bottom-56 -right-24 size-96 rounded-full bg-primary/5 blur-[120px]" />
        </div>
    );
};
