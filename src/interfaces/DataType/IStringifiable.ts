/**
 * Interface for objects that can be converted to a string.
 */
export interface IStringConvertible {
    /**
     * Gets the string representation of the object.
     * @returns The string representation of the object.
     */
    toString(): string;
}

/**
 * Checks if the object is an {@link IStringConvertible}.
 * @param obj The object to check.
 * @returns Whether the object is an {@link IStringConvertible}.
 */
export function isIStringConvertible(obj: unknown): obj is IStringConvertible {
    return (
        obj != null &&
        typeof obj === 'object' &&
        typeof (obj as IStringConvertible).toString === 'function'
    );
}
