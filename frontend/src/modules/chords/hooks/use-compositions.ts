import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { COMPOSITIONS_KEY } from "@/lib/queries-key/compositions.key";
import {
    createCompositionAsync,
    deleteCompositionAsync,
    getCompositionAsync,
    listCompositionsAsync,
    updateCompositionAsync,
} from "../api/compositions.api";
import type { CompositionDraft } from "../interfaces/composition";

/**
 * Loads every composition of the signed-in user, newest first.
 * @param uid Owner (Firebase uid); the query waits until it is known.
 */
export const useCompositions = (uid?: string) =>
    useQuery({
        queryKey: COMPOSITIONS_KEY.list(uid ?? ""),
        queryFn: () => listCompositionsAsync(uid as string),
        enabled: Boolean(uid),
    });

/**
 * Loads one composition of the signed-in user.
 * @param uid Owner (Firebase uid).
 * @param id Document id.
 */
export const useComposition = (uid?: string, id?: string) =>
    useQuery({
        queryKey: COMPOSITIONS_KEY.detail(uid ?? "", id ?? ""),
        queryFn: () => getCompositionAsync(uid as string, id as string),
        enabled: Boolean(uid && id),
    });

/**
 * Creates a composition and refreshes the list.
 * @param uid Owner (Firebase uid).
 */
export const useCreateComposition = (uid?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (draft: CompositionDraft) => createCompositionAsync(uid as string, draft),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: COMPOSITIONS_KEY.root }),
    });
};

/**
 * Updates a composition and refreshes its detail and the list.
 * @param uid Owner (Firebase uid).
 */
export const useUpdateComposition = (uid?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, draft }: { id: string; draft: CompositionDraft }) =>
            updateCompositionAsync(uid as string, id, draft),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: COMPOSITIONS_KEY.root }),
    });
};

/**
 * Deletes a composition and refreshes the list.
 * @param uid Owner (Firebase uid).
 */
export const useDeleteComposition = (uid?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteCompositionAsync(uid as string, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: COMPOSITIONS_KEY.root }),
    });
};
