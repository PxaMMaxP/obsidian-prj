import {
    IBaseComplexDataType,
    IBaseComplexDataTypeSymbol,
} from './interfaces/IBaseComplexDataType';

/**
 * Determines whether the specified object is an instance of {@link IBaseComplexDataType}.
 * @param obj The object to check.
 * @returns Whether the object is an instance of {@link IBaseComplexDataType}.
 */
export function isIBaseComplexDataType(
    obj: unknown,
): obj is IBaseComplexDataType {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        IBaseComplexDataTypeSymbol in (obj as object)
    );
}
