/**
 * Promise helpers.
 */

/**
 * Simulate an async delay.
 * Useful to emulate API response time while developing.
 * @param ms Number of milliseconds to wait.
 * @returns Promise that resolves after the delay.
 */
export const sleep = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a pool request for async actions.
 * @param items Items to process as promises.
 * @param limit Limit of requests at the same time.
 * @param worker Function to execute.
 * @returns Promise array.
 */
export const promisePool = async <T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> => {
    const results: R[] = [];
    let index = 0;

    const workers = new Array(limit).fill(null).map(async () => {
        while (index < items.length) {
            const currentIndex = index++;
            const item = items[currentIndex];

            results[currentIndex] = await worker(item);
        }
    });

    await Promise.all(workers);

    return results;
};
