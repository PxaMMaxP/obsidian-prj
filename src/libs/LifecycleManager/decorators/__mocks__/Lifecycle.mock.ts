/**
 * Lifecycle decorator mock => Disable Lifecycle.
 * @param constructor The constructor.
 * @returns The same constructor.
 */
export function Lifecycle<T extends { new (...args: unknown[]): T }>(
    constructor: T,
): T {
    return constructor;
}
