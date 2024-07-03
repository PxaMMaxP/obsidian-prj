/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A unique symbol used to mark properties that should be included in the toString output.
 */
export const ToStringFieldSymbol = Symbol('ToStringField');

/**
 * A decorator function to mark class properties for inclusion in the toString output.
 * @param target - The target object (the class prototype).
 * @param propertyKey - The name of the property being decorated.
 */
export function toStringField(target: any, propertyKey: any): void {
    if (!target.constructor[ToStringFieldSymbol]) {
        target.constructor[ToStringFieldSymbol] = [];
    }
    target.constructor[ToStringFieldSymbol].push(propertyKey);
}
