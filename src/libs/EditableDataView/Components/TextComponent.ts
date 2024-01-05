import { setIcon } from "obsidian";
import BaseComponent from "./BaseComponent";

export default class TextComponent<T extends TextComponent<any>> extends BaseComponent {
    protected _container: HTMLElement;
    protected label: HTMLElement;
    protected input: HTMLInputElement;
    protected suggestionDataList: HTMLDataListElement;
    protected editButton: HTMLButtonElement;
    protected cancelButton: HTMLButtonElement;
    protected saveButton: HTMLButtonElement;
    protected _value: string;
    protected setOnSave: ((value: string) => Promise<void | { href: string, text: string }>) | undefined;

    constructor() {
        super();
        this._container = document.createElement('div');
        this.container.appendChild(this._container);
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

    protected cancelChanges() {
        this.label.dataset.value = this._value;
        this.input.value = this._value;
        this.disableEdit();
    }

    protected async saveChanges() {
        if (this.setOnSave) {
            await this.setOnSave(this.input.value);
        }
        this.disableEdit();
    }

    protected enableEdit() {
        console.log('edit');
        this.input.readOnly = false;
        this.editButton.classList.add('hidden');
        this.cancelButton.classList.remove('hidden');
        this.saveButton.classList.remove('hidden');
        this._value = this.input.value;
        this.input.focus();
    }

    protected disableEdit() {
        this.input.readOnly = true;
        this.input.blur();
        this.editButton.classList.remove('hidden');
        this.cancelButton.classList.add('hidden');
        this.saveButton.classList.add('hidden');
    }

    public setPlaceholder(placeholder: string): T {
        this.label.dataset.value = placeholder;
        this.input.placeholder = placeholder;
        return this as unknown as T;
    }

    public setSuggestions(suggestions: string[]): T {
        const id = Math.random().toString(36).substring(2, 10);
        this.input.setAttribute('list', id);
        this.suggestionDataList = document.createElement('datalist');
        this.label.appendChild(this.suggestionDataList);
        this.suggestionDataList.id = id;
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            this.suggestionDataList.appendChild(option);
        });
        return this as unknown as T;
    }

    private overwriteSuggestions(suggestions: string[]): T {
        this.suggestionDataList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            this.suggestionDataList.appendChild(option);
        });
        return this as unknown as T;
    }

    public setOnChange(callback: (value: string) => Promise<string[]>): T {
        this.input.addEventListener('input', async () => {
            const suggestions = await callback(this.input.value);
            this.overwriteSuggestions(suggestions);
        });
        return this as unknown as T;
    }

    public setValue(value: string): T {
        this.input.value = value;
        this.label.dataset.value = value;
        return this as unknown as T;
    }

    public onSave(callback: (value: string) => Promise<void | { href: string, text: string }>): T {
        this.setOnSave = callback;
        return this as unknown as T;
    }
}
