import { useState } from "react";

import { ChevronDownIcon, ChevronUpIcon, Trash2Icon } from "lucide-react";

import type { SectionBlock } from "@/modules/chords/interfaces/composition";
import { SECTION_PRESETS } from "@/modules/chords/helpers/section-presets";
import { Button } from "@/shared/shadcn/ui/button";
import { Input } from "@/shared/shadcn/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/shared/shadcn/ui/select";
import { cn } from "@/lib/extensions/utils";

/** Sentinel stored in the section select when the block has no label. */
const NO_LABEL = "none";

/** Sentinel that switches the label field to free text. */
const CUSTOM_LABEL = "custom";

interface Props {
    block: SectionBlock;
    index: number;
    total: number;
    onChange: (patch: Partial<SectionBlock>) => void;
    onMove: (direction: -1 | 1) => void;
    onRemove: () => void;
    onFocus: () => void;
    textareaRef: (element: HTMLTextAreaElement | null) => void;
}

/**
 * One section of the editor: the part of the song being written (Intro,
 * Chorus... as label, free text allowed) and its lines of chords and lyrics.
 */
export const SectionBlockEditor = ({
    block,
    index,
    total,
    onChange,
    onMove,
    onRemove,
    onFocus,
    textareaRef,
}: Props) => {
    const lineCount = block.body.split("\n").length;

    /** true while the label is being typed as free text ("Custom…"). */
    const [customizing, setCustomizing] = useState(false);

    const handleLabelChange = (value: string) => {
        if (value === CUSTOM_LABEL) {
            setCustomizing(true);
            return;
        }

        onChange({ label: value === NO_LABEL ? "" : value });
    };

    return (
        <article className="rounded-xl border border-border/70 bg-card p-3 shadow-xs">
            <div className="flex items-center gap-2">
                {customizing ? (
                    <Input
                        autoFocus
                        value={block.label}
                        onChange={(event) => onChange({ label: event.target.value })}
                        onBlur={() => setCustomizing(false)}
                        onFocus={onFocus}
                        placeholder="Custom section label"
                        aria-label={`Label of section ${index + 1}`}
                        className="h-8 min-w-0 flex-1"
                    />
                ) : (
                    <Select value={block.label || NO_LABEL} onValueChange={(value) => handleLabelChange(String(value))}>
                        <SelectTrigger className="min-w-0 flex-1" onFocus={onFocus} aria-label={`Label of section ${index + 1}`}>
                            <SelectValue>
                                {(value: string) =>
                                    value === NO_LABEL ? (
                                        <span className="text-muted-foreground">Not set</span>
                                    ) : (
                                        value
                                    )
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_LABEL}>Not set</SelectItem>
                            <SelectSeparator />
                            {SECTION_PRESETS.map((preset) => (
                                <SelectItem key={preset} value={preset}>{preset}</SelectItem>
                            ))}
                            <SelectSeparator />
                            <SelectItem value={CUSTOM_LABEL}>Custom…</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                <span className="hidden text-[11px] text-muted-foreground sm:inline">
                    {index + 1} of {total}
                </span>

                <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={index === 0}
                    onClick={() => onMove(-1)}
                    aria-label="Move section up"
                >
                    <ChevronUpIcon />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={index === total - 1}
                    onClick={() => onMove(1)}
                    aria-label="Move section down"
                >
                    <ChevronDownIcon />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={total === 1}
                    onClick={onRemove}
                    aria-label="Remove section"
                    className="text-destructive hover:bg-destructive/10"
                >
                    <Trash2Icon />
                </Button>
            </div>

            <textarea
                ref={textareaRef}
                value={block.body}
                onChange={(event) => onChange({ body: event.target.value })}
                onFocus={onFocus}
                rows={Math.max(6, lineCount)}
                spellCheck={false}
                placeholder={"G                  Em\n   Streetlights hum in minor keys"}
                aria-label={`Lines of section ${index + 1}`}
                className={cn(
                    "mt-2 w-full resize-y rounded-lg border border-transparent bg-muted/50 px-3 py-2",
                    "font-mono text-[13px] leading-6 text-foreground outline-none",
                    "placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/40"
                )}
            />
        </article>
    );
};
