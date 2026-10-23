import { useMemo } from "react";

import { isChordLine, isSectionHeader, sectionLabel } from "@/lib/chords/detect";
import { transposedKeyUsesFlats, transposeSheet } from "@/lib/chords/transpose";
import { cn } from "@/lib/extensions/utils";

interface Props {
    /** Plain text of the chord sheet. */
    content: string;
    /** Transposition offset in semitones; 0 shows the sheet as written. */
    semitones?: number;
    /** Key used to pick the spelling (sharps/flats) of transposed chords. */
    originalKey?: string;
    className?: string;
}

/**
 * Read-only renderer of a chord sheet: section headers become labels, chord
 * lines are highlighted and everything keeps its column alignment.
 * The sheet scrolls horizontally on small screens instead of wrapping, which
 * would break the chord/lyric alignment.
 */
export const ChordSheet = ({ content, semitones = 0, originalKey, className }: Props) => {
    const text = useMemo(
        () => transposeSheet(content, semitones, transposedKeyUsesFlats(originalKey, semitones)),
        [content, semitones, originalKey]
    );

    if (!text.trim())
        return null;

    return (
        <div
            className={cn(
                "overflow-x-auto rounded-xl border border-border/70 bg-card p-4 font-mono text-[13px] leading-6 sm:p-6 sm:text-sm sm:leading-7",
                className
            )}
        >
            {text.split("\n").map((line, index) => {
                if (isSectionHeader(line))
                    return (
                        <div key={index} className="mt-5 flex items-center gap-2 first:mt-0">
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                {sectionLabel(line)}
                            </span>
                            <span aria-hidden className="h-px flex-1 bg-border/70" />
                        </div>
                    );

                if (!line.trim())
                    return <div key={index} className="h-3" aria-hidden />;

                return (
                    <div
                        key={index}
                        className={cn(
                            "whitespace-pre text-foreground",
                            isChordLine(line) && "font-semibold text-primary"
                        )}
                    >
                        {line}
                    </div>
                );
            })}
        </div>
    );
};
