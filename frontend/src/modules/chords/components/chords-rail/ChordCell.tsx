import { ChordDiagram } from "../chord-diagram/ChordDiagram";
import type { ChordVoicing } from "@/lib/chords/symbols";

interface Props {
    /** Symbol displayed and inserted on click. */
    symbol: string;
    /** Diagram shape; when missing, the cell shows the symbol instead. */
    voicing: ChordVoicing | null;
    /** Inserts the chord where the cursor is. */
    onInsert: (symbol: string) => void;
    /** Renders the cell inert, used by the library for shapes it cannot draw. */
    disabled?: boolean;
}

/**
 * One chord of the right rail: its fretboard diagram with the symbol below.
 * Both the "In this song" and the "Library" panels use it so the two panels
 * look identical. When the dataset has no shape, the symbol is drawn in the
 * diagram slot instead and the cell stays clickable.
 */
export const ChordCell = ({ symbol, voicing, onInsert, disabled = false }: Props) => (
    <button
        type="button"
        disabled={disabled}
        onClick={() => onInsert(symbol)}
        title={`Insert ${symbol}`}
        className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-border/70 bg-background p-2 transition-colors hover:border-primary/50 hover:bg-muted/60 active:translate-y-px disabled:pointer-events-none disabled:opacity-40"
    >
        {voicing ? (
            <>
                <ChordDiagram voicing={voicing} label={`${symbol} chord diagram`} className="w-full" />
                <span className="font-mono text-xs font-semibold text-foreground">
                    {symbol}
                </span>
            </>
        ) : (
            /* No shape in the dataset: the symbol takes the diagram slot, so
               it is shown once, big, and the cell stays clickable. */
            <span className="grid h-20 w-full place-items-center px-1 text-center font-mono text-base font-semibold text-muted-foreground">
                {symbol}
            </span>
        )}
    </button>
);
