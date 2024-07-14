/**
 * Singleton decorator mock => Disable Singleton.
 * @param constructor The constructor.
 * @returns The same constructor.
 */
export function Singletone<T extends { new (...args: unknown[]): T }>(
    constructor: T,
): T {
    return constructor;
}
