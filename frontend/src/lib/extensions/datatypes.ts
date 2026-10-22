/**
 * Type helpers shared across the application.
 */

/** Makes every property of T optional and nullable. */
export type Nullable<T> = { [K in keyof T]?: T[K] | null };

/** Makes the given properties of T optional. */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Extracts the resolved type of a promise. */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/** A value that may be wrapped in a promise. */
export type MaybePromise<T> = T | Promise<T>;
