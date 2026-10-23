import { useEffect, useRef } from "react";
import { SVGuitarChord, type Chord as SVGuitarChordData, type Finger } from "svguitar";

import type { ChordVoicing } from "@/lib/chords/symbols";
import { cn } from "@/lib/extensions/utils";

interface Props {
    /** Fret position of the chord, straight from the dataset. */
    voicing: ChordVoicing;
    /** Title drawn above the diagram; omit for compact diagrams. */
    title?: string;
    /** Accessible name; falls back to the title or "chord diagram". */
    label?: string;
    className?: string;
}

/**
 * Converts a dataset voicing into the svguitar shape.
 * chords-db numbers the strings from low E (index 0) to high e (index 5) and
 * uses -1 for muted strings; svguitar numbers strings 1 (high e) to 6 (low E)
 * and expects "x" for muted strings. Fret values are relative to `baseFret`
 * in both, so they are passed through unchanged.
 */
const toSvguitarShape = (voicing: ChordVoicing): SVGuitarChordData => {
    const fingers: Finger[] = voicing.frets.map((fret, index) => {
        const string = 6 - index;
        const value = fret === -1 ? "x" : Math.max(fret, 0);
        const finger = voicing.fingers[index] ?? 0;
        const pressed = value !== 0 && value !== "x";

        return finger > 0 && pressed ? [string, value, String(finger)] : [string, value];
    });

    const barres = voicing.barres
        .map((fret) => {
            const strings = voicing.frets
                .map((value, index) => (value === fret && fret > 0 ? 6 - index : null))
                .filter((value): value is number => value !== null);

            if (strings.length < 2)
                return null;

            return { fromString: Math.min(...strings), toString: Math.max(...strings), fret };
        })
        .filter((barre): barre is NonNullable<typeof barre> => barre !== null);

    return {
        fingers,
        barres,
        position: voicing.baseFret,
    };
};

/**
 * Renders a guitar chord diagram as SVG (no image assets).
 * Colors come from CSS variables so the diagram follows the light/dark theme.
 */
export const ChordDiagram = ({ voicing, title, label, className }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container)
            return;

        container.replaceChildren();

        new SVGuitarChord(container)
            .configure({
                title,
                strings: 6,
                frets: 4,
                showFretMarkers: false,
                color: "currentColor",
                titleColor: "currentColor",
                fingerColor: "var(--primary)",
                fingerTextColor: "var(--primary-foreground)",
                strokeWidth: 2,
                nutWidth: 5,
                emptyStringIndicatorSize: 0.35,
            })
            .chord(toSvguitarShape(voicing))
            .draw();

        return () => container.replaceChildren();
    }, [voicing, title]);

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label={label ?? title ?? "Chord diagram"}
            className={cn("text-foreground", className)}
        />
    );
};
