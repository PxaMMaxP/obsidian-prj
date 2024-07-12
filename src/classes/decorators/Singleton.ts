/**
 * Singleton decorator.
 * @param constructor The constructor to create a singleton from.
 * @param args Other arguments from the decorator interface.
 * @returns The singleton class.
 * @remarks To get the singleton instance, call the constructor.
 */
export function Singleton<
    T extends { new (...args: unknown[]): NonNullable<unknown> },
>(constructor: T, ...args: unknown[]): T {
    let instance: T;

    /**
     * Wraps the constructor to create a singleton.
     * @param args The arguments for the constructor.
     * @returns The singleton instance.
     */
    const wrappedConstructor: T = function (...args: unknown[]) {
        if (!instance) {
            instance = new constructor(...args) as T;
        }

        return instance;
    } as unknown as T;

    wrappedConstructor.prototype = constructor.prototype;

    return wrappedConstructor as T;
}
