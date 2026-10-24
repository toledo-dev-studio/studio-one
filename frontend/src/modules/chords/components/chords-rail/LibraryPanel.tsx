import { useMemo, useState } from "react";

import { ChevronDownIcon, SearchIcon, TriangleAlertIcon } from "lucide-react";

import {
    CHORD_QUALITY_CATALOG,
    LIBRARY_ROOTS,
    toChordsDbKey,
    type ChordVoicing,
    type GuitarChordBook,
} from "@/lib/chords/symbols";
import { Spinner } from "@/shared/components/spinner/Spinner";
import { Button } from "@/shared/shadcn/ui/button";
import { useChordBook } from "../../hooks/use-chord-book";
import { ChordCell } from "./ChordCell";

/** How many chords are shown before the user asks for more. */
const PAGE_SIZE = 10;

interface LibraryEntry {
    symbol: string;
    voicing?: ChordVoicing;
}

/**
 * Builds the full catalog: every root (including every alteration) crossed
 * with every quality of the catalog, in display order.
 */
const buildEntries = (book: GuitarChordBook | null): LibraryEntry[] => {
    if (!book)
        return [];

    const entries: LibraryEntry[] = [];

    for (const root of LIBRARY_ROOTS) {
        const shapes = book[toChordsDbKey(root)] ?? {};

        for (const quality of CHORD_QUALITY_CATALOG) {
            const voicing = shapes[quality.dbSuffix];

            entries.push({ symbol: root + quality.label, voicing });
        }
    }

    return entries;
};

interface Props {
    /** Inserts the chord symbol where the cursor is. */
    onInsert: (chord: string) => void;
}

/**
 * Library of all available chords with their fretboard diagram, filterable by
 * symbol. The dataset is loaded lazily the first time the panel opens and
 * shown in pages of ten chords.
 */
export const LibraryPanel = ({ onInsert }: Props) => {
    const { book, failed } = useChordBook();
    const [search, setSearch] = useState("");
    const [visible, setVisible] = useState(PAGE_SIZE);

    const entries = useMemo(() => buildEntries(book), [book]);
    const term = search.trim().toLowerCase();
    const filtered = useMemo(
        () => (term ? entries.filter((entry) => entry.symbol.toLowerCase().includes(term)) : entries),
        [entries, term]
    );
    const shown = filtered.slice(0, visible);

    if (failed)
        return (
            <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-3 text-xs leading-relaxed text-warning">
                <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                The chord book could not be loaded. Try again later.
            </div>
        );

    if (!book)
        return (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-5 text-xs text-muted-foreground">
                <Spinner variant="foreground" />
                Loading chord book…
            </div>
        );

    return (
        <div className="flex flex-col gap-3">
            <label className="relative block">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setVisible(PAGE_SIZE);
                    }}
                    placeholder="Search chords (Cmaj7, Bb...)"
                    aria-label="Search chords in the library"
                    className="h-8 w-full rounded-md border border-input bg-background pr-2.5 pl-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                />
            </label>

            {filtered.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">
                    No chord matches “{search.trim()}”.
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {shown.map((entry) => (
                        <ChordCell
                            key={entry.symbol}
                            symbol={entry.symbol}
                            voicing={entry.voicing ?? null}
                            onInsert={onInsert}
                            disabled={!entry.voicing}
                        />
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <p className="text-center text-[11px] text-muted-foreground">
                    Showing {shown.length} of {filtered.length}
                </p>

                {visible < filtered.length && (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                        Load more
                        <ChevronDownIcon />
                    </Button>
                )}
            </div>
        </div>
    );
};
