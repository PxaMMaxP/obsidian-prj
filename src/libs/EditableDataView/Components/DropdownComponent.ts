import { setIcon } from "obsidian";
import BaseComponent from "./BaseComponent";

export default class DropdownComponent extends BaseComponent {
    private _container: HTMLElement;
    private select: HTMLSelectElement;
    private editButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private saveButton: HTMLButtonElement;
    private options: { value: string, text: string }[] = [];
    private _value: string;
    private setOnSave: ((value: string) => Promise<void>) | undefined;

    constructor() {
        super();
        this._container = document.createElement('div');
        this.container.appendChild(this._container);
        this._container.classList.add('editable-data-view');
        this._container.classList.add('editable-select-input');

        this.select = document.createElement('select');
        this._container.appendChild(this.select);
        this.select.classList.add('editable-data-view');
        this.select.classList.add('select-input');
        this.select.disabled = true;

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
        this.select.value = this._value;
        this.disableEdit();
    }

    private async saveChanges() {
        this._value = this.select.value;
        if (this.setOnSave) {
            await this.setOnSave(this._value);
        }
        this.disableEdit();
    }

    private enableEdit() {
        console.log('edit');
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
        if (this._value) {
            this.disableOptions(this._value);
        }
        return this;
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
        this.disableOptions();
        return this;
    }

    public onSave(callback: (value: string) => Promise<void>): DropdownComponent {
        this.setOnSave = callback;
        return this;
    }
}