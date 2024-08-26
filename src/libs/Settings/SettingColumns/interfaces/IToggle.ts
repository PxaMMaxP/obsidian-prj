import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import {
    ISettingColumnElements,
    ISettingColumnSettings,
} from './ISettingColumn';
import {
    ISettingColumn,
    ISettingColumnFluentApi,
    ISettingColumnProtected,
} from '../../interfaces/ISettingColumn';

/**
 * Represents a toggle field.
 * @see {@link IToggleProtected}
 * @see {@link IToggleFluentApi}
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
 * The internal toggle field.
 * @see {@link IToggle}
 */
export interface IToggleProtected extends ISettingColumnProtected {
    /**
     * @inheritdoc
     */
    get elements(): {
        /**
         * The toggle element.
         */
        toggleEl: HTMLInputElement;
    };
}

/**
 * The fluent API for the toggle field.
 * @see {@link IToggle}
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
 * A callback that is called when the value of the toggle changes.
 */
export type OnChangeCallback = (isToggled: boolean) => void;

/**
 * Represents the settings for the toggle field.
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
 * Represents the elements of the toggle field.
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
