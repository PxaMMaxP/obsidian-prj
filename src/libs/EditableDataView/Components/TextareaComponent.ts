import { Component, MarkdownRenderer } from 'obsidian';
import Global from 'src/classes/Global';
import { HelperGeneral } from 'src/libs/Helper/General';
import BaseComponent from './BaseComponent';

/**
 * Represents a textarea component for editable data view.
 */
export default class TextareaComponent extends BaseComponent {
    //#region base properties
    protected editabilityEnabled = false;
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
    private _value: string;
    private _placeholder: string;
    private _title: string;
    //#endregion
    //#region HTML Elements
    private _presentationSpan: HTMLElement;
    //#endregion

    /**
     * Creates a new instance of TextareaComponent.
     * @param component The component to attach the textarea to.
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
     * Sets the placeholder of the input element.
     * @param placeholder The placeholder to set.
     * @returns The component itself.
     */
    public setPlaceholder(placeholder: string) {
        this._placeholder = placeholder;

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
     * @remarks The formator is called when the component changes in `not-edit` mode.
     */
    public setFormator(formator: (value: string) => Promise<string>) {
        /**
         * Sets the presentation of the component using the specified formator.
         * @param value The value to format and set as the presentation.
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
    public setRenderMarkdown(path = '') {
        /**
         * Sets the presentation of the component using the specified markdown formator.
         * @param value The value to format and set as the presentation.
         * @returns A promise that resolves when the presentation is set.
         */
        this._onMarkdownPresentation = (value: string): Promise<void> => {
            if (HelperGeneral.containsMarkdown(value)) {
                const app = Global.getInstance().app;

                return MarkdownRenderer.render(
                    app,
                    value,
                    this._presentationSpan,
                    path,
                    this.component,
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
    public onSave(callback: (value: string) => Promise<void>) {
        this._onSave = callback;

        return this;
    }
    //#endregion

    //#region Base Callbacks
    /**
     * Builds the presentation of the component.
     */
    private build() {
        this._presentationSpan = document.createElement('span');
        this.presentationContainer.appendChild(this._presentationSpan);

        this._presentationSpan.contentEditable = 'false';
        this._presentationSpan.title = this._title;
        this._presentationSpan.classList.add('editable-data-view');
        this._presentationSpan.classList.add('textarea-presentation');

        if (this._onMarkdownPresentation) {
            this._presentationSpan.textContent = null;
            this._onMarkdownPresentation(this._value);
        } else if (this._onPresentation) {
            this._onPresentation(this._value);
        } else {
            this._presentationSpan.textContent = this._value;
        }
    }

    /**
     * Builds the input element for editing.
     */
    private buildInput() {
        this.component.registerDomEvent(
            this._presentationSpan,
            'keydown',
            (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    this.disableEditMode();
                } else if (event.key === 'Enter') {
                    event.preventDefault();
                    const selection = window.getSelection();

                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(document.createTextNode('\n'));
                        range.collapse(false);
                    }
                }
            },
        );
    }

    /**
     * Enables the edit mode of the component.
     */
    private enableEdit() {
        this.presentationContainer.classList.remove('hidden');
        this._presentationSpan.textContent = this._value;
        this._presentationSpan.contentEditable = 'true';
        this._presentationSpan.focus();
        this.setInputCursorAbsolutePosition('end', this._presentationSpan);
    }

    /**
     * Disables the edit mode of the component.
     */
    private disableEdit() {
        if (this._onMarkdownPresentation) {
            this._presentationSpan.textContent = null;
            this._onMarkdownPresentation(this._value);
        } else if (this._onPresentation) {
            this._onPresentation(this._value);
        } else {
            this._presentationSpan.textContent = this._value;
        }
        this._presentationSpan.contentEditable = 'false';
    }

    /**
     * Saves the value of the component.
     */
    private async save(): Promise<void> {
        this._value = this._presentationSpan.textContent ?? '';
        await this._onSave?.(this._value);
    }
    //#endregion
}
