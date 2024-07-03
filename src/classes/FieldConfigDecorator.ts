/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A unique symbol used to mark properties that should be included in the `mergeData` method.
 */
export const FieldConfigSymbol = Symbol('FieldConfig');

/**
 * A decorator function to mark class properties for inclusion in the `mergeData` method.
 * @param defaultValue The optional default value for the field.
 * @returns A decorator function.
 */
export function fieldConfig(defaultValue?: any) {
    return function (target: any, propertyKey: any): void {
        if (!target.constructor[FieldConfigSymbol]) {
            target.constructor[FieldConfigSymbol] = [];
        }

        target.constructor[FieldConfigSymbol].push({
            key: propertyKey,
            defaultValue,
        });
    };
}
