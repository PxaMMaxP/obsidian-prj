import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import {
    ISettingColumn,
    ISettingColumnFluentApi,
    ISettingColumnProtected,
} from '../../interfaces/ISettingColumn';

/**
 * Represents a toggle field.
 * @see {@link IToggleProtected}
 * @see {@link IToggleFluentAPI}
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
export interface IToggleFluentAPI
    extends ISettingColumnFluentApi<IToggleFluentAPI> {
    /**
     * Sets the value of the toggle.
     * @param isToggled The value of the toggle.
     * @returns The toggle fluent API.
     */
    setToggled(isToggled: boolean): IToggleFluentAPI;

    /**
     * Disables or enables the toggle.
     * @param isDisabled Whether the toggle should be disabled.
     * @returns The toggle fluent API.
     */
    setDisabled(isDisabled: boolean): IToggleFluentAPI;

    /**
     * Sets a callback that is called when the value of the toggle changes.
     * @param callback The callback that is called when the value of the toggle changes.
     */
    onChange(callback: OnChangeCallback): IToggleFluentAPI;

    /**
     * Method for modifying the toggle field.
     * @param callback The callback that modifies the toggle field.
     * @returns The toggle fluent API.
     */
    then(callback: (toggle: IToggleProtected) => void): IToggleFluentAPI;
}

/**
 * A callback that is called when the value of the toggle changes.
 */
export type OnChangeCallback = (isToggled: boolean) => void;
