/**
 * Interface for comparable objects.
 */
export interface IComparable<T> {
    /**
     * Compares this object to another object.
     * @param other The other object to compare.
     * @returns A number indicating the order of the objects.
     * E.g. -1 if this object is less than the other object,
     * 0 if they are equal, and 1 if this object is greater than the other object.
     */
    compareTo(other: T): number;
}

/**
 * Checks if the object is an {@link IComparable}.
 * @param obj The object to check.
 * @returns Whether the object is an {@link IComparable}.
 */
export function isIComparable(obj: unknown): obj is IComparable<unknown> {
    return (
        obj != null &&
        typeof obj === 'object' &&
        typeof (obj as IComparable<unknown>).compareTo === 'function'
    );
}
