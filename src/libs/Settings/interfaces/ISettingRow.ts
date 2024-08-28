/* eslint-disable jsdoc/check-tag-names */
import { Component } from 'obsidian';
import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import { IModal } from 'src/libs/Modals/Modal/interfaces/IModal';
import { ISettingColumnTagNameMap } from '../SettingColumns/interfaces/ISettingColumnTagNameMap';
import { SettingColumnConfigurator } from '../SettingColumns/types/General';

export type SettingConfigurator = (setting: ISettingRowFluentApi) => void;

/**
 * Static interface for a setting row.
 */
export interface ISettingRow_ {
    /**
     * Creates a new setting row.
     * @param parentModal The `ICustomModal` instance that the setting row belongs to.
     * @param configure A function that configures the setting row {@link ISettingRow.onload|on load}.
     * @param parentContainerEl The container element to add the setting row.
     * Only if `modal` is `undefined`.
     * @param parentComponent The component that the setting row belongs to.
     * It is used to register the setting block as a child of the component.
     * Only if `modal` is `undefined`.
     */
    new (
        parentModal: IModal | undefined,
        configure?: SettingConfigurator,
        parentContainerEl?: HTMLElement | DocumentFragment,
        parentComponent?: Component,
    ): ISettingRow;
}

/**
 * Protected interface for setting row.
 */
export interface ISettingRowProtected extends ISettingRowFluentApi {
    /**
     * The container element of
     * this whole setting row **Parent**.
     */
    get parentContainerEl(): HTMLElement | DocumentFragment;

    /**
     * The component that the setting row belongs to.
     */
    get parentComponent(): Component;

    /**
     * The `ICustomModal` instance that the setting row belongs to.
     */
    get parentModal(): IModal | undefined;
}

/**
 * Main interface for setting row.
 */
export interface ISettingRow extends IDIComponent {
    /**
     * The container element of
     * this whole setting row.
     * @parent of {@link infoEl}, {@link displayEl} and {@link inputEl}.
     * @child of {@link containerEl} as append.
     */
    get settingRowEl(): HTMLElement;

    /**
     * The element as container of
     * `nameEl` and `descriptionEl`.
     * @parent of {@link nameEl} and {@link descriptionEl}.
     * @child of {@link settingRowEl} as the first child.
     */
    get infoEl(): HTMLElement;

    /**
     * The element which contains
     * the name of the setting row.
     * @child of {@link infoEl} as the first child.
     */
    get nameEl(): HTMLElement;

    /**
     * The element which contains
     * the description of the setting row.
     * @child of {@link infoEl} as the last child.
     */
    get descriptionEl(): HTMLElement;

    /**
     * The element as container of
     * optional outputs of the row.
     * @child of {@link settingRowEl} as the middle child.
     */
    get displayEl(): HTMLElement;

    /**
     * The element as container of
     * the input field.
     * @child of {@link settingRowEl} as the last child.
     */
    get inputEl(): HTMLElement;

    /**
     * Apply the {@link SettingConfigurator} to the setting row.
     */
    onload(): void;
}

/**
 *
 */
export interface ISettingRowFluentApi extends ISettingRow {
    /**
     * Sets the class name of the setting row.
     * @param className The class name of the setting row.
     * @returns The setting row.
     */
    setClass(className: string | string[]): ISettingRowFluentApi;

    /**
     * Sets the name of the setting row.
     * @param name The name of the setting row
     * or a document fragment, which will be append to the name element.
     * @returns The setting row.
     */
    setName(name: string | DocumentFragment): ISettingRowFluentApi;

    /**
     * Sets the description of the setting row.
     * @param description The description of the setting row
     * or a document fragment, which will be append to the description element.
     * @returns The setting row.
     */
    setDescription(
        description: string | DocumentFragment,
    ): ISettingRowFluentApi;

    /**
     * Sets the content of the display element.
     * @param display The content of the display element
     * or a document fragment, which will be append to the display element.
     * @returns The setting row.
     */
    setDisplay(display: string | DocumentFragment): ISettingRowFluentApi;

    /**
     * Disables or enables the setting row.
     * @param shouldDisabled Whether the setting row should be disabled.
     * @returns The setting row.
     */
    setDisabled(shouldDisabled: boolean): ISettingRowFluentApi;

    /**
     * Adds a setting row to the setting.
     * @param settingField The setting row to add.
     * @param configure A function that configures the setting row.
     * @returns The setting row.
     */
    add<Type extends new (...args: unknown[]) => unknown>(
        settingField: Type,
        configure: ConstructorParameters<Type>[1],
    ): ISettingRowFluentApi;

    /**
     * Adds a setting row to the setting.
     * @param settingFieldTag The setting row to add. It should be a key of {@link ISettingColumnTagNameMap}.
     * @param configure A function that configures the setting row.
     * @returns The setting row.
     */
    add<Tag extends keyof ISettingColumnTagNameMap>(
        settingFieldTag: Tag,
        configure: SettingColumnConfigurator<ISettingColumnTagNameMap[Tag]>,
    ): ISettingRowFluentApi;

    /**
     * Method for modifying the setting row.
     * @param callback The callback function, which will be called
     * to modify the setting.
     * @returns The setting row.
     */
    then(
        callback: (settingField: ISettingRow) => ISettingRowFluentApi,
    ): ISettingRowFluentApi;
}
