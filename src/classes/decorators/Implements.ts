/**
 * Decorator to enforce **static** implementation of an interface.
 * @returns A decorator function
 * ---
 * **Will be checked at compile time.**
 * @see {@link Implements} for instance implementation type checking.
 */
export function ImplementsStatic<I>() {
    return <T extends I>(constructor: T, ...args: unknown[]) => {};
}

export { ImplementsStatic as Implements_ };

/**
 * Decorator to enforce **instance** implementation of an interface.
 * @returns A decorator function
 * ---
 * **Will be checked at compile time.**
 * @see {@link ImplementsStatic} for static implementation type checking.
 */
export function Implements<I>() {
    return <T extends new (...args: unknown[]) => I>(
        constructor: T,
    ): void => {};
}
