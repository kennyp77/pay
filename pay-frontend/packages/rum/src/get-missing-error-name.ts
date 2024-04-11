/**
 * Conditionally returns `Error#name`, if message did not includes it
 *
 * @param {Error} error
 * @returns {?string}
 */
export function getMissingErrorName(error: Error): string | null {
    const errorName = !error.message.includes(error.name) && error.name;

    return errorName ? errorName : null;
}
