/**
 * Converts between the plain text stored in Firestore and the section blocks
 * shown by the editor. The stored format never changes: it stays exactly the
 * text the user sees in read mode.
 */

import { isSectionHeader, sectionLabel } from "@/lib/chords/detect";
import type { SectionBlock } from "../interfaces/composition";

let fallbackId = 0;

/** Creates a unique id for a section block. */
export const createBlockId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
        return crypto.randomUUID();

    fallbackId += 1;

    return `block-${Date.now()}-${fallbackId}`;
};

/**
 * Splits a chord sheet into editable sections.
 * @param content Plain text of the chord sheet.
 * @returns One block per `[Section]` header; text before the first header
 * becomes an untitled block so nothing is ever lost.
 */
export const blocksFromContent = (content: string): SectionBlock[] => {
    const blocks: SectionBlock[] = [];
    let current: SectionBlock = { id: createBlockId(), label: "", body: "" };

    const pushCurrent = () => {
        const body = current.body.replace(/\s+$/, "");

        if (current.label || body)
            blocks.push({ ...current, body });
    };

    for (const line of content.split("\n")) {
        if (isSectionHeader(line)) {
            pushCurrent();
            current = { id: createBlockId(), label: sectionLabel(line) ?? "", body: "" };
            continue;
        }

        current.body += `${current.body ? "\n" : ""}${line}`;
    }

    pushCurrent();

    return blocks.length > 0 ? blocks : [{ id: createBlockId(), label: "", body: "" }];
};

/**
 * Serializes the editor sections back into the stored plain text.
 * @param blocks Sections in order.
 * @returns The chord sheet text; empty blocks are dropped.
 */
export const contentFromBlocks = (blocks: SectionBlock[]): string =>
    blocks
        .map((block) => {
            const body = block.body.replace(/^\s+/, "").replace(/\s+$/, "");

            if (!block.label)
                return body;

            return body ? `[${block.label}]\n${body}` : `[${block.label}]`;
        })
        .filter((section) => section.length > 0)
        .join("\n\n");
