import { Component } from 'obsidian';
import BaseComponent from './BaseComponent';

/**
 * Represents a link component that can be edited and displayed in different modes.
 */
export default class LinkComponent extends BaseComponent {
    //#region base properties
    protected _isEditable = false;
    onEnableEditCallback: () => void;
    onDisableEditCallback: () => void;
    onSaveCallback: () => Promise<void>;
    onFirstEdit: () => void;
    onFinalize: () => void;
    //#endregion
    //#region extended properties
    private _onPresentation: ((value: string) => Promise<void>) | undefined;
    private _onSave: ((value: string) => Promise<void>) | undefined;
    private _suggester: ((value: string) => string[]) | undefined;
    private _value: string;
    private _placeholder: string;
    private _suggestions: string[];
    private _title: string;
    private _linkType: 'tag' | 'file' | 'external' = 'external';
    //#endregion
    //#region HTML Elements
    private _link: HTMLAnchorElement;
    private _label: HTMLElement;
    private _input: HTMLInputElement;
    private _datalist: HTMLDataListElement;
    //#endregion

    /**
     * Creates a new instance of the LinkComponent.
     * @param component The Obsidian component to attach the link to.
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
        this._isEditable = true;

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
     * Sets the placeholder of the input element.
     * @param placeholder The placeholder to set.
     * @returns The component itself.
     */
    public setPlaceholder(placeholder: string) {
        this._placeholder = placeholder;

        return this;
    }

    /**
     * Sets suggestions for the input element.
     * @param suggestions The suggestions to set.
     * @returns The component itself.
     */
    public setSuggestions(suggestions: string[]) {
        this._suggestions = suggestions;

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
     * Sets the type of the link.
     * @param type The type to set. Can be `tag`, `file` or `external`.
     * @returns The component itself.
     */
    public setLinkType(type: 'tag' | 'file' | 'external') {
        this._linkType = type;

        return this;
    }

    /**
     * Sets the suggester of the component.
     * @param suggester The suggester to set.
     * @returns The component itself.
     * @remarks The suggester is called when the user types in the input element.
     */
    public setSuggester(suggester: (value: string) => string[]) {
        this._suggester = suggester;

        return this;
    }

    /**
     * Sets the formator of the component.
     * @param formator The formator to set.
     * @returns The component itself.
     * @remarks The formator is called when the component change in `not-edit` mode.
     */
    public setFormator(
        formator: (value: string) => {
            href: string;
            text: string;
            html?: DocumentFragment;
        },
    ) {
        /**
         * Sets the presentation of the component.
         * @param value The value to present.
         */
        this._onPresentation = async (value: string): Promise<void> => {
            const linkContent = formator(value);
            this._link.href = linkContent.href;

            if (linkContent.html) {
                this._link.innerHTML = '';
                this._link.appendChild(linkContent.html);
            } else this._link.textContent = linkContent.text;

            switch (this._linkType) {
                case 'tag':
                    break;
                case 'file':
                    this._link.setAttribute('aria-label', linkContent.href);
                    this._link.setAttribute('data-href', linkContent.href);
                    break;
                case 'external':
                    break;
            }

            if (this._input && this._label) {
                this._input.value = linkContent.text ? linkContent.text : '';

                this._label.dataset.value = linkContent.text
                    ? linkContent.text
                    : this._placeholder
                      ? this._placeholder
                      : '';
            }
        };

        return this;
    }

    /**
     * Sets the saver of the component.
     * @param callback The saver to set.
     * @returns The component itself.
     * @remarks The saver is called when the component save button is clicked.
     */
    public onSave(callback: (value: string) => Promise<void>) {
        this._onSave = callback;

        return this;
    }
    //#endregion

    /**
     * Sets the suggestions list for the input element.
     * @param suggestions The suggestions to set.
     */
    private setSuggestionsList(suggestions: string[]) {
        if (!this._datalist) return;
        this._datalist.innerHTML = '';

        suggestions.forEach((suggestion) => {
            const option = document.createElement('option');
            option.value = suggestion;
            this._datalist.appendChild(option);
        });
    }

    //#region Base Callbacks
    /**
     * Builds the presentation mode of the component.
     */
    private build() {
        this._link = document.createElement('a');
        this._presentationContainer.appendChild(this._link);

        this._link.title = this._title;
        this._link.classList.add('editable-data-view');
        this._link.classList.add('link-presentation');

        switch (this._linkType) {
            case 'tag':
                this._link.classList.add('tag');
                this._link.target = '_blank';
                this._link.rel = 'noopener';
                break;
            case 'file':
                this._link.setAttribute('data-tooltip-position', 'top');
                this._link.classList.add('internal-link');
                this._link.target = '_blank';
                this._link.rel = 'noopener';
                break;
            case 'external':
                break;
        }

        this._onPresentation?.(this._value);
    }

    /**
     * Builds the input mode of the component.
     */
    private buildInput() {
        this._label = document.createElement('label');
        this._label.title = this._title;
        this._dataInputContainer.appendChild(this._label);
        this._label.classList.add('editable-data-view');
        this._label.classList.add('text-input-sizer');

        this._input = document.createElement('input');
        this._label.appendChild(this._input);
        this._input.classList.add('editable-data-view');
        this._input.classList.add('text-input');
        this._input.placeholder = this._placeholder ? this._placeholder : '';

        this._component.registerDomEvent(this._input, 'input', () => {
            this._label.dataset.value = this._input.value
                ? this._input.value
                : this._placeholder
                  ? this._placeholder
                  : '';

            if (
                this._suggester &&
                this._label.dataset.value !== this._placeholder &&
                this._label.dataset.value !== ''
            )
                this.setSuggestionsList(this._suggester(this._input.value));
        });

        this._component.registerDomEvent(
            this._input,
            'keydown',
            (event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                    this.saveChanges();
                } else if (event.key === 'Escape') {
                    this.disableEditMode();
                }
            },
        );

        if (
            (this._suggestions && this._suggestions.length > 0) ||
            this._suggester
        ) {
            const id = Math.random().toString(36).substring(2, 10);
            this._input.setAttribute('list', id);
            this._datalist = document.createElement('datalist');
            this._datalist.id = id;
            this._input.appendChild(this._datalist);
            this.setSuggestionsList(this._suggestions);
        }
    }

    /**
     * Enables the edit mode of the component.
     */
    private enableEdit() {
        this._onPresentation?.(this._value);
        this._input.focus();
        this._input.select();
    }

    /**
     * Disables the edit mode of the component.
     */
    private disableEdit() {
        this._onPresentation?.(this._value);
    }

    /**
     * Saves the changes made to the component.
     */
    private async save(): Promise<void> {
        this._value = this._input.value;
        await this._onSave?.(this._value);
    }
    //#endregion
}
