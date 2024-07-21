/**
 * Interface for classes that can be used as a type guard.
 * @see {@link Symbol.hasInstance}
 */
export interface IInstanceOf {
    /**
     * Checks if the object is an instance of the type.
     * @param obj The object to check.
     * @returns Whether the object is an instance of the type.
     */
    [Symbol.hasInstance](obj: unknown): boolean;
}

/**
 * Checks if the object is an {@link IInstanceOf}.
 * @param obj The object to check.
 * @returns Whether the object is an {@link IInstanceOf}.
 */
export function isIInstanceOf(obj: unknown): obj is IInstanceOf {
    return (
        obj != null &&
        typeof obj === 'object' &&
        typeof (obj as IInstanceOf)[Symbol.hasInstance] === 'function'
    );
}
