/**
 * Transposition for plain chord sheets.
 *
 * Only chord lines are rewritten; lyrics and section headers are never
 * touched. Chord tokens keep their column so the sheet stays aligned above
 * the lyrics when an accidental makes a chord name longer or shorter.
 */

import { isChordLine, parseChordToken } from "./detect";
import { pcToRoot, preferFlatsFor, rootToPc } from "./notes";

/**
 * Transposes a single chord token.
 * @param token Chord as written ("Em7", "C/G").
 * @param semitones How many semitones to move the chord.
 * @param preferFlats True to spell the result with flats (Gb instead of F#).
 * @returns The transposed chord, or null when the token is not a chord.
 */
export const transposeChordToken = (token: string, semitones: number, preferFlats = false): string | null => {
    const parsed = parseChordToken(token);

    if (!parsed)
        return null;

    const rootPitch = rootToPc(parsed.root);

    if (rootPitch === null)
        return null;

    let result = pcToRoot(rootPitch + semitones, preferFlats) + parsed.quality;

    if (parsed.bass) {
        const bassPitch = rootToPc(parsed.bass);

        if (bassPitch !== null)
            result += "/" + pcToRoot(bassPitch + semitones, preferFlats);
    }

    return result;
};

/**
 * Transposes one line of a chord sheet, preserving the column of every chord.
 * @param line Raw line from the chord sheet.
 * @param semitones How many semitones to move the chords.
 * @param preferFlats True to spell the result with flats.
 * @returns The transposed line (lyric lines are returned untouched).
 */
const transposeLine = (line: string, semitones: number, preferFlats: boolean): string => {
    if (!isChordLine(line))
        return line;

    const tokens = [...line.matchAll(/\S+/g)].map((match) => ({ column: match.index, text: match[0] }));
    let result = "";
    let cursor = 0;

    for (const token of tokens) {
        const next = transposeChordToken(token.text, semitones, preferFlats) ?? token.text;
        const column = Math.max(token.column, cursor);

        result += " ".repeat(column - cursor) + next;
        cursor = column + next.length;
    }

    return result;
};

/**
 * Transposes a whole chord sheet. Only chord lines change.
 * @param content Plain text of the chord sheet.
 * @param semitones How many semitones to move the chords.
 * @param preferFlats True to spell the result with flats; derived from the
 * target key by default through {@link transposedKeyUsesFlats}.
 * @returns The transposed sheet.
 */
export const transposeSheet = (content: string, semitones: number, preferFlats?: boolean): string => {
    if (!semitones)
        return content;

    const flats = preferFlats ?? false;

    return content
        .split("\n")
        .map((line) => transposeLine(line, semitones, flats))
        .join("\n");
};

/**
 * Whether the transposed key is written with flats (Bb major, D minor...).
 * @param key Original key label ("G", "Am").
 * @param semitones How many semitones the key moves.
 * @returns True when the resulting key uses flats.
 */
export const transposedKeyUsesFlats = (key: string | undefined, semitones: number): boolean => {
    if (!key)
        return false;

    const minor = key.length > 1 && key.endsWith("m");
    const root = minor ? key.slice(0, -1) : key;
    const pitch = rootToPc(root);

    if (pitch === null)
        return false;

    const target = ((pitch + semitones) % 12 + 12) % 12;

    return preferFlatsFor(target, minor);
};

/**
 * Transposes a key label, keeping the minor marker ("Am" -> "Bm").
 * @param key Original key label.
 * @param semitones How many semitones to move the key.
 * @returns The resulting key label.
 */
export const transposeKey = (key: string, semitones: number): string => {
    if (!semitones)
        return key;

    const minor = key.length > 1 && key.endsWith("m");
    const root = minor ? key.slice(0, -1) : key;
    const pitch = rootToPc(root);

    if (pitch === null)
        return key;

    const target = ((pitch + semitones) % 12 + 12) % 12;

    return pcToRoot(target, preferFlatsFor(target, minor)) + (minor ? "m" : "");
};

/**
 * The key a song actually sounds in when it is played with a capo.
 * The chords stay as written (they describe the hand position); this is only
 * used for display.
 * @param key Key label as written by the user.
 * @param capo Capo fret, 0 when the song is played without one.
 * @returns The sounding key label.
 */
export const soundingKey = (key: string, capo = 0): string => transposeKey(key, capo);
