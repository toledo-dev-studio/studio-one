/**
 * Pitch helpers shared by the chord detection and transposition utilities.
 *
 * Roots are written like chord symbols: C, C#, Db, Eb... The library never
 * changes how the user writes a chord unless they explicitly transpose it.
 */

/** Note names indexed by pitch class, in sharp spelling. */
const SHARP_ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

/** Note names indexed by pitch class, in flat spelling. */
const FLAT_ROOTS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;

/** Every root spelling accepted by the chord syntax, mapped to its pitch class. */
const PITCH_BY_ROOT: Record<string, number> = {
    C: 0,
    "B#": 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    Fb: 4,
    "E#": 5,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
    Cb: 11,
};

/**
 * Keys written with flats by convention, keyed by pitch class plus "m" for
 * minor keys (for example "1" = Db major, "2m" = D minor).
 */
const FLAT_KEYS = new Set(["1", "3", "5", "8", "10", "2m", "3m", "5m", "7m", "8m", "10m"]);

/**
 * Converts a chord root into its pitch class.
 * @param root Root such as "C", "F#" or "Bb".
 * @returns The pitch class (0-11) or null when the root is not recognized.
 */
export const rootToPc = (root: string): number | null => PITCH_BY_ROOT[root] ?? null;

/**
 * Converts a pitch class back into a note name.
 * @param pitch Any integer; it is wrapped into the 0-11 range.
 * @param preferFlats True to spell accidentals with flats (Db instead of C#).
 * @returns The note name.
 */
export const pcToRoot = (pitch: number, preferFlats: boolean): string => {
    const index = ((pitch % 12) + 12) % 12;
    return (preferFlats ? FLAT_ROOTS : SHARP_ROOTS)[index];
};

/**
 * Whether a key is written with flats by convention (Db major, D minor...).
 * @param pitch Pitch class of the key root.
 * @param minor True when the key is minor.
 * @returns True when flats are the usual spelling.
 */
export const preferFlatsFor = (pitch: number, minor: boolean): boolean =>
    FLAT_KEYS.has(`${pitch}${minor ? "m" : ""}`);

/**
 * Whether a key label such as "G" or "Bbm" is written with flats.
 * @param key Key label; minor keys end with "m" (Am, F#m).
 * @returns True when flats are the usual spelling for that key.
 */
export const preferFlatsForKey = (key: string): boolean => {
    const minor = key.length > 1 && key.endsWith("m");
    const root = minor ? key.slice(0, -1) : key;
    const pitch = rootToPc(root);

    return pitch === null ? false : preferFlatsFor(pitch, minor);
};
