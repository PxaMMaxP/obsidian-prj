import { TransactionModel } from '../models/TransactionModel';

export const IBaseComplexDataTypeSymbol = Symbol('IBaseComplexDataType');

export interface IBaseComplexDataType {
    [IBaseComplexDataTypeSymbol]: boolean;
    /**
     * Gets a frontmatter compatible object.
     */
    getFrontmatterObject(): unknown;
}

/**
 * Determines whether the specified object is an instance of {@link IBaseComplexDataType}.
 * @param obj The object to check.
 * @returns Whether the object is an instance of {@link IBaseComplexDataType}.
 */
export function isIBaseComplexDataType(
    obj: unknown,
): obj is IBaseComplexDataType {
    return (
        (obj &&
            (obj as IBaseComplexDataType)[IBaseComplexDataTypeSymbol] ===
                true) === true
    );
}

export interface IStaticBaseComplexDataType {
    /**
     * Gets a frontmatter compatible object.
     */
    isInstanceOf<T>(this: new (...args: never[]) => T, obj: unknown): obj is T;
}

/**
 * Represents a abstract class which provides methods
 * - to determine whether the specified object is an instance of the current class.
 * - to get the frontmatter object.
 * @see {@link TransactionModel.updateKeyValue}
 * for an example of how the {@link BaseComplexDataType.getFrontmatterObject} methode is used.
 */
export default abstract class BaseComplexDataType {
    /**
     * Determines whether the specified object is an instance of the current class.
     * @param this The class to check against.
     * @param obj The object to check.
     * @returns Whether the object is an instance of the current class.
     */
    public static isInstanceOf<T>(
        this: new (...args: never[]) => T,
        obj: unknown,
    ): obj is T {
        return obj instanceof this;
    }
}
