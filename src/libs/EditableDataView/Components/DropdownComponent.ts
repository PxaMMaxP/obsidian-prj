import { Component, setIcon } from "obsidian";
import BaseComponent from "./BaseComponent";

export default class DropdownComponent extends BaseComponent {
    //#region HTML Elements
    private _container: HTMLElement;
    private select: HTMLSelectElement;
    private placeholderSpan: HTMLElement;
    private editButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private saveButton: HTMLButtonElement;
    //#endregion
    //#region Properties
    private _value: string;
    private options: { value: string, text: string }[] = [];
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
        this.select.value = this._value;
        this.disableEdit();
    }

    private async saveChanges() {
        this._value = this.select.value;
        if (this.onSaveCallback) {
            await this.onSaveCallback(this._value);
        }
        this.disableEdit();
    }

    private enableEdit() {
        if (this._isFirstEdit) {
            this.onFirstEdit();
        }

        this.enableOptions();
        this.select.value = this._value;
        this.select.disabled = false;
        this.editButton.classList.add('hidden');
        this.cancelButton.classList.remove('hidden');
        this.saveButton.classList.remove('hidden');
        this.select.focus();
    }

    private disableEdit() {
        this.disableOptions();
        this.select.disabled = true;
        this.editButton.classList.remove('hidden');
        this.cancelButton.classList.add('hidden');
        this.saveButton.classList.add('hidden');
    }

    public setOptions(options: { value: string, text: string }[]): DropdownComponent {
        this.options = options;
        return this;
    }

    private _setOptions() {
        this.disableOptions();
    }

    private enableOptions() {
        this.select.innerHTML = "";
        this.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.text = option.text;
            this.select.appendChild(optionElement);
        });
    }

    private disableOptions(selectedOption: string = this._value) {
        const options = Array.from(this.select.children);
        let optionFound = false;
        options.forEach(option => {
            if (option instanceof HTMLOptionElement && option.value !== selectedOption) {
                option.remove();
                optionFound = true;
            }
        });
        if (!optionFound) {
            this.options.forEach(option => {
                if (option.value === selectedOption) {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.text = option.text;
                    this.select.appendChild(optionElement);
                }
            });
        }
    }

    public setValue(value: string): DropdownComponent {
        this._value = value;
        return this;
    }

    private _setValue() {
        this.select.value = this._value;
    }

    public onSave(callback: (value: string) => Promise<void>): DropdownComponent {
        this.onSaveCallback = callback;
        return this;
    }

    public disableEditability() {
        this._editabilityEnabled = false;
        return this;
    }

    public finalize(): void {
        this._container = document.createElement('div');
        this._baseContainer.appendChild(this._container);
        this._container.classList.add('editable-data-view');
        this._container.classList.add('editable-select-input');

        this.placeholderSpan = document.createElement('span');
        this._container.appendChild(this.placeholderSpan);
        this.placeholderSpan.classList.add('editable-data-view');
        this.placeholderSpan.classList.add('dropdown-placeholder');
        this.options.forEach(option => {
            if (option.value === this._value) {
                this.placeholderSpan.textContent = option.text;
            }
        });

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

        this.select = document.createElement('select');
        this._container.insertBefore(this.select, this.editButton);
        this.select.classList.add('editable-data-view');
        this.select.classList.add('select-input');
        this.select.disabled = true;

        this._setOptions();
        this._setValue();

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