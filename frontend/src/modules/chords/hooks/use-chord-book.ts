import { useEffect, useState } from "react";

import type { GuitarChordBook } from "@/lib/chords/symbols";

/** State of the chord dataset shared by both rail panels. */
interface ChordBookState {
    /** The dataset, or null while it is still loading. */
    book: GuitarChordBook | null;
    /** True when the dataset could not be loaded. */
    failed: boolean;
}

/**
 * Module-level cache so every panel shares one import of the dataset. The
 * bundle is split by the dynamic import and downloaded at most once per page
 * load, even when both tabs mount in sequence.
 */
let cachedBook: GuitarChordBook | null = null;
let cachedFailure = false;
let pending: Promise<GuitarChordBook> | null = null;

const loadBook = (): Promise<GuitarChordBook> => {
    if (cachedBook)
        return Promise.resolve(cachedBook);

    if (cachedFailure)
        return Promise.reject(new Error("The chord book could not be loaded."));

    pending ??= import("@/lib/chords/guitar-chords.json")
        .then((module) => {
            cachedBook = (module.default ?? module) as unknown as GuitarChordBook;
            return cachedBook;
        })
        .catch((error: unknown) => {
            cachedFailure = true;
            pending = null;
            throw error;
        });

    return pending;
};

/**
 * Lazily loads the chord dataset used to draw the fretboard diagrams.
 * Both the "In this song" and the "Library" panels use it, so the dataset is
 * fetched and parsed once for the whole page.
 * @returns The dataset plus its loading and failure flags.
 */
export const useChordBook = (): ChordBookState => {
    const [state, setState] = useState<ChordBookState>({
        book: cachedBook,
        failed: cachedFailure,
    });

    useEffect(() => {
        if (state.book || state.failed)
            return;

        let active = true;

        loadBook()
            .then((book) => {
                if (active)
                    setState({ book, failed: false });
            })
            .catch(() => {
                if (active)
                    setState({ book: null, failed: true });
            });

        return () => {
            active = false;
        };
    }, [state.book, state.failed]);

    return state;
};
