import { Component } from 'obsidian';
import BaseComponent from './BaseComponent';

/**
 * Represents a date component in an editable data view.
 */
export default class DateComponent extends BaseComponent {
    //#region base properties
    protected _editabilityEnabled = false;
    onEnableEditCallback: () => void;
    onDisableEditCallback: () => void;
    onSaveCallback: () => Promise<void>;
    onFirstEdit: () => void;
    onFinalize: () => void;
    //#endregion
    //#region extended properties
    private _onPresentation: (value: string) => string;
    private _onSave: (value: string) => Promise<void>;
    private _value: string;
    private _title: string;
    //#endregion
    //#region HTML Elements
    private _presentationSpan: HTMLElement;
    private _input: HTMLInputElement;
    //#endregion

    /**
     * Creates a new instance of the DateComponent class.
     * @param component The component to associate with the DateComponent.
     */
    constructor(component: Component) {
        super(component);
        this.onFinalize = this.build;
        this.onFirstEdit = this.buildInput;
        this.onEnableEditCallback = this.enableEdit;
        this.onSaveCallback = this.save;
        this.onDisableEditCallback = this.disableEdit;
    }

    //#region Configuration methods
    /**
     * Enables the editability of the component.
     * @returns The component itself.
     */
    public enableEditability(): DateComponent {
        this._editabilityEnabled = true;

        return this;
    }

    /**
     * Sets the value of the component.
     * @param value The value to set.
     * @returns The component itself.
     */
    public setValue(value: string): DateComponent {
        this._value = value;

        return this;
    }

    /**
     * Sets the title of the component.
     * @param title The title to set.
     * @returns The component itself.
     */
    public setTitle(title: string): DateComponent {
        this._title = title;

        return this;
    }

    /**
     * Sets the formator of the component.
     * @param formator The formator to set.
     * @returns The component itself.
     * @remarks The formator is called when the component changes in `not-edit` mode.
     */
    public setFormator(formator: (value: string) => string): DateComponent {
        this._onPresentation = formator;

        return this;
    }

    /**
     * Sets the saver of the component.
     * @param callback The saver to set.
     * @returns The component itself.
     * @remarks The saver is called when the component save button is clicked.
     */
    public onSave(callback: (value: string) => Promise<void>) {
        this._onSave = callback;

        return this;
    }
    //#endregion

    //#region Base Callbacks
    /**
     * Builds the presentation span for the component.
     */
    private build() {
        this._presentationSpan = document.createElement('span');
        this._presentationContainer.appendChild(this._presentationSpan);

        this._presentationSpan.title = this._title;
        this._presentationSpan.classList.add('editable-data-view');
        this._presentationSpan.classList.add('date-presentation');

        this._presentationSpan.textContent = this._onPresentation
            ? this._onPresentation(this._value)
            : this._value;
    }

    /**
     * Builds the input element for the component.
     */
    private buildInput() {
        this._input = document.createElement('input');
        this._dataInputContainer.appendChild(this._input);
        this._input.type = 'date';
        this._input.title = this._title;
        this._input.classList.add('editable-data-view');
        this._input.classList.add('date-input');
    }

    /**
     * Enables the edit mode for the component.
     */
    private enableEdit() {
        this._input.value = this._value ? this._value : '';
        this._input.focus();
        this._input.select();
    }

    /**
     * Disables the edit mode for the component.
     */
    private disableEdit() {
        this._presentationSpan.textContent = this._onPresentation
            ? this._onPresentation(this._value)
            : this._value;
    }

    /**
     * Saves the value of the component.
     */
    private async save(): Promise<void> {
        this._value = this._input.value;
        await this._onSave?.(this._value);
    }
    //#endregion
}
