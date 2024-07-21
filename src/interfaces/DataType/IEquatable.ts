/**
 * Interface for equatable objects.
 */
export interface IEquatable {
    /**
     * Checks if this object is equal to another object.
     * @param other The other object to compare.
     * @returns Whether this object is equal to the other object.
     */
    equals(other: unknown): boolean;
}

/**
 * Checks if the object is an {@link IEquatable}.
 * @param obj The object to check.
 * @returns Whether the object is an {@link IEquatable}.
 */
export function isIEquatable(obj: unknown): obj is IEquatable {
    return (
        obj != null &&
        typeof obj === 'object' &&
        typeof (obj as IEquatable).equals === 'function'
    );
}
