import { Component } from "obsidian";
import BaseComponent from "./BaseComponent";

export default class TextComponent extends BaseComponent {
    //#region base properties
    protected editabilityEnabled = false;
    onEnableEditCallback: () => void;
    onDisableEditCallback: () => void;
    onSaveCallback: () => Promise<void>;
    onFirstEdit: () => void;
    onFinalize: () => void;
    //#endregion
    //#region extended properties
    private _onPresentation: (value: string) => string;
    private _onSave: ((value: string) => Promise<void>);
    private _value: string;
    private _placeholder: string;
    private _title: string;
    //#endregion
    //#region HTML Elements
    private presentationSpan: HTMLElement;
    private label: HTMLElement;
    private input: HTMLInputElement;
    //#endregion

    constructor(component: Component) {
        super(component);
        this.onFinalize = this.build
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
    public enableEditability(): TextComponent {
        this.editabilityEnabled = true;
        return this;
    }

    /**
     * Sets the value of the component.
     * @param value The value to set.
     * @returns The component itself.
     */
    public setValue(value: string): TextComponent {
        this._value = value;
        return this;
    }

    /**
     * Sets the placeholder of the input element.
     * @param placeholder The placeholder to set.
     * @returns The component itself.
     */
    public setPlaceholder(placeholder: string) {
        this._placeholder = placeholder;
        return this;
    }

    /**
     * Sets the title of the component.
     * @param title The title to set.
     * @returns The component itself.
     */
    public setTitle(title: string): TextComponent {
        this._title = title;
        return this;
    }

    /**
     * Sets the formator of the component.
     * @param formator The formator to set.
     * @returns The component itself.
     * @remarks The formator is called when the component change in `not-edit` mode.
     */
    public setFormator(formator: (value: string) => string): TextComponent {
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
    private build() {
        this.presentationSpan = document.createElement('span');
        this.presentationContainer.appendChild(this.presentationSpan);

        this.presentationSpan.title = this._title;
        this.presentationSpan.classList.add('editable-data-view');
        this.presentationSpan.classList.add('text-presentation');
        this.presentationSpan.textContent = this._onPresentation ? this._onPresentation(this._value) : this._value;
    }

    private buildInput() {
        this.label = document.createElement('label');
        this.label.title = this._title;
        this.dataInputContainer.appendChild(this.label);
        this.label.classList.add('editable-data-view');
        this.label.classList.add('text-input-sizer');

        this.input = document.createElement('input');
        this.label.appendChild(this.input);
        this.input.classList.add('editable-data-view');
        this.input.classList.add('text-input');
        this.input.placeholder = this._placeholder ? this._placeholder : '';
        this.component.registerDomEvent(this.input, 'input', () => {
            this.label.dataset.value = this.input.value ? this.input.value : this._placeholder ? this._placeholder : '';
        });
    }

    private enableEdit() {
        this.input.value = this._value ? this._value : '';
        this.label.dataset.value = this._value ? this._value : this._placeholder ? this._placeholder : '';
        this.input.focus();
        this.input.select();
    }

    private disableEdit() {
        this.presentationSpan.textContent = this._onPresentation ? this._onPresentation(this._value) : this._value;
    }

    private async save(): Promise<void> {
        this._value = this.input.value;
        await this._onSave?.(this._value);
    }
    //#endregion
}
