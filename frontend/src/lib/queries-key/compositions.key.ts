/**
 * TanStack Query keys for the compositions of the chords module.
 */
export const COMPOSITIONS_KEY = {
    root: ["compositions"],
    list: (uid: string) => ["compositions", "list", uid],
    detail: (uid: string, id: string) => ["compositions", "detail", uid, id],
};
