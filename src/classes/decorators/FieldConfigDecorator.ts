import PrjBaseData from 'src/models/Data/PrjBaseData';

/**
 * A unique symbol used to mark properties that should be included in the {@link PrjBaseData.mergeData} method.
 */
export const FieldConfigSymbol: unique symbol = Symbol('FieldConfig');

/**
 * Represents the field configuration properties.
 */
export interface IFieldConfig_ {
    [FieldConfigSymbol]?: IFieldConfigEntry[];
}

/**
 * Type guard to check if an object is an instance of {@link IFieldConfig_}.
 * @param obj The object to check.
 * @returns Ever `True` because the {@link FieldConfigSymbol} property is optional.
 */
export function isIFieldConfig_(obj: unknown): obj is IFieldConfig_ {
    return true;
}

/**
 * Represents a entry in the field configuration.
 */
export interface IFieldConfigEntry {
    key: string | number | symbol;
    defaultValue?: unknown;
}

/**
 * A decorator function to mark class properties for inclusion in the {@link PrjBaseData.mergeData} method.
 * @param defaultValue The optional default value for the field. The setter will be used with this value.
 * @returns A decorator function.
 * @remarks - The field must have a getter and setter.
 * - The field must be marked as `@fieldConfig` in the class.
 * - `@fieldConfig` in higher classes will overwrite the default value of the same field in lower classes.
 * - Create a {@link FieldConfigSymbol} property in the class to get the field configurations.
 */
export function fieldConfig(defaultValue?: unknown) {
    return function (target: unknown, propertyKey: string | symbol): void {
        // Check if the target is an object guard the optional `FieldConfigSymbol` property.
        if (
            !target ||
            typeof target !== 'object' ||
            !(target instanceof Object) ||
            !isIFieldConfig_(target.constructor)
        ) {
            throw new Error(
                'The fieldConfig decorator can only be used on class properties.',
            );
        }

        // If the class does not have a `FieldConfigSymbol` property, create it. Type Safe!
        if (!target.constructor[FieldConfigSymbol]) {
            target.constructor[FieldConfigSymbol] = [];
        }

        // Get the field configurations for the class.
        const fieldConfigs = target.constructor[FieldConfigSymbol];

        // Check if the field is already in the list and..
        const existingIndex = fieldConfigs.findIndex(
            (config: IFieldConfigEntry) => config.key === propertyKey,
        );

        // ..if the field is not in the list, add it.
        if (existingIndex == -1) {
            // The first entry is the highest class,
            // allowing derived classes to overwrite standard values.
            fieldConfigs.push({
                key: propertyKey,
                defaultValue,
            });
        }
    };
}
