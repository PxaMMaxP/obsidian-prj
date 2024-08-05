import { Component } from 'obsidian';
import { GetSuggestionsCallback } from 'src/libs/Modals/Components/GenericSuggest';
import { ISettingField } from '../../interfaces/ISettingField';
import { IInternalSettingItem } from '../../interfaces/SettingItem';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IInternalInput extends IInputFluentAPI {
    /**
     * The input field element.
     */
    get inputEl(): HTMLInputElement | HTMLTextAreaElement;

    /**
     * The parent setting item.
     */
    get parentSettingItem(): IInternalSettingItem & Component;
}

export interface IInput extends Component, ISettingField {
    /**
     * Gets the value of the input field.
     * @returns The value of the input field.
     */
    getValue(): string;
}

export type InputType = 'text' | 'password' | 'number' | 'date';
export type InputElementType = 'HTMLInputElement' | 'HTMLTextAreaElement';

/**
 * A callback that is called when the value of the input field changes.
 * @param value The value of the input field.
 * @returns The new value of the input field.
 */
export type OnChangeCallback = (value: string) => void;

export interface IInputFluentAPI extends IInput {
    /**
     * Sets the element type of the input field.
     * @param inputType The element type of the input field.
     * @returns The input field.
     */
    setInputElType(inputType: InputElementType): IInputFluentAPI;

    /**
     * Sets the type of the input field.
     * @param type The type of the input field.
     * @returns The input field.
     */
    setType(type: InputType): IInputFluentAPI;

    /**
     * Disables or enables the input field.
     * @param shouldDisabled Whether the input field should be disabled.
     * @returns The input field.
     */
    setDisabled(shouldDisabled: boolean): IInputFluentAPI;

    /**
     * Sets the value of the input field.
     * @param value The value of the input field.
     * @returns The input field.
     */
    setValue(value: string): IInputFluentAPI;

    /**
     * Sets the placeholder of the input field.
     * @param placeholder The placeholder of the input field.
     * @returns The input field.
     */
    setPlaceholder(placeholder: string): IInputFluentAPI;

    /**
     * Sets a callback that is called when the value of the input field changes.
     * @param callback The callback function.
     * @returns The input field.
     */
    onChange(callback: OnChangeCallback): IInputFluentAPI;

    /**
     * Adds a suggestion to the input field.
     * @param getSuggestionsCallback The callback that returns the suggestions.
     * @returns The input field.
     */
    addSuggestion(
        getSuggestionsCallback: GetSuggestionsCallback<string>,
    ): IInputFluentAPI;

    /**
     * Method for modifying the input field.
     * @param callback The callback function, which will be called
     * when the input field is modified.
     * @returns The input field.
     */
    then(callback: (input: IInternalInput) => void): IInputFluentAPI;
}
