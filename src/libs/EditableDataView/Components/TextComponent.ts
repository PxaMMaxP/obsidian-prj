import { Component, setIcon } from "obsidian";
import BaseComponent from "./BaseComponent";

export default class TextComponent extends BaseComponent {
    //#region HTML Elements
    private _container: HTMLElement;
    private label: HTMLElement;
    private input: HTMLInputElement;
    private suggestionDataList: HTMLDataListElement;
    private placeholderSpan: HTMLElement;
    private editButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private saveButton: HTMLButtonElement;
    //#endregion
    //#region Properties
    private _value: string;
    private _placeholder: string;
    private _suggestions: string[];
    private _editabilityEnabled = true;
    private _isFirstEdit = true;
    //#endregion
    //#region Callbacks
    private onSaveCallback: ((value: string) => Promise<void>) | undefined;
    private onChangeCallback: ((value: string) => Promise<string[]>) | undefined;
    //#endregion

    constructor(component: Component) {
        super(component);
    }

    private cancelChanges() {
        this.label.dataset.value = this._value;
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
        this.input.blur();
        this.editButton.classList.remove('hidden');
        this.cancelButton.classList.add('hidden');
        this.saveButton.classList.add('hidden');
    }

    public setPlaceholder(placeholder: string) {
        this._placeholder = placeholder;
        return this;
    }

    private _setPlaceholder() {
        if (!this._placeholder)
            return;
        this.label.dataset.value = this._placeholder;
        this.input.placeholder = this._placeholder;
    }

    public setSuggestions(suggestions: string[]) {
        this._suggestions = suggestions;
        return this;
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

    private overwriteSuggestions(suggestions: string[]) {
        this.suggestionDataList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            this.suggestionDataList.appendChild(option);
        });
        return this;
    }

    public setOnChange(callback: (value: string) => Promise<string[]>) {
        this.onChangeCallback = callback;
        return this;
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

    public setValue(value: string) {
        this._value = value;
        return this;
    }

    private _setValue() {
        if (!this._value)
            return;
        this.label.dataset.value = this._value;
        this.input.value = this._value;
    }

    public onSave(callback: (value: string) => Promise<void>) {
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
        this._container.classList.add('editable-text-input');

        this.placeholderSpan = document.createElement('span');
        this._container.appendChild(this.placeholderSpan);
        this.placeholderSpan.classList.add('editable-data-view');
        this.placeholderSpan.classList.add('text-placeholder');
        this.placeholderSpan.textContent = this._value;

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

        this.label = document.createElement('label');
        this._container.insertBefore(this.label, this.editButton);
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
