/**
 * A chord sheet registered by the user: title, optional key, optional capo
 * and the plain text that holds sections, chords and lyrics.
 */
export interface Composition {
    /** Firestore document id. */
    id: string;
    /** Owner (Firebase uid). Only the owner can read or write the document. */
    uid: string;
    title: string;
    /** Key as written by the user ("G", "Am"); unknown until they set it. */
    key?: string;
    /** Capo fret (0 = played without a capo). Informational only. */
    capo: number;
    tempo?: string;
    /** Plain text: "[Intro]" headers with chord lines above the lyrics. */
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/** Data required to create or update a composition. */
export interface CompositionDraft {
    title: string;
    key?: string;
    capo: number;
    tempo?: string;
    content: string;
}

/** One editable section of the editor: its label and the lines it holds. */
export interface SectionBlock {
    /** Stable id, used for keys and to track the focused textarea. */
    id: string;
    /** Label written between brackets; empty when the section has none. */
    label: string;
    /** Raw lines (chords above lyrics), without the header. */
    body: string;
}
