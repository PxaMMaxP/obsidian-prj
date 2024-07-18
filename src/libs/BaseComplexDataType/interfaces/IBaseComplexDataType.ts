export const IBaseComplexDataTypeSymbol: unique symbol = Symbol(
    'IBaseComplexDataType',
);

export interface IBaseComplexDataType {
    readonly [IBaseComplexDataTypeSymbol]: NonNullable<boolean>;
    /**
     * Gets a frontmatter compatible object.
     */
    getFrontmatterObject(): unknown;
}

export interface IBaseComplexDataType_ {
    /**
     * Gets a frontmatter compatible object.
     */
    isInstanceOf<T>(this: new (...args: never[]) => T, obj: unknown): obj is T;
}

/**
 * Checks if the object is an {@link IBaseComplexDataType}.
 * @param obj The object to check.
 * @returns Whether the object is an {@link IBaseComplexDataType}.
 */
export function isIBaseComplexDataType(
    obj: unknown,
): obj is IBaseComplexDataType {
    return (
        obj != null &&
        typeof obj === 'object' &&
        IBaseComplexDataTypeSymbol in (obj as object)
    );
}
