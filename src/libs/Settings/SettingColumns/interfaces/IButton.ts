/* eslint-disable @typescript-eslint/no-empty-interface */
import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import {
    ISettingColumn,
    ISettingColumnProtected,
} from '../../interfaces/ISettingColumn';

/**
 * Represents a button field.
 */
export interface IButton extends IDIComponent, ISettingColumn {}

/**
 * The internal button field.
 */
export interface IButtonProtected extends ISettingColumnProtected {
    /**
     * @inheritdoc
     */
    get elements(): {
        /**
         * The button element.
         */
        buttonEl: HTMLButtonElement;
    };
}

/**
 * The fluent API for the button field.
 */
export interface IButtonFluentAPI {
    /**
     * Enables or disables **Call to Action**.
     * @param isCtaEnabled Whether **Call to Action** is enabled.
     * @returns The button fluent API.
     */
    setCta(isCtaEnabled: boolean): IButtonFluentAPI;

    /**
     * Sets the callback that is called when the button is clicked.
     * @param onClick The callback that is called when the button is clicked.
     * @returns The button fluent API.
     */
    onClick(onClick: OnClickCallback): IButtonFluentAPI;

    /**
     * Sets the text of the button.
     * @param text The text of the button.
     * @returns The button fluent API.
     */
    setButtonText(text: string): IButtonFluentAPI;

    /**
     * Disables or enables the button.
     * @param shouldDisabled Whether the button should be disabled.
     * @returns The button fluent API.
     */
    setDisabled(shouldDisabled: boolean): IButtonFluentAPI;
}

/**
 * A callback that is called when the button is clicked.
 */
export type OnClickCallback = (evt: MouseEvent) => unknown;

/**
 * Represents the settings of a button field.
 */
export interface IButtonSettings {
    /**
     * The text of the button.
     */
    text: string;
    /**
     * Whether **Call to Action** is enabled.
     */
    cta: boolean;
    /**
     * The callback that is called when the button is clicked.
     */
    onClick?: OnClickCallback;
    /**
     * Whether the button is disabled.
     */
    isDisabled: boolean;
}
