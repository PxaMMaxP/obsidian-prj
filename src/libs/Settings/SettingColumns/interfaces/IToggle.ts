import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import {
    ISettingColumn,
    ISettingColumnElements,
    ISettingColumnFluentApi,
    ISettingColumnProtected,
    ISettingColumnSettings,
} from './ISettingColumn';
import { OnChangeCallback } from '../types/Toggle';

/**
 * Instance interface for the toggle field.
 * @see {@link IToggleSettings}
 * @see {@link IToggleElements}
 * @see {@link IToggleFluentApi}
 * @see {@link IToggleProtected}
 */
export interface IToggle extends IDIComponent, ISettingColumn {
    /**
     * Gets the value of the toggle.
     * @returns The value of the toggle.
     */
    get isToggled(): boolean;

    /**
     * Loads the toggle field.
     */
    onload(): void;
}

/**
 * Protected interface for the toggle field.
 */
export type IToggleProtected<
    ElementsType extends ISettingColumnElements = IToggleElements,
> = ISettingColumnProtected<ElementsType>;

/**
 * Fluent Api for the toggle field.
 */
export interface IToggleFluentApi
    extends ISettingColumnFluentApi<IToggleFluentApi> {
    /**
     * Sets the value of the toggle.
     * @param isToggled The value of the toggle.
     * @returns The toggle fluent API.
     */
    setToggled(isToggled: boolean): IToggleFluentApi;

    /**
     * Disables or enables the toggle.
     * @param isDisabled Whether the toggle should be disabled.
     * @returns The toggle fluent API.
     */
    setDisabled(isDisabled: boolean): IToggleFluentApi;

    /**
     * Sets a callback that is called when the value of the toggle changes.
     * @param callback The callback that is called when the value of the toggle changes.
     */
    onChange(callback: OnChangeCallback): IToggleFluentApi;
}

/**
 * Settings interface for the toggle field.
 */
export interface IToggleSettings extends ISettingColumnSettings {
    /**
     * The value of the toggle.
     */
    isToggled?: boolean;

    /**
     * A callback that is called when the value of the toggle changes.
     */
    onChangeCallback?: OnChangeCallback;
}

/**
 * Public elements interface for the toggle field.
 */
export interface IToggleElements extends ISettingColumnElements {
    /**
     * The toggle element.
     */
    toggleEl: HTMLInputElement;
    /**
     * The container element of the toggle.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _toggleContainerEl: HTMLDivElement;
}
