import { IInstanceOf } from 'src/interfaces/DataType/IInstanceOf';
import { IPrimitive } from 'src/interfaces/DataType/IPrimitive';
import { IBaseComplexDataTypeSymbol } from './interfaces/IBaseComplexDataType';
import { TransactionModel } from '../../models/TransactionModel';

/**
 * Represents a abstract class which provides methods
 * - to determine whether the specified object is an instance of the current class.
 * - to get the frontmatter object.
 * @see {@link TransactionModel.updateKeyValue}
 * for an example of how the {@link BaseComplexDataType.getFrontmatterObject} methode is used.
 * @deprecated This class is deprecated and will be removed in the next major version.
 * Use the {@link IPrimitive} and {@link IInstanceOf} interfaces instead.
 */
export default abstract class BaseComplexDataType {
    /**
     * A public property to determine whether the specified object is an instance of the current class.
     */
    public [IBaseComplexDataTypeSymbol]: NonNullable<boolean> = true;

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
