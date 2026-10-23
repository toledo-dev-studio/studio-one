/**
 * Symbols used by the chord library: which roots and qualities are available
 * and how they map to the chords-db dataset that feeds the diagrams.
 */

import qualities from "./qualities.json";

/** A chord quality offered by the chord library. */
export interface ChordQuality {
    /** Stable identifier used in code. */
    id: string;
    /** Text appended to the root to build the symbol ("" for major). */
    label: string;
    /** Suffix used by the chords-db dataset. */
    dbSuffix: string;
}

/** Qualities available in the library, in display order. */
export const CHORD_QUALITY_CATALOG: ChordQuality[] = qualities;

/**
 * Roots shown by the library in chromatic order, including every alteration
 * (C#, Db, D#, Eb...) so users can find the chord the way they write it.
 */
export const LIBRARY_ROOTS = [
    "C", "C#", "Db", "D", "D#", "Eb", "E",
    "F", "F#", "Gb", "G", "G#", "Ab", "A",
    "A#", "Bb", "B",
] as const;

/**
 * chords-db stores its dataset under a fixed set of key names where the sharp
 * spellings are written as Csharp/Fsharp and flats map to the enharmonic key.
 */
const DB_KEY_BY_ROOT: Record<string, string> = {
    C: "C",
    "C#": "Csharp",
    Db: "C",
    D: "D",
    "D#": "Eb",
    Eb: "Eb",
    E: "E",
    F: "F",
    "F#": "Fsharp",
    Gb: "Fsharp",
    G: "G",
    "G#": "Ab",
    Ab: "Ab",
    A: "A",
    "A#": "Bb",
    Bb: "Bb",
    B: "B",
};

/**
 * Resolves the chords-db key that holds the shapes of a root.
 * @param root Root as displayed by the library ("Db").
 * @returns The dataset key ("C").
 */
export const toChordsDbKey = (root: string): string => DB_KEY_BY_ROOT[root] ?? root;

/** A finger position on the fretboard, straight from the dataset. */
export interface ChordVoicing {
    /** Frets per string from low E to high e: -1 muted, 0 open, 1+ relative to baseFret. */
    frets: number[];
    /** Finger numbers (1-4) per string; 0 when no finger presses the string. */
    fingers: number[];
    /** Frets played as a barre, relative to baseFret. */
    barres: number[];
    /** First fret shown by the diagram. */
    baseFret: number;
}

/** Chord shapes per chords-db key and suffix. */
export type GuitarChordBook = Record<string, Record<string, ChordVoicing>>;
