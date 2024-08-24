import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import { GetSuggestionsCallback } from '../../components/interfaces/IGenericSuggest';
import {
    ISettingColumn,
    ISettingColumnFluentApi,
    ISettingColumnProtected,
    type TransformerDelegate,
    type ValidatorDelegate,
} from '../../interfaces/ISettingColumn';

/**
 * Main interface for the input column.
 */
export interface IInput extends IDIComponent, ISettingColumn {}

/**
 * Protected interface for the input column.
 */
export interface IInputProtected extends ISettingColumnProtected {
    /**
     * @inheritdoc
     */
    get elements(): {
        /**
         * The input field element.
         */
        inputEl: HTMLInputElement | HTMLTextAreaElement;
    };
}

/**
 * The fluent API for the input column.
 */
export interface IInputFluentApi
    extends ISettingColumnFluentApi<IInputFluentApi> {
    /**
     * Sets the type of the input field.
     * @param type The type of the input field.
     * @returns The input field.
     */
    setType(type: InputType): IInputFluentApi;

    /**
     * Disables or enables the input field.
     * @param shouldDisabled Whether the input field should be disabled.
     * @returns The input field.
     */
    setDisabled(shouldDisabled: boolean): IInputFluentApi;

    /**
     * Sets the value of the input field.
     * @param value The value of the input field.
     * @returns The input field.
     */
    setValue(value: string): IInputFluentApi;

    /**
     * Sets the placeholder of the input field.
     * @param placeholder The placeholder of the input field.
     * @returns The input field.
     */
    setPlaceholder(placeholder: string): IInputFluentApi;

    /**
     * Sets a callback that is called when the value of the input field changes.
     * @param callback The callback function.
     * @returns The input field.
     */
    onChange(callback: OnChangeCallback): IInputFluentApi;

    /**
     * Adds a suggestion to the input field.
     * @param getSuggestionsCallback The callback that returns the suggestions.
     * @returns The input field.
     */
    addSuggestion(
        getSuggestionsCallback: GetSuggestionsCallback<string>,
    ): IInputFluentApi;

    /**
     * Enables or disables the spellcheck of the input field.
     * @param shouldSpellcheck Whether the spellcheck should be enabled.
     * @returns The input field.
     */
    setSpellcheck(shouldSpellcheck: boolean): IInputFluentApi;

    /**
     * Method for modifying the input field.
     * @param callback The callback function, which will be called
     * when the input field is modified.
     * @returns The input field.
     */
    then(callback: (input: IInputProtected) => void): IInputFluentApi;
}

/**
 * Input types of {@link IInput}.
 */
export type InputType = 'textArea' | 'text' | 'password' | 'number' | 'date';

/**
 * Element types of {@link IInput}.
 */
export type InputElementType = 'HTMLInputElement' | 'HTMLTextAreaElement';

/**
 * A callback that is called when the value of the input field changes.
 * @param value The value of the input field.
 * @returns The new value of the input field.
 */
export type OnChangeCallback = (value: string) => void;

/**
 * Represents an interface for the settings of the input field.
 */
export interface IInputSettings {
    /**
     * Gets the element type of the input field.
     * @returns The element type of the input field
     * as either `input` or `textarea`.
     * @default 'input'
     */
    get inputElType(): 'input' | 'textarea';

    /**
     * The type of the input field.
     * @default 'text'
     */
    inputType: InputType;

    /**
     * The key of the input field
     * for the result event.
     */
    key: string;

    /**
     * A transformer that transforms the value of the input field
     * before it is emitted in the result event.
     */
    transformer: TransformerDelegate | undefined;

    /**
     * Tells whether the input field is required.
     */
    isRequired: boolean | ValidatorDelegate;

    /**
     * The value of the input field.
     * @default ''
     */
    value: string;

    /**
     * The placeholder of the input field.
     * @default ''
     */
    placeholder: string;

    /**
     * A callback that is called when the value of the input field changes.
     * @default undefined
     */
    onChangeCallback?: OnChangeCallback;

    /**
     * A callback that is called to get suggestions for the input field.
     * @default undefined
     * @remarks The suggestions are only shown if the callback is set.
     */
    getSuggestionsCallback?: GetSuggestionsCallback<string>;

    /**
     * Whether the toggle is disabled.
     * @default false
     */
    isDisabled: boolean;

    /**
     * Whether the input field should be spell checked.
     */
    shouldSpellCheck: boolean;
}
