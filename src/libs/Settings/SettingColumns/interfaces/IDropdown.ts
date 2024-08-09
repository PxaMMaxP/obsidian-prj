import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import {
    ISettingColumn,
    ISettingColumnProtected,
} from '../../interfaces/ISettingColumn';

export interface IDropdown extends IDIComponent, ISettingColumn {
    /**
     * Gets the selected value of the dropdown field.
     * @returns The selected value of the dropdown field.
     */
    getSelectedValue(): SelectItem;
}

/**
 * Protected interface for the dropdown field.
 */
export interface IDropdownProtected extends ISettingColumnProtected {
    /**
     * @inheritdoc
     */
    get elements(): {
        /**
         * The select field element.
         */
        selectEl: HTMLSelectElement;
    };
}

export interface IDropdownFluentApi {
    /**
     * Disables or enables the dropdown field.
     * @param shouldDisabled Whether the dropdown field should be disabled.
     * @returns The dropdown field.
     */
    setDisabled(shouldDisabled: boolean): IDropdownFluentApi;

    /**
     * Sets the value of the dropdown field.
     * @param key The key of the dropdown field value.
     * @param value The value of the dropdown field.
     * @returns The dropdown field.
     */
    setValue(key: string, value: string): IDropdownFluentApi;

    /**
     * Sets a callback that is called when the value of the dropdown field changes.
     * @param callback The callback function.
     * @returns The dropdown field.
     */
    onChange(callback: OnChangeCallback): IDropdownFluentApi;

    /**
     * Sets the options of the dropdown field.
     * @param options The options of the dropdown field.
     * @returns The dropdown field.
     */
    setOptions(options: SelectOptions): IDropdownFluentApi;

    /**
     * Sets the options of the dropdown field.
     * @param optionsDelegate The delegate that returns the options of the dropdown field.
     * @returns The dropdown field.
     */
    setOptions(optionsDelegate: SelectOptionsCallback): IDropdownFluentApi;

    /**
     * Sets the options of the dropdown field.
     * @param options The options of the dropdown field
     * or a delegate that returns the options of the dropdown field.
     * @returns The dropdown field.
     */
    setOptions(
        options: SelectOptions | SelectOptionsCallback,
    ): IDropdownFluentApi;

    /**
     * Method for modifying the dropdown field.
     * @param callback The callback function, which will be called
     * when the dropdown field is created.
     * @returns The dropdown field.
     */
    then(callback: (dropdown: IDropdownProtected) => void): IDropdownFluentApi;
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
