import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";

import { transposeKey } from "@/lib/chords/transpose";
import { Button } from "@/shared/shadcn/ui/button";
import { cn } from "@/lib/extensions/utils";

interface Props {
    /** Key as written by the user; without it there is nothing to transpose. */
    originalKey?: string;
    /** Current offset in semitones. */
    semitones: number;
    onChange: (semitones: number) => void;
    className?: string;
}

/**
 * Transposition control. It only changes what is displayed: the saved key and
 * the chords written by the user are never modified by moving it.
 */
export const TransposeBar = ({ originalKey, semitones, onChange, className }: Props) => {
    const disabled = !originalKey;
    const label = originalKey ? transposeKey(originalKey, semitones) : "—";

    return (
        <div className={cn("inline-flex items-center gap-0.5 rounded-lg border border-border bg-card p-1", className)}>
            <Button
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                onClick={() => onChange(semitones - 1)}
                aria-label="Transpose down a semitone"
                title={disabled ? "Set a key first to transpose" : "Down a semitone"}
            >
                <MinusIcon />
            </Button>

            <span className="min-w-28 px-1 text-center">
                <span className="block text-sm leading-tight font-semibold text-foreground">
                    Key: {label}
                </span>
                {semitones !== 0 && originalKey && (
                    <span className="block text-[11px] leading-tight text-muted-foreground">
                        was {originalKey}
                    </span>
                )}
            </span>

            <Button
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                onClick={() => onChange(semitones + 1)}
                aria-label="Transpose up a semitone"
                title={disabled ? "Set a key first to transpose" : "Up a semitone"}
            >
                <PlusIcon />
            </Button>

            {semitones !== 0 && (
                <Button variant="ghost" size="xs" onClick={() => onChange(0)}>
                    <RotateCcwIcon />
                    Reset
                </Button>
            )}
        </div>
    );
};
