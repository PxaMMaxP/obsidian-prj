/* eslint-disable @typescript-eslint/no-empty-interface */
import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import {
    ISettingColumn,
    ISettingColumnElements,
    ISettingColumnFluentApi,
    ISettingColumnProtected,
    ISettingColumnSettings,
} from './ISettingColumn';
import { OnClickCallback } from '../types/Button';

/**
 * Instance interface for the button field.
 * @see {@link IButtonProtected}
 * @see {@link IButtonFluentAPI}
 * @see {@link IButtonSettings}
 * @see {@link IButtonElements}
 */
export interface IButton extends IDIComponent, ISettingColumn {}

/**
 * Protected interface for the button field.
 */
export type IButtonProtected<
    ElementsType extends ISettingColumnElements = IButtonElements,
> = ISettingColumnProtected<ElementsType>;

/**
 * Fluent Api for the button field.
 */
export interface IButtonFluentAPI
    extends ISettingColumnFluentApi<IButtonFluentAPI> {
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
}

/**
 * Settings for the button field.
 */
export interface IButtonSettings extends ISettingColumnSettings {
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
}

/**
 * Elements interface for the button field.
 */
export interface IButtonElements extends ISettingColumnElements {
    /**
     * The button element.
     */
    buttonEl: HTMLButtonElement;
}
