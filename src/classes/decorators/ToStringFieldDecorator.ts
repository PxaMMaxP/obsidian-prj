import PrjBaseData from 'src/models/Data/PrjBaseData';

/**
 * A unique symbol used to mark properties that should be included in the {@link PrjBaseData.toString} method.
 */
export const ToStringFieldSymbol: unique symbol = Symbol('ToStringField');

/**
 * Represents the field configuration properties.
 */
interface IToStringField_ {
    [ToStringFieldSymbol]?: string[];
}

/**
 * Type guard to check if an object is an instance of {@link IToStringField_}.
 * @param obj The object to check.
 * @returns Ever `True` because the {@link ToStringFieldSymbol} property is optional.
 */
function isIToStringField_(obj: unknown): obj is IToStringField_ {
    return true;
}

/**
 * A decorator function to mark class properties for inclusion in the toString output.
 * @param target The target object (the class prototype).
 * @param propertyKey The key of the property being decorated.
 * @remarks - Create a {@link ToStringFieldSymbol} property in the class to get the field configurations.
 */
export function toStringField(
    target: unknown,
    propertyKey: string | symbol,
): void {
    // Check if the target is an object guard the optional `ToStringFieldSymbol` property.
    if (
        !target ||
        typeof target !== 'object' ||
        !(target instanceof Object) ||
        !isIToStringField_(target.constructor)
    ) {
        throw new Error(
            'The toStringField decorator can only be used on class properties.',
        );
    }

    // If the class does not have a `ToStringFieldSymbol` property, create it.
    if (!target.constructor[ToStringFieldSymbol]) {
        target.constructor[ToStringFieldSymbol] = [];
    }

    // Push the property key to the `ToStringFieldSymbol` property.
    target.constructor[ToStringFieldSymbol].push(propertyKey.toString());
}
