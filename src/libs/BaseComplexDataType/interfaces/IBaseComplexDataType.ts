/* eslint-disable deprecation/deprecation */
export const IBaseComplexDataTypeSymbol: unique symbol = Symbol(
    'IBaseComplexDataType',
);

/**
 * @deprecated This interface is deprecated and will be removed in the next major version.
 * Use the {@link IPrimitive} and {@link IInstanceOf} interfaces instead.
 */
export interface IBaseComplexDataType {
    readonly [IBaseComplexDataTypeSymbol]: NonNullable<boolean>;
    /**
     * Gets a frontmatter compatible object.
     */
    getFrontmatterObject(): unknown;
}

/**
 * @deprecated This interface is deprecated and will be removed in the next major version.
 * Use the {@link IPrimitive} and {@link IInstanceOf} interfaces instead.
 */
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
 * @deprecated This function is deprecated and will be removed in the next major version.
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
