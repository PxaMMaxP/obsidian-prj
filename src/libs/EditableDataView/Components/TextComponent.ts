import { setIcon } from "obsidian";

export default class TextComponent {
    public get container(): HTMLElement {
        return this._container;
    }
    private _container: HTMLElement;
    private label: HTMLElement;
    private input: HTMLInputElement;
    private editButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private saveButton: HTMLButtonElement;
    private _value: string;
    private setOnSave: ((value: string) => Promise<void>) | undefined;

    constructor() {
        this._container = document.createElement('div');
        this._container.classList.add('editable-data-view');
        this._container.classList.add('editable-text-input');

        this.label = document.createElement('label');
        this._container.appendChild(this.label);
        this.label.classList.add('editable-data-view');
        this.label.classList.add('text-input-sizer');

        this.input = document.createElement('input');
        this.label.appendChild(this.input);
        this.input.classList.add('editable-data-view');
        this.input.classList.add('text-input');
        this.input.oninput = () => {
            this.label.dataset.value = this.input.value;
        }
        this.input.readOnly = true;

        this.editButton = document.createElement('button');
        this._container.appendChild(this.editButton);
        this.editButton.classList.add('editable-data-view');
        this.editButton.classList.add('button');
        setIcon(this.editButton, 'pencil');
        const editCallback = this.onEdit.bind(this);
        this.editButton.addEventListener('click', editCallback);

        this.cancelButton = document.createElement('button');
        this._container.appendChild(this.cancelButton);
        this.cancelButton.classList.add('editable-data-view');
        this.cancelButton.classList.add('button');
        this.cancelButton.classList.add('hidden');
        setIcon(this.cancelButton, 'x');
        const cancelCalback = this.onCancel.bind(this);
        this.cancelButton.addEventListener('click', cancelCalback);

        this.saveButton = document.createElement('button');
        this._container.appendChild(this.saveButton);
        this.saveButton.classList.add('editable-data-view');
        this.saveButton.classList.add('button');
        this.saveButton.classList.add('hidden');
        setIcon(this.saveButton, 'check');
        const saveCallback = this._onSave.bind(this);
        this.saveButton.addEventListener('click', saveCallback);
    }

    private onCancel() {
        this.label.dataset.value = this._value;
        this.input.value = this._value;
        this.offEdit();
    }

    private async _onSave() {
        if (this.setOnSave) {
            await this.setOnSave(this.input.value);
            this.offEdit();
        }
    }

    private onEdit() {
        console.log('edit');
        this.input.readOnly = false;
        this.editButton.classList.add('hidden');
        this.cancelButton.classList.remove('hidden');
        this.saveButton.classList.remove('hidden');
        this._value = this.input.value;
        this.input.focus();
    }

    private offEdit() {
        this.input.readOnly = true;
        this.editButton.classList.remove('hidden');
        this.cancelButton.classList.add('hidden');
        this.saveButton.classList.add('hidden');
    }

    public setPlaceholder(placeholder: string): TextComponent {
        this.label.dataset.value = placeholder;
        this.input.placeholder = placeholder;
        return this;
    }

    public setValue(value: string): TextComponent {
        this.input.value = value;
        this.label.dataset.value = value;
        return this;
    }

    public onSave(callback: (value: string) => Promise<void>): TextComponent {
        this.setOnSave = callback;
        return this;
    }
}
