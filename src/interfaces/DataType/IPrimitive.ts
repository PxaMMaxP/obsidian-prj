/**
 * Interface for objects that can be converted to a primitive value.
 */
export interface IPrimitive {
    /**
     * Converts the object to a primitive like value
     * which is frontmatter compatible.
     * @returns The primitive
     */
    primitiveOf(): string | string[];
}

/**
 * Checks if the object is an {@link IPrimitive}.
 * @param obj The object to check.
 * @returns Whether the object is an {@link IPrimitive}.
 */
export function isIPrimitive(obj: unknown): obj is IPrimitive {
    return (
        obj != null &&
        typeof obj === 'object' &&
        typeof (obj as IPrimitive).primitiveOf === 'function'
    );
}
