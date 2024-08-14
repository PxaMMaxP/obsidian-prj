import { Component, MarkdownRenderer } from 'obsidian';
import { IApp } from 'src/interfaces/IApp';
import { HelperGeneral } from 'src/libs/Helper/General';
import { resolve } from 'ts-injex';
import BaseComponent from './BaseComponent';
import SuggestionComponent, { Suggestions } from './SuggestionComponent';

/**
 * Represents a text component in an editable data view.
 */
export default class TextComponent extends BaseComponent {
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
    private _onMarkdownPresentation:
        | ((value: string) => Promise<void>)
        | undefined;
    private _onSave: ((value: string) => Promise<void>) | undefined;
    private _suggester: ((value: string) => Suggestions) | undefined;
    private _value: string;
    private _placeholder: string;
    private _suggestions: Suggestions;
    private _title: string;
    //#endregion
    //#region HTML Elements
    private _presentationSpan: HTMLElement;
    private readonly _suggestionsContainer: HTMLDivElement;
    //#endregion
    private _suggestionComponent: SuggestionComponent | undefined;

    /**
     * Returns `true` if the suggester is set. (Suggestions are enabled.)
     */
    private get isSuggesterSet(): boolean {
        return this._suggester !== undefined;
    }

    /**
     * Creates a new instance of the TextComponent class.
     * @param component The component to associate with the TextComponent.
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
    public enableEditability(): this {
        this._isEditable = true;

        return this;
    }

    /**
     * Sets the value of the component.
     * @param value The value to set.
     * @returns The component itself.
     */
    public setValue(value: string): this {
        this._value = value;

        return this;
    }

    /**
     * Sets the placeholder of the input element.
     * @param placeholder The placeholder to set.
     * @returns The component itself.
     */
    public setPlaceholder(placeholder: string): this {
        this._placeholder = placeholder;

        return this;
    }

    /**
     * Sets suggestions for the input element.
     * @param suggestions The suggestions to set.
     * @returns The component itself.
     */
    public setSuggestions(suggestions: Suggestions): this {
        this._suggestions = suggestions;

        return this;
    }

    /**
     * Sets the title of the component.
     * @param title The title to set.
     * @returns The component itself.
     */
    public setTitle(title: string): this {
        this._title = title;

        return this;
    }

    /**
     * Sets the suggester of the component.
     * @param suggester The suggester to set.
     * @returns The component itself.
     * @remarks The suggester is called when the user types in the input element.
     */
    public setSuggester(suggester: (value: string) => Suggestions): this {
        this._suggester = suggester;

        return this;
    }

    /**
     * Sets the formator of the component.
     * @param formator The formator to set.
     * @returns The component itself.
     * @remarks The formator is called when the component changes in `not-edit` mode.
     */
    public setFormator(formator: (value: string) => Promise<string>): this {
        /**
         * Sets the presentation handler for the component.
         * @param value The value to present.
         */
        this._onPresentation = async (value: string): Promise<void> => {
            this._presentationSpan.textContent = await formator(this._value);
        };

        return this;
    }

    /**
     * Sets the markdown formator of the component.
     * @param path The path of the file to resolve internal links.
     * @returns The component itself.
     * @remarks The formator is called when the component changes in `not-edit` mode.
     * - The custom formator is ignored if this method is called!
     */
    public setRenderMarkdown(path = ''): this {
        /**
         * Sets the markdown presentation handler for the component.
         * @param value The value to present.
         * @returns A promise that resolves when the presentation is complete.
         */
        this._onMarkdownPresentation = (value: string): Promise<void> => {
            if (HelperGeneral.containsMarkdown(value)) {
                return MarkdownRenderer.render(
                    resolve<IApp>('IApp'),
                    value,
                    this._presentationSpan,
                    path,
                    this._component,
                );
            } else {
                this._presentationSpan.innerHTML = '';
                this._presentationSpan.textContent = value;

                return Promise.resolve();
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
    public onSave(callback: (value: string) => Promise<void>): this {
        this._onSave = callback;

        return this;
    }
    //#endregion

    //#region Base Callbacks
    /**
     * Builds the presentation of the component.
     */
    private build(): void {
        this._presentationSpan = document.createElement('span');
        this._presentationContainer.appendChild(this._presentationSpan);

        this._presentationSpan.contentEditable = 'false';
        this._presentationSpan.title = this._title;
        this._presentationSpan.classList.add('editable-data-view');
        this._presentationSpan.classList.add('text-presentation');

        if (this._onMarkdownPresentation) {
            this._presentationSpan.textContent = null;
            this._onMarkdownPresentation(this._value);
        } else if (this._onPresentation) {
            this._onPresentation(this._value);
        } else {
            this._presentationSpan.textContent = this._value;
        }

        if (this._suggestions || this._suggester) {
            if (!this._suggestionComponent) {
                this._suggestionComponent = new SuggestionComponent(
                    this._presentationSpan,
                    this._component,
                );
            }

            this._suggestions
                ? this._suggestionComponent.setSuggestions(this._suggestions)
                : void 0;

            this._suggester
                ? this._suggestionComponent.setSuggester(this._suggester)
                : void 0;
        }
    }

    /**
     * Builds the input element for editing the component.
     */
    private buildInput(): void {
        this._component.registerDomEvent(
            this._presentationSpan,
            'keydown',
            (event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                    this.saveChanges();
                } else if (event.key === 'Escape') {
                    this.disableEditMode();
                }
            },
        );
    }

    /**
     * Enables the edit mode for the component.
     */
    private enableEdit(): void {
        this._presentationContainer.classList.remove('hidden');
        this._presentationSpan.contentEditable = 'true';
        this._presentationSpan.focus();
        this._suggestionComponent?.enableSuggestior();
        this.setInputCursorAbsolutePosition('end', this._presentationSpan);
    }

    /**
     * Disables the edit mode for the component.
     */
    private disableEdit(): void {
        if (this._onMarkdownPresentation) {
            this._presentationSpan.textContent = null;
            this._onMarkdownPresentation(this._value);
        } else if (this._onPresentation) {
            this._onPresentation(this._value);
        } else {
            this._presentationSpan.textContent = this._value;
        }
        this._presentationSpan.contentEditable = 'false';
        this._suggestionComponent?.disableSuggestor();
    }

    /**
     * Saves the changes made to the component.
     */
    private async save(): Promise<void> {
        this._value = this._presentationSpan.textContent ?? '';
        await this._onSave?.(this._value);
    }
    //#endregion
}
