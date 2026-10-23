import { useMemo, useState } from "react";

import { PlusIcon, SearchIcon } from "lucide-react";

import { extractChordUsages } from "@/lib/chords/detect";

interface Props {
    /** Current text of the chord sheet (serialized from the editor). */
    content: string;
    /** Inserts the chord where the cursor is. */
    onInsert: (chord: string) => void;
}

/**
 * Chords used by the song being edited, with their frequency. The list updates
 * while the user writes and clicking a chord inserts it at the cursor.
 */
export const SongChordsPanel = ({ content, onInsert }: Props) => {
    const usages = useMemo(() => extractChordUsages(content), [content]);
    const [search, setSearch] = useState("");

    const term = search.trim().toLowerCase();
    const filtered = term
        ? usages.filter((usage) => usage.chord.toLowerCase().includes(term))
        : usages;

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

            {usages.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-xs leading-relaxed text-muted-foreground">
                    The chords you write in the sheet will be listed here.
                </p>
            ) : filtered.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">
                    No chord matches “{search.trim()}”.
                </p>
            ) : (
                <ul className="flex flex-col gap-0.5">
                    {filtered.map((usage) => (
                        <li key={usage.chord}>
                            <button
                                type="button"
                                onClick={() => onInsert(usage.chord)}
                                className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted"
                                title={`Insert ${usage.chord}`}
                            >
                                <span className="font-mono text-sm font-semibold text-foreground">
                                    {usage.chord}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    ×{usage.count}
                                    <PlusIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {usages.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                    {usages.length} {usages.length === 1 ? "chord" : "chords"} in this sheet
                    {" "}· click to insert
                </p>
            )}
        </div>
    );
};
