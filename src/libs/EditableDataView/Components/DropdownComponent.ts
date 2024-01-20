import { Component } from 'obsidian';
import BaseComponent from './BaseComponent';

export default class DropdownComponent extends BaseComponent {
    //#region base properties
    protected editabilityEnabled = false;
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
    private presentationSpan: HTMLElement;
    private select: HTMLSelectElement;
    //#endregion

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
        this.editabilityEnabled = true;

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
        this._onPresentation = async (value: string): Promise<void> => {
            const { text, html } = formator(value);

            if (html) {
                this.presentationSpan.innerHTML = '';
                this.presentationSpan.appendChild(html);
            } else {
                this.presentationSpan.textContent = text;
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

    private enableOptions() {
        const optionFound = this._options.find((o) => o.value === this._value);

        if (!optionFound) {
            const optionElement = document.createElement('option');
            optionElement.value = this._value;
            optionElement.textContent = `${this._value} (not in options)`;
            this.select.appendChild(optionElement);
        }

        this._options.forEach((option) => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            this.select.appendChild(optionElement);
        });
    }

    private disableOptions() {
        this.select.innerHTML = '';
    }

    //#region Base Callbacks
    private build() {
        this.presentationSpan = document.createElement('span');
        this.presentationContainer.appendChild(this.presentationSpan);

        this.presentationSpan.title = this._title;
        this.presentationSpan.classList.add('editable-data-view');
        this.presentationSpan.classList.add('text-presentation');
        this._onPresentation?.(this._selectedOption.value);
        //this.presentationSpan.textContent = this._onPresentation ? this._onPresentation(this._selectedOption.value) : this._selectedOption.text;
    }

    private buildInput() {
        this.select = document.createElement('select');
        this.dataInputContainer.appendChild(this.select);
        this.select.title = this._title;
        this.select.classList.add('editable-data-view');
        this.select.classList.add('select-input');
    }

    private enableEdit() {
        this.enableOptions();
        this.select.value = this._value ? this._value : '';
        this.select.focus();
    }

    private disableEdit() {
        this._onPresentation?.(this._selectedOption.value);
        //this.presentationSpan.textContent = this._onPresentation ? this._onPresentation(this._selectedOption.value) : this._selectedOption.text;
        this.disableOptions();
    }

    private async save(): Promise<void> {
        this._value = this.select.value;
        await this._onSave?.(this._value);
    }
    //#endregion
}
