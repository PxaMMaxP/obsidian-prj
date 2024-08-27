import { ISettingRowProtected } from '../../interfaces/ISettingRow';
import { TransformerDelegate, ValidatorDelegate } from '../types/General';

/**
 * Generic static interface for setting columns.
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
 * Generic instance interface for setting columns.
 */
export interface ISettingColumn<
    FluentApiType = unknown,
    ElementsType extends ISettingColumnElements = ISettingColumnElements,
    ProtectedType extends ISettingColumnProtected = ISettingColumnProtected,
> extends ISettingColumnFluentApi<FluentApiType, ProtectedType>,
        ISettingColumnProtected<ElementsType> {}

/**
 * Generic protected interface for setting columns.
 */
export interface ISettingColumnProtected<
    ElementsType extends ISettingColumnElements = ISettingColumnElements,
> {
    /**
     * The elements of the setting column.
     */
    get elements(): ElementsType;

    /**
     * The parent setting item.
     */
    get parentSettingItem(): ISettingRowProtected;
}

/**
 * Generic fluent API for setting columns.
 */
export interface ISettingColumnFluentApi<
    FluentApiType = unknown,
    ProtectedType = ISettingColumnProtected,
> {
    /**
     * Sets the key of the result in the modal.
     * @param key The key of the result.
     * @returns The fluent Api.
     */
    setResultKey(key: string): FluentApiType;

    /**
     * Sets the key of the result in the modal and transforms the value.
     * @param key The key of the result.
     * @param transformer The transformer that transforms the value.
     * @returns The fluent Api.
     */
    setResultKey<InputType, ResultType>(
        key: string,
        transformer: TransformerDelegate<InputType, ResultType>,
    ): FluentApiType;

    /**
     * The input is not required for the form.
     * @param required Whether the input is required.
     * @returns The fluent Api.
     */
    setRequired(required: false): FluentApiType;

    /**
     * The input is required for the form.
     * The Value is valid if the input is not undefined, null or an empty string.
     * @param required Whether the input is required.
     * @returns The fluent Api.
     */
    setRequired(required: true): FluentApiType;

    /**
     * The input is required for the form and only valid if the test passes.
     * @param test The test that the input must pass. Returns true if the input is valid.
     * @param required Whether the input is required.
     * @returns The fluent Api.
     */
    setRequired(test: ValidatorDelegate, required?: true): FluentApiType;

    /**
     * Method for modifying the settings individually.
     * @param callback The callback that modifies the settings.
     */
    then(callback: (column: ProtectedType) => void): FluentApiType;
}

/**
 * Base settings interface for setting columns.
 */
export interface ISettingColumnSettings {
    /**
     * The key of the setting column input
     * for the result event.
     */
    key: string;

    /**
     * A transformer that transforms the value of the setting column input
     * before it is emitted in the result event.
     */
    transformer: TransformerDelegate | undefined;

    /**
     * Tells whether the setting column input is required.
     */
    isRequired: boolean | ValidatorDelegate;

    /**
     * Whether the setting column is disabled.
     */
    isDisabled: boolean;
}

/**
 * Public elements interface for setting columns.
 */
export interface ISettingColumnElements {
    /**
     * The parent element of the setting column.
     * The Flow API is used to append elements to this element!
     */
    parentEl: HTMLElement;
}
