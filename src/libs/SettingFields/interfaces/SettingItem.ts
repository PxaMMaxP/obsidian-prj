/* eslint-disable jsdoc/check-tag-names */
import { Component } from 'obsidian';
import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import { ICustomModal } from 'src/libs/Modals/CustomModal/interfaces/ICustomModal';

export type SettingConfigurator = (setting: ISettingItemFluentAPI) => void;

/**
 * Static interface for setting items.
 */
export interface ISettingItem_ {
    /**
     * Creates a new setting block.
     * @param parentModal The `ICustomModal` instance that the setting field belongs to.
     * @param configure A function that configures the setting field {@link ISettingItem.onload|on load}.
     * @param parentContainerEl The container element to add the setting block.
     * Only if `modal` is `undefined`.
     * @param parentComponent The component that the setting field belongs to.
     * It is used to register the setting block as a child of the component.
     * Only if `modal` is `undefined`.
     */
    new (
        parentModal: ICustomModal | undefined,
        configure?: SettingConfigurator,
        parentContainerEl?: HTMLElement | DocumentFragment,
        parentComponent?: Component,
    ): ISettingItem;
}

/**
 * Internal interface for setting items.
 */
export interface IInternalSettingItem extends ISettingItemFluentAPI {
    /**
     * The container element of
     * this whole setting field **Parent**.
     */
    get parentContainerEl(): HTMLElement | DocumentFragment;

    /**
     * The component that the setting item belongs to.
     */
    get parentComponent(): Component;

    /**
     * The `ICustomModal` instance that the setting item belongs to.
     */
    get parentModal(): ICustomModal | undefined;
}

/**
 * Interface for setting items.
 */
export interface ISettingItem extends IDIComponent {
    /**
     * The container element of
     * this whole setting field.
     * @parent of {@link infoEl}, {@link displayEl} and {@link inputEl}.
     * @child of {@link containerEl} as append.
     */
    get settingFieldEl(): HTMLElement;

    /**
     * The element which contains
     * `nameEl` and `descriptionEl`.
     * @parent of {@link nameEl} and {@link descriptionEl}.
     * @child of {@link settingFieldEl} as the first child.
     */
    get infoEl(): HTMLElement;

    /**
     * The element which contains
     * the name of the setting field.
     * @child of {@link infoEl} as the first child.
     */
    get nameEl(): HTMLElement;

    /**
     * The element which contains
     * the description of the setting field.
     * @child of {@link infoEl} as the last child.
     */
    get descriptionEl(): HTMLElement;

    /**
     * The element which contains
     * optional outputs of the field.
     * @child of {@link settingFieldEl} as the middle child.
     */
    get displayEl(): HTMLElement;

    /**
     * The element which contains
     * the input field.
     * @child of {@link settingFieldEl} as the last child.
     */
    get inputEl(): HTMLElement;

    /**
     * Apply the {@link SettingConfigurator} to the setting item.
     */
    onload(): void;
}

/**
 *
 */
export interface ISettingItemFluentAPI extends ISettingItem {
    /**
     * Sets the class name of the setting field.
     * @param className The class name of the setting field.
     * @returns The setting field.
     */
    setClass(className: string | string[]): ISettingItemFluentAPI;

    /**
     * Sets the name of the setting field.
     * @param name The name of the setting field
     * or a document fragment, which will be append to the name element.
     * @returns The setting field.
     */
    setName(name: string | DocumentFragment): ISettingItemFluentAPI;

    /**
     * Sets the description of the setting field.
     * @param description The description of the setting field
     * or a document fragment, which will be append to the description element.
     * @returns The setting field.
     */
    setDescription(
        description: string | DocumentFragment,
    ): ISettingItemFluentAPI;

    /**
     * Sets the content of the display element.
     * @param display The content of the display element
     * or a document fragment, which will be append to the display element.
     * @returns The setting field.
     */
    setDisplay(display: string | DocumentFragment): ISettingItemFluentAPI;

    /**
     * Disables or enables the setting field.
     * @param shouldDisabled Whether the setting field should be disabled.
     * @returns The setting field.
     */
    setDisabled(shouldDisabled: boolean): ISettingItemFluentAPI;

    /**
     * Adds a setting field to the setting.
     * @param settingField The setting field to add.
     * @param configure A function that configures the setting field.
     * @returns The setting field.
     */
    add<Type extends new (...args: unknown[]) => unknown>(
        settingField: Type,
        configure: ConstructorParameters<Type>[1],
    ): ISettingItemFluentAPI;

    /**
     * Method for modifying the setting field.
     * @param callback The callback function, which will be called
     * to modify the setting.
     * @returns The setting field.
     */
    then(
        callback: (settingField: ISettingItem) => ISettingItemFluentAPI,
    ): ISettingItemFluentAPI;
}
