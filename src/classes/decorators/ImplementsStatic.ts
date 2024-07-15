/**
 * Decorator to enforce static implementation of an interface
 * @returns A decorator function
 */
export function ImplementsStatic<I>() {
    return <T extends I>(constructor: T, ...args: unknown[]) => {};
}
