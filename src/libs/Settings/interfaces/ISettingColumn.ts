import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import { ISettingRowProtected } from './ISettingRow';

/**
 * Generic static interface for a setting column.
 */
export interface ISettingColumn_<
    Type extends new (
        parent: ISettingRowProtected,
        configure?: ConstructorParameters<Type>[1],
    ) => ISettingColumn,
> {
    /**
     * @param parent The parent setting row.
     * @param configure A function that configures the setting column.
     */
    new (
        parent: ISettingRowProtected,
        configure?: ConstructorParameters<Type>[1],
    ): ISettingColumn;
}

/**
 * Generic interface for setting column.
 */
export interface ISettingColumnProtected {
    /**
     * The elements of the setting column.
     * @example
     * You can define the elements in the setting column as follows:
     * ```ts
     * interface SettingColumn extends ISettingColumnProtected {
     *     elements: {
     *         testEl: HTMLDivElement;
     *         // ...
     *     };
     * }
     * ```
     */
    get elements(): HTMLElementMap;

    /**
     * The parent setting item.
     */
    get parentSettingItem(): ISettingRowProtected;
}

/**
 * Generic interface for setting column.
 */
export interface ISettingColumn extends IDIComponent {
    /**
     * Apply the {@link SettingColumnConfigurator} to the setting item.
     */
    onload(): void;
    /**
     * Get the value of the setting column.
     */
    readonly value?: unknown;
}

export type TransformerDelegate<InputType = unknown, ResultType = unknown> = (
    value: InputType,
) => ResultType;

export type ValidatorDelegate = (value: unknown) => boolean;

/**
 * Common fluent API for setting columns.
 */
export interface ISettingColumnFluentApi<FluentApi> {
    /**
     * Sets the key of the result in the modal.
     * @param key The key of the result.
     * @returns The fluent Api.
     */
    setResultKey(key: string): FluentApi;

    /**
     * Sets the key of the result in the modal and transforms the value.
     * @param key The key of the result.
     * @param transformer The transformer that transforms the value.
     * @returns The fluent Api.
     */
    setResultKey<InputType, ResultType>(
        key: string,
        transformer: TransformerDelegate<InputType, ResultType>,
    ): FluentApi;

    /**
     * The input is not required for the form.
     * @param required Whether the input is required.
     * @returns The fluent Api.
     */
    setRequired(required: false): FluentApi;

    /**
     * The input is required for the form.
     * The Value is valid if the input is not undefined, null or an empty string.
     * @param required Whether the input is required.
     * @returns The fluent Api.
     */
    setRequired(required: true): FluentApi;

    /**
     * The input is required for the form and only valid if the test passes.
     * @param test The test that the input must pass. Returns true if the input is valid.
     * @param required Whether the input is required.
     * @returns The fluent Api.
     */
    setRequired(test: ValidatorDelegate, required?: true): FluentApi;
}

/**
 * A function that configures a setting column.
 */
export type SettingColumnConfigurator<T> = (instance: T) => void;

export type HTMLElementMap = Readonly<Record<string, HTMLElement>>;
