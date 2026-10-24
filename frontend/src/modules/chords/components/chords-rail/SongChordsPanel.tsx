import { useMemo, useState } from "react";

import { SearchIcon } from "lucide-react";

import { extractChordUsages } from "@/lib/chords/detect";
import { resolveSongChords } from "@/lib/chords/resolve";
import { Spinner } from "@/shared/components/spinner/Spinner";
import { useChordBook } from "../../hooks/use-chord-book";
import { ChordCell } from "./ChordCell";

interface Props {
    /** Current text of the chord sheet (serialized from the editor). */
    content: string;
    /** Inserts the chord where the cursor is. */
    onInsert: (chord: string) => void;
}

/**
 * Chords used by the song being edited, each drawn with its fretboard diagram
 * exactly like the library panel. Spellings of the same chord are merged, so a
 * sheet writing both "Bb" and "A#" shows a single cell. The list updates while
 * the user writes and clicking a chord inserts it at the cursor.
 */
export const SongChordsPanel = ({ content, onInsert }: Props) => {
    const { book, failed } = useChordBook();
    const usages = useMemo(() => extractChordUsages(content), [content]);
    const chords = useMemo(() => resolveSongChords(book, usages), [book, usages]);
    const [search, setSearch] = useState("");

    const term = search.trim().toLowerCase();
    const filtered = term
        ? chords.filter((chord) => chord.variants.some((variant) => variant.toLowerCase().includes(term)))
        : chords;

    if (failed)
        return (
            <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-5 text-center text-xs leading-relaxed text-warning">
                The chord book could not be loaded. Try again later.
            </p>
        );

    // Without the dataset every chord would render as a bare symbol and then
    // swap for its diagram, so the grid waits for it like the library does.
    if (!book)
        return (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-5 text-xs text-muted-foreground">
                <Spinner variant="foreground" />
                Loading chord book…
            </div>
        );

    if (chords.length === 0)
        return (
            <p className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-xs leading-relaxed text-muted-foreground">
                The chords you write in the sheet will be listed here.
            </p>
        );

    return (
        <div className="flex flex-col gap-3">
            <label className="relative block">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Filter chords"
                    aria-label="Filter chords of this song"
                    className="h-8 w-full rounded-md border border-input bg-background pr-2.5 pl-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                />
            </label>

            {filtered.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">
                    No chord matches “{search.trim()}”.
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {filtered.map((chord) => (
                        <ChordCell
                            key={chord.key}
                            symbol={chord.symbol}
                            voicing={chord.voicing}
                            onInsert={onInsert}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
