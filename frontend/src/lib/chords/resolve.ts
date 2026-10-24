/**
 * Resolves the chords written in a chord sheet against the chord dataset, and
 * merges the different ways of writing the same chord.
 *
 * The sheet keeps the tokens exactly as the user typed them ("CM7", "A#m",
 * "C/G"), while the dataset is keyed by root and quality. This module maps one
 * onto the other and groups spellings that are really the same chord.
 */

import { parseChordToken, type ChordUsage } from "./detect";
import {
    CHORD_QUALITY_CATALOG,
    toChordsDbKey,
    type ChordVoicing,
    type GuitarChordBook,
} from "./symbols";

/** A chord of the sheet, with every spelling that produced it merged. */
export interface ResolvedChord {
    /** Identity of the chord; equal keys mean the same chord. */
    key: string;
    /** Symbol shown to the user and inserted on click. */
    symbol: string;
    /** Every spelling found in the sheet, so the filter can match any of them. */
    variants: string[];
    /** Uses counted across every spelling. */
    count: number;
    /** Diagram shape, or null when the dataset has no shape for it. */
    voicing: ChordVoicing | null;
}

/**
 * Finds the catalog entry of a normalized quality.
 * The detector writes the major chord as "" and the six-nine chord as "6/9",
 * while the catalog identifies them as "maj" and "69", so the label is used
 * as a fallback after the id.
 * @param normalized Quality as produced by the detector.
 * @returns The catalog entry, or null when the library does not offer it.
 */
const findQuality = (normalized: string) =>
    CHORD_QUALITY_CATALOG.find((quality) => quality.id === normalized)
    ?? CHORD_QUALITY_CATALOG.find((quality) => quality.label === normalized)
    ?? null;

/**
 * Identity of a chord token, stable across spellings.
 * Enharmonic roots ("A#" / "Bb") and bass notes are canonicalized through the
 * dataset keys, so they collapse into one chord, while a slash chord ("C/G")
 * stays distinct from its base chord ("C") even though both share a diagram.
 * @param root Root as written by the user.
 * @param normalized Quality as produced by the detector.
 * @param bass Bass note of a slash chord, if any.
 * @returns The grouping key.
 */
const chordKey = (root: string, normalized: string, bass?: string): string =>
    `${toChordsDbKey(root)}:${findQuality(normalized)?.id ?? normalized}:${bass ? toChordsDbKey(bass) : ""}`;

/**
 * Resolves one chord token against the dataset.
 * @param book The chord dataset; may be null while it loads.
 * @param chord The token as written in the sheet.
 * @returns The chord with its identity and shape, or null when unparseable.
 */
export const resolveChord = (
    book: GuitarChordBook | null,
    chord: string
): { key: string; symbol: string; voicing: ChordVoicing | null } | null => {
    const parsed = parseChordToken(chord);

    if (!parsed)
        return null;

    const quality = findQuality(parsed.normalized);
    const voicing = quality
        ? book?.[toChordsDbKey(parsed.root)]?.[quality.dbSuffix] ?? null
        : null;

    return {
        key: chordKey(parsed.root, parsed.normalized, parsed.bass),
        symbol: chord,
        voicing,
    };
};

/**
 * Groups the chords of a sheet, merging the spellings of the same chord.
 * @param book The chord dataset; may be null while it loads.
 * @param usages Chords of the sheet with their usage count.
 * @returns One entry per distinct chord, most used first.
 */
export const resolveSongChords = (
    book: GuitarChordBook | null,
    usages: ChordUsage[]
): ResolvedChord[] => {
    const groups = new Map<string, { symbolCounts: Map<string, number>; voicing: ChordVoicing | null }>();

    for (const usage of usages) {
        const resolved = resolveChord(book, usage.chord);

        if (!resolved)
            continue;

        const group = groups.get(resolved.key) ?? { symbolCounts: new Map<string, number>(), voicing: resolved.voicing };
        group.symbolCounts.set(usage.chord, (group.symbolCounts.get(usage.chord) ?? 0) + usage.count);
        // The first spelling that carries a shape wins, so a chord grouped
        // before the dataset loaded still gets its diagram.
        group.voicing ??= resolved.voicing;
        groups.set(resolved.key, group);
    }

    return [...groups.entries()]
        .map(([key, group]) => {
            // Most frequent spelling wins; ties break alphabetically so the
            // panel always renders the same symbol for the same sheet.
            const spellings = [...group.symbolCounts.entries()]
                .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
            const symbol = spellings[0][0];

            return {
                key,
                symbol,
                variants: spellings.map(([spelling]) => spelling),
                count: spellings.reduce((total, [, uses]) => total + uses, 0),
                voicing: group.voicing,
            };
        })
        .sort((a, b) => b.count - a.count || a.symbol.localeCompare(b.symbol));
};
