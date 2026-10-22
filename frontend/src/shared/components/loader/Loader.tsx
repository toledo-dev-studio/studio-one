import { cn } from "@/lib/extensions/utils";

interface Props {
    title: string;
    subtitle?: string;
    fullScreen?: boolean;
    size?: "default" | "sm";
    className?: string;
}

export const Loader = ({ title, subtitle, fullScreen = true, size = "default", className }: Props) => {
    return (
        <div className={cn(
            "h-full w-full flex items-center justify-center text-center z-100 bg-card",
            fullScreen && "absolute",
            className
        )}>
            <div className="flex flex-col items-center">
                <div className={cn(
                    "animate-spin rounded-full border-3 border-primary border-t-transparent h-10 w-10",
                    size === "sm" && "h-6 w-6",
                )}></div>
                <p className={cn("text-lg font-medium mt-6", size === "sm" && "text-md")}>{title}</p>
                {subtitle && <p className={cn("text-md text-muted-foreground", size === "sm" && "text-sm")}>{subtitle}</p>}
            </div>
        </div>
    );
};
