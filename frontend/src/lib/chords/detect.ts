/**
 * Chord syntax detection for plain chord sheets.
 *
 * A chord sheet is written as: a line of chords directly above the line of
 * lyrics it belongs to, with section headers in brackets ([Intro]). This module
 * decides which lines are chord lines and estimates the key of a song from the
 * chords it uses.
 */

import { preferFlatsForKey, rootToPc } from "./notes";

/** Chord qualities accepted when parsing a token, in normalized form. */
export const CHORD_QUALITIES: readonly string[] = [
    "", "m", "min", "5", "6", "7", "9", "11", "13",
    "maj", "maj7", "maj9", "maj11", "maj13", "6/9", "69",
    "m7", "m9", "m11", "m13", "m6", "m69", "madd9", "mmaj7", "mmaj9", "m7b5",
    "dim", "dim7", "aug", "aug7", "aug9",
    "sus", "sus2", "sus4", "7sus4", "7sus2",
    "add9", "add11", "7b5", "7b9", "7#9", "7#5", "7#11", "9b5", "9#11", "alt",
];

const QUALITY_SET = new Set(CHORD_QUALITIES);
const ROOT_PATTERN = /^([A-G][#b]?)(.*)$/;
const ROOT_TOKEN = /^[A-G][#b]?$/;
const SECTION_HEADER_PATTERN = /^\s*\[([^\]]+)\]\s*$/;

/** A chord token recognized inside a chord line. */
export interface ParsedChord {
    /** Root as written, for example "C" or "F#". */
    root: string;
    /** Quality exactly as written ("m7", "M7", "6/9"...). */
    quality: string;
    /** Canonical form of the quality ("maj7", "m7"...), used for analysis. */
    normalized: string;
    /** Optional bass note of a slash chord ("C/G"). */
    bass?: string;
    /** The original token. */
    raw: string;
}

/**
 * Normalizes the many ways of writing a quality into a canonical value.
 * Examples: "M7" -> "maj7", "Min7" -> "m7", "-7" -> "m7", "+7" -> "aug7".
 * @param raw Quality text found after the root.
 * @returns The canonical quality.
 */
const normalizeQuality = (raw: string): string => {
    if (!raw)
        return "";

    let value = raw;
    const majorMatch = value.match(/^(?:Major|Maj|M)(?=[0-9]|$)(.*)$/);

    if (majorMatch)
        value = "maj" + majorMatch[1];
    else if (value.startsWith("-"))
        value = "m" + value.slice(1);
    else if (value.startsWith("+"))
        value = "aug" + value.slice(1);

    value = value.toLowerCase();

    if (value.startsWith("min"))
        value = "m" + value.slice(3);

    return value;
};

/**
 * Parses a single token as a chord.
 * @param token Candidate token, for example "Em7" or "C/G".
 * @returns The parsed chord or null when the token is not a known chord.
 */
export const parseChordToken = (token: string): ParsedChord | null => {
    if (!token)
        return null;

    let main = token;
    let bass: string | undefined;
    const slashIndex = token.indexOf("/");

    if (slashIndex >= 0) {
        const tail = token.slice(slashIndex + 1);
        // "C/G" is a slash chord; "C6/9" keeps the slash inside the quality.
        if (ROOT_TOKEN.test(tail)) {
            bass = tail;
            main = token.slice(0, slashIndex);
        }
    }

    const match = ROOT_PATTERN.exec(main);

    if (!match)
        return null;

    const normalized = normalizeQuality(match[2]);

    if (!QUALITY_SET.has(normalized))
        return null;

    return { root: match[1], quality: match[2], normalized, bass, raw: token };
};

/**
 * Tells whether a line contains only chords (a chord line).
 * @param line Raw line from the chord sheet.
 * @returns True when every token of the line is a chord.
 */
export const isChordLine = (line: string): boolean => {
    const tokens = line.trim().split(/\s+/).filter(Boolean);

    if (tokens.length === 0 || tokens.length > 24)
        return false;

    return tokens.every((token) => parseChordToken(token) !== null);
};

/**
 * Tells whether a line is a section header such as "[Intro]".
 * @param line Raw line from the chord sheet.
 * @returns True for section headers.
 */
export const isSectionHeader = (line: string): boolean => SECTION_HEADER_PATTERN.test(line);

/**
 * Returns the label of a section header line.
 * @param line Raw line from the chord sheet.
 * @returns The label without brackets, or null for other lines.
 */
export const sectionLabel = (line: string): string | null =>
    line.match(SECTION_HEADER_PATTERN)?.[1] ?? null;

/** How many times a chord is used in a chord sheet. */
export interface ChordUsage {
    /** The chord as written by the user ("Em7"). */
    chord: string;
    /** Times the chord appears on chord lines. */
    count: number;
}

/**
 * Collects every chord used in a chord sheet, ordered by frequency.
 * @param content The plain text of the chord sheet.
 * @returns The chords and their usage count.
 */
export const extractChordUsages = (content: string): ChordUsage[] => {
    const counts = new Map<string, number>();

    for (const line of content.split("\n")) {
        if (!isChordLine(line))
            continue;

        for (const token of line.trim().split(/\s+/)) {
            if (token)
                counts.set(token, (counts.get(token) ?? 0) + 1);
        }
    }

    return [...counts.entries()]
        .map(([chord, count]) => ({ chord, count }))
        .sort((a, b) => b.count - a.count || a.chord.localeCompare(b.chord));
};

/** How sure the key detection is about its result. */
export type KeyConfidence = "high" | "medium" | "low";

/** Result of the automatic key detection. */
export interface KeyDetection {
    /** Detected key label (G, Am...) or null when there are no chords. */
    key: string | null;
    /** Confidence of the guess. */
    confidence: KeyConfidence;
    /** Best candidates, best first. */
    alternatives: string[];
}

interface KeyCandidate {
    label: string;
    pitch: number;
    minor: boolean;
}

const MAJOR_KEY_PITCHES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
/** The 12 major keys, in the order of the circle of fifths' chromatic scale. */
export const MAJOR_KEY_LABELS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

/** The 12 minor keys. */
export const MINOR_KEY_LABELS = ["Cm", "C#m", "Dm", "Ebm", "Em", "Fm", "F#m", "Gm", "Abm", "Am", "Bbm", "Bm"];

const CANDIDATES: KeyCandidate[] = [
    ...MAJOR_KEY_LABELS.map((label, index) => ({ label, pitch: MAJOR_KEY_PITCHES[index], minor: false })),
    ...MINOR_KEY_LABELS.map((label, index) => ({ label, pitch: MAJOR_KEY_PITCHES[index], minor: true })),
];

/** Diatonic functions of a major key, from the tonic. */
const MAJOR_DEGREES = [0, 2, 4, 5, 7, 9, 11];
const MAJOR_FAMILIES = ["maj", "min", "min", "maj", "maj", "min", "dim"] as const;
const MAJOR_WEIGHTS = [3, 1.5, 1.5, 2.5, 2.5, 1.5, 1];

/** Diatonic functions of a natural minor key, from the tonic. */
const MINOR_DEGREES = [0, 2, 3, 5, 7, 8, 10];
const MINOR_FAMILIES = ["min", "dim", "maj", "min", "min", "maj", "maj"] as const;
const MINOR_WEIGHTS = [3, 1, 2, 2.5, 2, 2, 2];

type ChordFamily = "maj" | "min" | "dim" | "dom" | "any";

/**
 * Classifies a quality into its harmonic family.
 * @param quality Normalized quality.
 * @returns The family used by the key detection.
 */
const qualityFamily = (quality: string): ChordFamily => {
    if (quality === "" || quality.startsWith("maj"))
        return "maj";

    if (quality.startsWith("dim") || quality === "m7b5")
        return "dim";

    if (quality.startsWith("m"))
        return "min";

    if (quality.startsWith("7"))
        return "dom";

    return "any";
};

/**
 * How well a chord fits an expected diatonic function.
 * @param expected Family expected on that scale degree.
 * @param actual Family of the chord found in the song.
 * @returns A factor from 0 (wrong) to 1 (exact match).
 */
const familyFactor = (expected: ChordFamily, actual: ChordFamily): number => {
    if (actual === expected)
        return 1;

    if (actual === "any")
        return 0.6;

    if (actual === "dom")
        return expected === "maj" ? 0.85 : 0.6;

    return 0.15;
};

/**
 * Estimates the key of a song from the chords it uses.
 *
 * Every candidate key is scored with diatonic functions (tonic, subdominant
 * and dominant weigh more), chord frequency and whether the song starts and
 * ends on the tonic. Relative keys (G major vs E minor) are genuinely
 * ambiguous, so the result always carries a confidence level.
 * @param content The plain text of the chord sheet.
 * @returns The best key candidate and its confidence.
 */
export const detectKey = (content: string): KeyDetection => {
    const usages = extractChordUsages(content);

    if (usages.length === 0)
        return { key: null, confidence: "low", alternatives: [] };

    const chords = usages
        .map((usage) => {
            const parsed = parseChordToken(usage.chord);
            const pitch = parsed ? rootToPc(parsed.root) : null;

            if (!parsed || pitch === null)
                return null;

            return { pitch, family: qualityFamily(parsed.normalized), count: usage.count };
        })
        .filter((chord): chord is { pitch: number; family: ChordFamily; count: number } => chord !== null);

    const chordLines = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && isChordLine(line));

    const firstToken = chordLines[0]?.split(/\s+/)[0];
    const lastToken = chordLines.at(-1)?.split(/\s+/).at(-1);
    const firstParsed = firstToken ? parseChordToken(firstToken) : null;
    const lastParsed = lastToken ? parseChordToken(lastToken) : null;
    const firstPitch = firstParsed ? rootToPc(firstParsed.root) : null;
    const lastPitch = lastParsed ? rootToPc(lastParsed.root) : null;
    const lastFamily = lastParsed ? qualityFamily(lastParsed.normalized) : "any";

    const scored = CANDIDATES.map((candidate) => {
        const degrees = candidate.minor ? MINOR_DEGREES : MAJOR_DEGREES;
        const families: readonly ChordFamily[] = candidate.minor ? MINOR_FAMILIES : MAJOR_FAMILIES;
        const weights = candidate.minor ? MINOR_WEIGHTS : MAJOR_WEIGHTS;
        let score = 0;

        for (const chord of chords) {
            const degree = (chord.pitch - candidate.pitch + 12) % 12;
            const index = degrees.indexOf(degree);

            if (index >= 0)
                score += chord.count * weights[index] * familyFactor(families[index], chord.family);
            else
                score += chord.count * 0.05;
        }

        if (firstPitch === candidate.pitch)
            score += 3;

        if (lastPitch === candidate.pitch) {
            score += 4;
            score += families[0] === lastFamily ? 1 : 0;
        }

        return { label: candidate.label, score };
    }).sort((a, b) => b.score - a.score);

    const best = scored[0];
    const runnerUp = scored[1];

    if (!best || best.score <= 0)
        return { key: null, confidence: "low", alternatives: [] };

    const margin = runnerUp ? (best.score - runnerUp.score) / best.score : 1;
    const confidence: KeyConfidence = margin >= 0.3 ? "high" : margin >= 0.1 ? "medium" : "low";

    return {
        key: best.label,
        confidence,
        alternatives: scored.slice(0, 3).map((entry) => entry.label),
    };
};

/**
 * Whether a key label uses flats by convention; used to keep transposed
 * chord sheets spelled consistently (Bb instead of A#).
 * @param key Key label such as "G" or "Am".
 * @returns True when the key is written with flats.
 */
export const keyUsesFlats = (key: string): boolean => preferFlatsForKey(key);
