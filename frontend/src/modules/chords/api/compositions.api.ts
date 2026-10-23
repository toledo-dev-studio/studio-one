import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    type DocumentSnapshot,
    type Timestamp,
} from "firebase/firestore";

import { getFirebaseFirestore } from "@/lib/firebase";
import type { Composition, CompositionDraft } from "../interfaces/composition";

/**
 * Compositions live under `users/{uid}/chords`, so scoping by owner is part
 * of the path: a query cannot reach documents of another user.
 * Firestore handles these reads and writes directly from the client; the
 * security rules in `firestore.rules` are what enforce ownership.
 */
const compositionsCollection = (uid: string) =>
    collection(getFirebaseFirestore(), "users", uid, "chords");

const compositionDocument = (uid: string, id: string) =>
    doc(getFirebaseFirestore(), "users", uid, "chords", id);

const toDate = (value: unknown): Date | undefined => {
    if (value instanceof Date)
        return value;

    if (value && typeof (value as Timestamp).toDate === "function")
        return (value as Timestamp).toDate();

    return undefined;
};

const mapComposition = (snapshot: DocumentSnapshot): Composition | null => {
    if (!snapshot.exists())
        return null;

    const data = snapshot.data();

    return {
        id: snapshot.id,
        uid: typeof data.uid === "string" ? data.uid : "",
        title: typeof data.title === "string" ? data.title : "",
        key: typeof data.key === "string" && data.key ? data.key : undefined,
        capo: typeof data.capo === "number" ? data.capo : 0,
        tempo: typeof data.tempo === "string" && data.tempo ? data.tempo : undefined,
        content: typeof data.content === "string" ? data.content : "",
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
    };
};

const draftFields = (draft: CompositionDraft) => ({
    title: draft.title.trim(),
    key: draft.key && draft.key.length > 0 ? draft.key : null,
    capo: draft.capo,
    tempo: draft.tempo && draft.tempo.trim().length > 0 ? draft.tempo.trim() : null,
    content: draft.content,
});

/**
 * Lists the compositions of a user, most recently updated first.
 * @param uid Owner (Firebase uid).
 * @returns The compositions of that user only.
 */
export const listCompositionsAsync = async (uid: string): Promise<Composition[]> => {
    const snapshot = await getDocs(
        query(compositionsCollection(uid), orderBy("updatedAt", "desc"))
    );

    return snapshot.docs
        .map(mapComposition)
        .filter((composition): composition is Composition => composition !== null);
};

/**
 * Reads a single composition of the user.
 * @param uid Owner (Firebase uid).
 * @param id Document id.
 * @returns The composition, or null when it does not exist / is not allowed.
 */
export const getCompositionAsync = async (uid: string, id: string): Promise<Composition | null> => {
    const snapshot = await getDoc(compositionDocument(uid, id));

    return mapComposition(snapshot);
};

/**
 * Creates a composition and returns its id.
 * @param uid Owner (Firebase uid).
 * @param draft Data entered by the user.
 * @returns The new document id.
 */
export const createCompositionAsync = async (uid: string, draft: CompositionDraft): Promise<string> => {
    const reference = await addDoc(compositionsCollection(uid), {
        ...draftFields(draft),
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return reference.id;
};

/**
 * Replaces the editable fields of a composition.
 * @param uid Owner (Firebase uid).
 * @param id Document id.
 * @param draft Data entered by the user.
 */
export const updateCompositionAsync = async (uid: string, id: string, draft: CompositionDraft): Promise<void> => {
    await updateDoc(compositionDocument(uid, id), {
        ...draftFields(draft),
        updatedAt: serverTimestamp(),
    });
};

/**
 * Deletes a composition.
 * @param uid Owner (Firebase uid).
 * @param id Document id.
 */
export const deleteCompositionAsync = async (uid: string, id: string): Promise<void> => {
    await deleteDoc(compositionDocument(uid, id));
};
