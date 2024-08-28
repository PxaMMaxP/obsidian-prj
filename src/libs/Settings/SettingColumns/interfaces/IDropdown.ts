import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import {
    ISettingColumn,
    ISettingColumnElements,
    ISettingColumnFluentApi,
    ISettingColumnProtected,
    ISettingColumnSettings,
} from './ISettingColumn';
import {
    SelectItem,
    OnChangeCallback,
    SelectOptions,
    SelectOptionsCallback,
} from '../types/Dropdown';

/**
 * Instance interface for the dropdown field.
 * @see {@link IDropdownProtected}
 * @see {@link IDropdownFluentApi}
 * @see {@link IDropdownSettings}
 * @see {@link IDropdownElements}
 */
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
export type IDropdownProtected<
    ElementsType extends ISettingColumnElements = IDropdownElements,
> = ISettingColumnProtected<ElementsType>;

/**
 * Fluent Api for the dropdown field.
 */
export interface IDropdownFluentApi
    extends ISettingColumnFluentApi<IDropdownFluentApi> {
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
}

/**
 * Settings for the dropdown field.
 */
export interface IDropdownSettings extends ISettingColumnSettings {
    value?: SelectItem;
    onChangeCallback?: OnChangeCallback;
    options?: SelectOptionsCallback;
}

/**
 * Public elements of the dropdown field.
 */
export interface IDropdownElements extends ISettingColumnElements {
    /**
     * The select field element.
     */
    selectEl: HTMLSelectElement;
}
