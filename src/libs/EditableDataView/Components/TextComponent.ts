import { Component, setIcon } from "obsidian";
import BaseComponent from "./BaseComponent";

export default class TextComponent<T extends TextComponent<any>> extends BaseComponent {
    //#region HTML Elements
    protected _container: HTMLElement;
    protected label: HTMLElement;
    protected input: HTMLInputElement;
    protected suggestionDataList: HTMLDataListElement;
    protected editButton: HTMLButtonElement;
    protected cancelButton: HTMLButtonElement;
    protected saveButton: HTMLButtonElement;
    //#endregion
    //#region Properties
    protected _value: string;
    protected _placeholder: string;
    protected _suggestions: string[];
    //#endregion
    //#region Callbacks
    protected onSaveCallback: ((value: string) => Promise<void | { href: string, text: string }>) | undefined;
    protected onChangeCallback: ((value: string) => Promise<string[]>) | undefined;
    //#endregion

    constructor(component: Component) {
        super(component);
    }

    protected cancelChanges() {
        this.label.dataset.value = this._value;
        this.input.value = this._value;
        this.disableEdit();
    }

    protected async saveChanges() {
        if (this.onSaveCallback) {
            await this.onSaveCallback(this.input.value);
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
        this._placeholder = placeholder;
        return this as unknown as T;
    }

    private _setPlaceholder() {
        if (!this._placeholder)
            return;
        this.label.dataset.value = this._placeholder;
        this.input.placeholder = this._placeholder;
    }

    public setSuggestions(suggestions: string[]): T {
        this._suggestions = suggestions;
        return this as unknown as T;
    }

    private _setSuggestions() {
        if (!this._suggestions)
            return;
        const suggestions = this._suggestions;
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
        this.onChangeCallback = callback;
        return this as unknown as T;
    }

    private _setOnChange() {
        if (!this.onChangeCallback)
            return;
        this.component.registerDomEvent(this.input, 'input', async () => {
            if (!this.onChangeCallback)
                return;
            const suggestions = await this.onChangeCallback(this.input.value);
            this.overwriteSuggestions(suggestions);
        });
    }

    public setValue(value: string): T {
        this._value = value;
        return this as unknown as T;
    }

    private _setValue() {
        if (!this._value)
            return;
        this.label.dataset.value = this._value;
        this.input.value = this._value;
    }

    public onSave(callback: (value: string) => Promise<void | { href: string, text: string }>): T {
        this.onSaveCallback = callback;
        return this as unknown as T;
    }

    public finalize(): void {
        this._container = document.createElement('div');
        this._baseContainer.appendChild(this._container);
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
        this.component.registerDomEvent(this.input, 'input', () => {
            this.label.dataset.value = this.input.value;
        });
        this.input.readOnly = true;

        this._setPlaceholder();
        this._setValue();
        this._setSuggestions();
        this._setOnChange();

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
