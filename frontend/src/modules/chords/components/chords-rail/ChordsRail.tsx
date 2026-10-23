import { useState } from "react";

import { Music2Icon, PanelRightCloseIcon } from "lucide-react";

import { Button } from "@/shared/shadcn/ui/button";
import { cn } from "@/lib/extensions/utils";
import { LibraryPanel } from "./LibraryPanel";
import { SongChordsPanel } from "./SongChordsPanel";

interface Props {
    /** Current text of the chord sheet. */
    content: string;
    /** Inserts the chord where the cursor is. */
    onInsert: (chord: string) => void;
    className?: string;
}

type PanelTab = "song" | "library";

const COLLAPSED_KEY = "studio-one:chords-rail:collapsed";
const TAB_KEY = "studio-one:chords-rail:tab";

const readStorage = (key: string): string | null => {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};

const writeStorage = (key: string, value: string): void => {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Storage can be unavailable (private mode); the panel still works.
    }
};

/**
 * Right rail of the editor with two panels: the chords of the song being
 * written and the full chord library. The rail can be hidden and remembers
 * the last open panel.
 */
export const ChordsRail = ({ content, onInsert, className }: Props) => {
    const [collapsed, setCollapsed] = useState(() => readStorage(COLLAPSED_KEY) === "1");
    const [tab, setTab] = useState<PanelTab>(() =>
        readStorage(TAB_KEY) === "library" ? "library" : "song"
    );

    const collapse = () => {
        writeStorage(COLLAPSED_KEY, "1");
        setCollapsed(true);
    };

    const expand = () => {
        writeStorage(COLLAPSED_KEY, "0");
        setCollapsed(false);
    };

    const selectTab = (next: PanelTab) => {
        writeStorage(TAB_KEY, next);
        setTab(next);
    };

    if (collapsed)
        return (
            <div className={cn("flex justify-center lg:justify-end", className)}>
                <Button variant="outline" size="sm" onClick={expand}>
                    <Music2Icon />
                    Chords panel
                </Button>
            </div>
        );

    return (
        <aside
            aria-label="Chords panels"
            className={cn("flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs", className)}
        >
            <div className="flex items-center justify-between gap-2 border-b border-border/70 p-2">
                <div className="flex rounded-lg bg-muted p-0.5" role="tablist" aria-label="Chord panels">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === "song"}
                        onClick={() => selectTab("song")}
                        className={cn(
                            "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                            tab === "song"
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        In this song
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={tab === "library"}
                        onClick={() => selectTab("library")}
                        className={cn(
                            "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                            tab === "library"
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Library
                    </button>
                </div>

                <Button variant="ghost" size="icon-xs" onClick={collapse} aria-label="Hide chords panel">
                    <PanelRightCloseIcon />
                </Button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-3 lg:max-h-[calc(100dvh-14rem)]">
                {tab === "song" ? (
                    <SongChordsPanel content={content} onInsert={onInsert} />
                ) : (
                    <LibraryPanel onInsert={onInsert} />
                )}
            </div>
        </aside>
    );
};
