import { Component } from 'obsidian';
import BaseComponent from './BaseComponent';

/**
 * Represents a dropdown component that extends the base component.
 */
export default class DropdownComponent extends BaseComponent {
    //#region base properties
    protected _editabilityEnabled = false;
    onEnableEditCallback: () => void;
    onDisableEditCallback: () => void;
    onSaveCallback: () => Promise<void>;
    onFirstEdit: () => void;
    onFinalize: () => void;
    //#endregion
    //#region extended properties
    private _onPresentation: (value: string) => Promise<void> | undefined;
    private _onSave: (value: string) => Promise<void>;
    private _value: string;
    private _options: { value: string; text: string }[];
    /**
     * Gets the selected option of the dropdown component.
     */
    private get _selectedOption(): { value: string; text: string } {
        const selectedOption = this._options.find(
            (o) => o.value === this._value,
        );

        if (selectedOption) return selectedOption;

        return { value: this._value, text: this._value };
    }
    private _title: string;
    //#endregion
    //#region HTML Elements
    private _presentationSpan: HTMLElement;
    private _select: HTMLSelectElement;
    //#endregion

    /**
     * Creates a new instance of the DropdownComponent class.
     * @param component The component to attach the dropdown to.
     */
    constructor(component: Component) {
        super(component);
        this.onFinalize = this.build;
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
    public enableEditability() {
        this._editabilityEnabled = true;

        return this;
    }

    /**
     * Sets the value of the component.
     * @param value The value to set.
     * @returns The component itself.
     */
    public setValue(value: string) {
        this._value = value;

        return this;
    }

    /**
     * Sets the options of the component.
     * @param options The options to set.
     * @returns The component itself.
     */
    public setOptions(options: { value: string; text: string }[]) {
        this._options = options;

        return this;
    }

    /**
     * Sets the title of the component.
     * @param title The title to set.
     * @returns The component itself.
     */
    public setTitle(title: string) {
        this._title = title;

        return this;
    }

    /**
     * Sets the formator of the component.
     * @param formator The formator to set.
     * @returns The component itself.
     * @remarks - The formator is called when the component change in `not-edit` mode.
     * - `value` is the value of the selected option. (Not the text!)
     */
    public setFormator(
        formator: (value: string) => { text: string; html?: DocumentFragment },
    ) {
        /**
         * Sets the presentation of the component.
         * @param value The value to set.
         */
        this._onPresentation = async (value: string): Promise<void> => {
            const { text, html } = formator(value);

            if (html) {
                this._presentationSpan.innerHTML = '';
                this._presentationSpan.appendChild(html);
            } else {
                this._presentationSpan.textContent = text;
            }
        };

        return this;
    }

    /**
     * Sets the saver of the component.
     * @param callback The saver to set.
     * @returns The component itself.
     * @remarks - The saver is called when the component save button is clicked.
     * - `value` is the value of the selected option. (Not the text!)
     */
    public onSave(callback: (value: string) => Promise<void>) {
        this._onSave = callback;

        return this;
    }
    //#endregion

    /**
     * Enables the options of the dropdown component.
     */
    private enableOptions() {
        const optionFound = this._options.find((o) => o.value === this._value);

        if (!optionFound) {
            const optionElement = document.createElement('option');
            optionElement.value = this._value;
            optionElement.textContent = `${this._value} (not in options)`;
            this._select.appendChild(optionElement);
        }

        this._options.forEach((option) => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            this._select.appendChild(optionElement);
        });
    }

    /**
     * Disables the options of the dropdown component.
     */
    private disableOptions() {
        this._select.innerHTML = '';
    }

    //#region Base Callbacks
    /**
     * Builds the presentation of the dropdown component.
     */
    private build() {
        this._presentationSpan = document.createElement('span');
        this._presentationContainer.appendChild(this._presentationSpan);

        this._presentationSpan.title = this._title;
        this._presentationSpan.classList.add('editable-data-view');
        this._presentationSpan.classList.add('text-presentation');
        this._onPresentation?.(this._selectedOption.value);
        //this.presentationSpan.textContent = this._onPresentation ? this._onPresentation(this._selectedOption.value) : this._selectedOption.text;
    }

    /**
     * Builds the input of the dropdown component.
     */
    private buildInput() {
        this._select = document.createElement('select');
        this._dataInputContainer.appendChild(this._select);
        this._select.title = this._title;
        this._select.classList.add('editable-data-view');
        this._select.classList.add('select-input');
    }

    /**
     * Enables the edit mode of the dropdown component.
     */
    private enableEdit() {
        this.enableOptions();
        this._select.value = this._value ? this._value : '';
        this._select.focus();
    }

    /**
     * Disables the edit mode of the dropdown component.
     */
    private disableEdit() {
        this._onPresentation?.(this._selectedOption.value);
        //this.presentationSpan.textContent = this._onPresentation ? this._onPresentation(this._selectedOption.value) : this._selectedOption.text;
        this.disableOptions();
    }

    /**
     * Saves the value of the dropdown component.
     */
    private async save(): Promise<void> {
        this._value = this._select.value;
        await this._onSave?.(this._value);
    }
    //#endregion
}
