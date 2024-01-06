import { Component, setIcon } from "obsidian";
import BaseComponent from "./BaseComponent";

export default class DateComponent extends BaseComponent {
    //#region HTML Elements
    private _container: HTMLElement;
    private input: HTMLInputElement;
    private editButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private saveButton: HTMLButtonElement;
    //#endregion
    //#region Properties
    private _value: string;
    protected _placeholder: string;
    //#endregion
    //#region Callbacks
    private onSaveCallback: ((value: string) => Promise<void>) | undefined;
    //#endregion

    constructor(component: Component) {
        super(component);
    }

    private cancelChanges() {
        this.input.value = this._value;
        this.disableEdit();
    }

    private async saveChanges() {
        if (this.onSaveCallback) {
            await this.onSaveCallback(this.input.value);
        }
        this.disableEdit();
    }

    private enableEdit() {
        console.log('edit');
        this.input.readOnly = false;
        this.editButton.classList.add('hidden');
        this.cancelButton.classList.remove('hidden');
        this.saveButton.classList.remove('hidden');
        this._value = this.input.value;
        this.input.focus();
    }

    private disableEdit() {
        this.input.readOnly = true;
        this.editButton.classList.remove('hidden');
        this.cancelButton.classList.add('hidden');
        this.saveButton.classList.add('hidden');
    }

    public setPlaceholder(placeholder: string): DateComponent {
        this._placeholder = placeholder;
        return this;
    }

    private _setPlaceholder() {
        this.input.placeholder = this._placeholder;
    }

    public setValue(value: string): DateComponent {
        this._value = value;
        return this;
    }

    private _setValue() {
        this.input.value = this._value;
    }

    public onSave(callback: (value: string) => Promise<void>): DateComponent {
        this.onSaveCallback = callback;
        return this;
    }

    public finalize(): void {
        this._container = document.createElement('div');
        this._baseContainer.appendChild(this._container);
        this._container.classList.add('editable-data-view');
        this._container.classList.add('editable-date-input');

        this.input = document.createElement('input');
        this._container.appendChild(this.input);
        this.input.type = 'date';
        this.input.classList.add('editable-data-view');
        this.input.classList.add('date-input');
        this.input.readOnly = true;

        this._setValue();
        this._setPlaceholder();

        this.editButton = document.createElement('button');
        this._container.appendChild(this.editButton);
        this.editButton.classList.add('editable-data-view');
        this.editButton.classList.add('button');
        setIcon(this.editButton, 'pencil');
        this.component.registerDomEvent(this.editButton, 'click', () => this.enableEdit());

        this.cancelButton = document.createElement('button');
        this._container.appendChild(this.cancelButton);
        this.cancelButton.classList.add('editable-data-view');
        this.cancelButton.classList.add('button');
        this.cancelButton.classList.add('hidden');
        setIcon(this.cancelButton, 'x');
        this.component.registerDomEvent(this.cancelButton, 'click', () => this.cancelChanges());

        this.saveButton = document.createElement('button');
        this._container.appendChild(this.saveButton);
        this.saveButton.classList.add('editable-data-view');
        this.saveButton.classList.add('button');
        this.saveButton.classList.add('hidden');
        setIcon(this.saveButton, 'check');
        this.component.registerDomEvent(this.saveButton, 'click', () => this.saveChanges());
    }
}