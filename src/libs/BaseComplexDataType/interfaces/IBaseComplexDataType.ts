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
