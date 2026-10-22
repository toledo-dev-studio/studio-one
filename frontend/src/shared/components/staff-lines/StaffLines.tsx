import { cn } from "@/lib/extensions/utils";

interface Props {
    className?: string;
}

/**
 * Decorative five-line staff used on brand surfaces and empty states.
 */
export const StaffLines = ({ className }: Props) => {
    return (
        <svg
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-0 size-full", className)}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            {[12, 44, 76].map((start) => (
                <g key={start}>
                    {Array.from({ length: 5 }).map((_, line) => (
                        <line
                            key={line}
                            x1="0"
                            x2="100"
                            y1={start + line * 3}
                            y2={start + line * 3}
                            stroke="currentColor"
                            strokeWidth="0.15"
                            strokeOpacity="0.55"
                            vectorEffect="non-scaling-stroke"
                        />
                    ))}
                </g>
            ))}
        </svg>
    );
};
