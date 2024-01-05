import { setIcon } from "obsidian";
import BaseComponent from "./BaseComponent";

export default class DateComponent extends BaseComponent {
    private _container: HTMLElement;
    private input: HTMLInputElement;
    private editButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private saveButton: HTMLButtonElement;
    private _value: string;
    private setOnSave: ((value: string) => Promise<void>) | undefined;

    constructor() {
        super();
        this._container = document.createElement('div');
        this.container.appendChild(this._container);
        this._container.classList.add('editable-data-view');
        this._container.classList.add('editable-date-input');

        this.input = document.createElement('input');
        this._container.appendChild(this.input);
        this.input.type = 'date';
        this.input.classList.add('editable-data-view');
        this.input.classList.add('date-input');
        this.input.readOnly = true;

        this.editButton = document.createElement('button');
        this._container.appendChild(this.editButton);
        this.editButton.classList.add('editable-data-view');
        this.editButton.classList.add('button');
        setIcon(this.editButton, 'pencil');
        this.editButton.addEventListener('click', () => this.enableEdit());

        this.cancelButton = document.createElement('button');
        this._container.appendChild(this.cancelButton);
        this.cancelButton.classList.add('editable-data-view');
        this.cancelButton.classList.add('button');
        this.cancelButton.classList.add('hidden');
        setIcon(this.cancelButton, 'x');
        this.cancelButton.addEventListener('click', () => this.cancelChanges());

        this.saveButton = document.createElement('button');
        this._container.appendChild(this.saveButton);
        this.saveButton.classList.add('editable-data-view');
        this.saveButton.classList.add('button');
        this.saveButton.classList.add('hidden');
        setIcon(this.saveButton, 'check');
        this.saveButton.addEventListener('click', () => this.saveChanges());
    }

    private cancelChanges() {
        this.input.value = this._value;
        this.disableEdit();
    }

    private async saveChanges() {
        if (this.setOnSave) {
            await this.setOnSave(this.input.value);
            this.disableEdit();
        }
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
        this.input.placeholder = placeholder;
        return this;
    }

    public setValue(value: string): DateComponent {
        this.input.value = value;
        return this;
    }

    public onSave(callback: (value: string) => Promise<void>): DateComponent {
        this.setOnSave = callback;
        return this;
    }
}