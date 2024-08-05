import { Component } from 'obsidian';
import { ISettingField } from '../../interfaces/ISettingField';
import { IInternalSettingItem } from '../../interfaces/SettingItem';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IInternalDropdown extends IDropdown, IDropdownFluentAPI {
    /**
     * The select field element.
     */
    get selectEl(): HTMLSelectElement;

    /**
     * The parent setting item.
     */
    get parentSettingItem(): IInternalSettingItem & Component;
}

export interface IDropdown extends Component, ISettingField {
    /**
     * Gets the selected value of the dropdown field.
     * @returns The selected value of the dropdown field.
     */
    getSelectedValue(): SelectItem;
}

/**
 * Represents a dropdown field entry.
 * @param key The key of the dropdown field value.
 * @param value The value of the dropdown field.
 */
export type SelectItem = {
    key: string;
    value: string;
};
/**
 * A callback that is called when the value of the dropdown field changes.
 * @param item The key & value of the dropdown field: {@link SelectItem}.
 * @returns The new value of the dropdown field.
 */
export type OnChangeCallback = (item: SelectItem) => void;
/**
 * Represents the options of the dropdown field.
 * @see {@link SelectItem}
 */
export type SelectOptions = SelectItem[];
/**
 * A callback that returns the options of the dropdown field.
 * @returns The options of the dropdown field: {@link SelectOptions}.
 */
export type SelectOptionsCallback = () => SelectItem[];

export interface IDropdownFluentAPI extends IDropdown {
    /**
     * Disables or enables the dropdown field.
     * @param shouldDisabled Whether the dropdown field should be disabled.
     * @returns The dropdown field.
     */
    setDisabled(shouldDisabled: boolean): IDropdownFluentAPI;

    /**
     * Sets the value of the dropdown field.
     * @param key The key of the dropdown field value.
     * @param value The value of the dropdown field.
     * @returns The dropdown field.
     */
    setValue(key: string, value: string): IDropdownFluentAPI;

    /**
     * Sets a callback that is called when the value of the dropdown field changes.
     * @param callback The callback function.
     * @returns The dropdown field.
     */
    onChange(callback: OnChangeCallback): IDropdownFluentAPI;

    /**
     * Sets the options of the dropdown field.
     * @param options The options of the dropdown field.
     * @returns The dropdown field.
     */
    setOptions(options: SelectOptions): IDropdownFluentAPI;

    /**
     * Sets the options of the dropdown field.
     * @param optionsDelegate The delegate that returns the options of the dropdown field.
     * @returns The dropdown field.
     */
    setOptions(optionsDelegate: SelectOptionsCallback): IDropdownFluentAPI;

    /**
     * Sets the options of the dropdown field.
     * @param options The options of the dropdown field
     * or a delegate that returns the options of the dropdown field.
     * @returns The dropdown field.
     */
    setOptions(
        options: SelectOptions | SelectOptionsCallback,
    ): IDropdownFluentAPI;

    /**
     * Method for modifying the dropdown field.
     * @param callback The callback function, which will be called
     * when the dropdown field is created.
     * @returns The dropdown field.
     */
    then(callback: (dropdown: IInternalDropdown) => void): IDropdownFluentAPI;
}
