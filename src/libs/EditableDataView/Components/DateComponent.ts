import { Component, setIcon } from "obsidian";
import BaseComponent from "./BaseComponent";
import Global from "src/classes/Global";

export default class DateComponent extends BaseComponent {
    private moment = require('moment');
    //#region HTML Elements
    private _container: HTMLElement;
    private input: HTMLInputElement;
    private placeholderSpan: HTMLElement;
    private editButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private saveButton: HTMLButtonElement;
    //#endregion
    //#region Properties
    private _value: string;
    private _placeholder: string;
    private _DateFormat: string;
    private _editabilityEnabled = true;
    private _isFirstEdit = true;
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
        if (this._isFirstEdit) {
            this.onFirstEdit();
        }

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

    public disableEditability() {
        this._editabilityEnabled = false;
        return this;
    }

    public setDateFormat(format: string): DateComponent {
        this._DateFormat = format;
        return this;
    }

    public finalize(): void {
        this._container = document.createElement('div');
        this._baseContainer.appendChild(this._container);
        this._container.classList.add('editable-data-view');
        this._container.classList.add('editable-date-input');

        this.placeholderSpan = document.createElement('span');
        this._container.appendChild(this.placeholderSpan);
        this.placeholderSpan.classList.add('editable-data-view');
        this.placeholderSpan.classList.add('date-placeholder');
        if (!this._DateFormat) {
            this._DateFormat = Global.getInstance().settings.dateFormat;
        }
        this.placeholderSpan.textContent = this.moment(this._value).format(this._DateFormat);

        if (this._editabilityEnabled) {
            this.editButton = document.createElement('button');
            this._container.appendChild(this.editButton);
            this.editButton.classList.add('editable-data-view');
            this.editButton.classList.add('button');
            setIcon(this.editButton, 'pencil');
            this.component.registerDomEvent(this.editButton, 'click', () => this.enableEdit());
        }
    }

    private onFirstEdit() {
        this._container.removeChild(this.placeholderSpan);

        this.input = document.createElement('input');
        this._container.insertBefore(this.input, this.editButton);
        this.input.type = 'date';
        this.input.classList.add('editable-data-view');
        this.input.classList.add('date-input');
        this.input.readOnly = true;

        this._setValue();
        this._setPlaceholder();

        this.cancelButton = document.createElement('button');
        this._container.insertAfter(this.cancelButton, this.editButton);
        this.cancelButton.classList.add('editable-data-view');
        this.cancelButton.classList.add('button');
        this.cancelButton.classList.add('hidden');
        setIcon(this.cancelButton, 'x');
        this.component.registerDomEvent(this.cancelButton, 'click', () => this.cancelChanges());

        this.saveButton = document.createElement('button');
        this._container.insertAfter(this.saveButton, this.cancelButton);
        this.saveButton.classList.add('editable-data-view');
        this.saveButton.classList.add('button');
        this.saveButton.classList.add('hidden');
        setIcon(this.saveButton, 'check');
        this.component.registerDomEvent(this.saveButton, 'click', () => this.saveChanges());

        this._isFirstEdit = false;
    }
}