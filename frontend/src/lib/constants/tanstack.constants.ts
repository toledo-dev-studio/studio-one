/**
 * Default configuration shared by every TanStack Query instance.
 */
export const TANSTACK_QUERY_DEFAULTS = {
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
} as const;
