/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldConfigSymbol } from 'src/classes/decorators/FieldConfigDecorator';
import { ToStringFieldSymbol } from 'src/classes/decorators/ToStringFieldDecorator';
import { DIContainer } from 'src/libs/DependencyInjection/DIContainer';
import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';

/**
 * An abstract base class that provides common functionality for data classes.
 */
export default abstract class BaseData<T> {
    protected _dependencies: IDIContainer;

    /**
     * Initializes a new instance of the BaseData class.
     * @param data The optional data to merge into the current instance.
     * @param dependencies The optional dependencies to use for the model.
     */
    constructor(data?: Partial<T>, dependencies?: IDIContainer) {
        this._dependencies = dependencies ?? DIContainer.getInstance();
        this.initializeDependencies();

        this.mergeData(data);
    }

    /**
     * Initializes the dependencies of the data class.
     */
    protected abstract initializeDependencies(): void;

    /**
     * The field configuration for the data.
     * Only fields marked with the {@link FieldConfigSymbol|@fieldConfig} decorator will be included in the output.
     * @remarks Will be used to determine which fields to merge and their default values when calling {@link mergeData}.
     */
    protected get fieldConfig(): {
        key: keyof T | string | number | symbol;
        defaultValue?: any;
    }[] {
        return (this.constructor as any)[FieldConfigSymbol] || [];
    }

    /**
     * Merges the provided data into the current instance.
     * @param data The optional data to merge into the current instance.
     * @remarks - This method uses the {@link fieldConfig} property to determine which fields to merge and their default values.
     * - If a field is not present in the provided data or no data is provided, the default value is used.
     */
    protected mergeData(data?: Partial<T>): void {
        for (const config of this.fieldConfig) {
            const key = config.key as keyof T;

            if (data && data[key] !== undefined) {
                (this as unknown as T)[key] = data[key] as T[keyof T];
            } else if (config.defaultValue !== undefined) {
                (this as unknown as T)[key] = config.defaultValue;
            }
        }
    }

    /**
     * Gets the default data for the current data model `T`.
     */
    public get defaultData(): Partial<T> {
        const defaultData: Partial<T> = {};

        for (const config of this.fieldConfig) {
            const key = config.key as keyof T;

            if (config.defaultValue !== undefined) {
                defaultData[key] = config.defaultValue;
            }
        }

        return defaultData;
    }

    /**
     * Returns the metadata of the document as a string.
     * Only properties marked with the {@link ToStringFieldSymbol|@toStringField} decorator will be included in the output.
     * @returns A string containing the concatenated values of the marked properties.
     */
    public toString(): string {
        const fields = (this.constructor as any)[ToStringFieldSymbol] as (
            | string
            | symbol
        )[];
        const dataFields = fields.map((field) => (this as any)[field] ?? '');

        return dataFields.join(' ');
    }
}
