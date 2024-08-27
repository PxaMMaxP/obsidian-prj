import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import {
    ISettingColumn,
    ISettingColumnElements,
    ISettingColumnFluentApi,
    ISettingColumnProtected,
    ISettingColumnSettings,
} from './ISettingColumn';
import { GetSuggestionsCallback } from '../../components/interfaces/IGenericSuggest';
import { InputType, OnChangeCallback } from '../types/Input';

/**
 * Instance interface for the input column.
 * @see {@link IInputProtected}
 * @see {@link IInputFluentApi}
 * @see {@link IInputSettings}
 * @see {@link IInputElements}
 */
export interface IInput extends IDIComponent, ISettingColumn {}

/**
 * Protected interface for the input column.
 */
export type IInputProtected<
    ElementsType extends ISettingColumnElements = IInputElements,
> = ISettingColumnProtected<ElementsType>;

/**
 * Fluent Api for the input column.
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
}

/**
 * Settings for the input column.
 */
export interface IInputSettings extends ISettingColumnSettings {
    /**
     * The type of the input field.
     */
    inputType: InputType;

    /**
     * The value of the input field.
     */
    value: string;

    /**
     * The placeholder of the input field.
     */
    placeholder: string;

    /**
     * A callback that is called when the value of the input field changes.
     */
    onChangeCallback?: OnChangeCallback;

    /**
     * A callback that is called to get suggestions for the input field.
     * @remarks The suggestions are only shown if the callback is set.
     */
    getSuggestionsCallback?: GetSuggestionsCallback<string>;

    /**
     * Whether the input field should be spell checked.
     */
    shouldSpellCheck: boolean;
}

/**
 * Public elements interface for the input column.
 */
export interface IInputElements extends ISettingColumnElements {
    /**
     * The input field element.
     */
    inputEl: HTMLInputElement | HTMLTextAreaElement;
}
