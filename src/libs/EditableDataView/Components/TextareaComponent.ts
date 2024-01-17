import { Component, MarkdownRenderer } from "obsidian";
import BaseComponent from "./BaseComponent";
import Global from "src/classes/Global";
import Helper from "src/libs/Helper";

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
    private _onMarkdownPresentation: ((value: string) => Promise<void>) | undefined;
    private _onSave: ((value: string) => Promise<void>) | undefined;
    private _value: string;
    private _placeholder: string;
    private _title: string;
    //#endregion
    //#region HTML Elements
    private presentationSpan: HTMLElement;
    //#endregion

    constructor(component: Component) {
        super(component);
        this.onFinalize = this.build
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
     * @remarks The formator is called when the component change in `not-edit` mode.
     */
    public setFormator(formator: (value: string) => Promise<string>) {
        this._onPresentation = async (value: string): Promise<void> => {
            this.presentationSpan.textContent = await formator(this._value);
        };
        return this;
    }

    /**
     * Sets the markdown formator of the component.
     * @param path The path of the file to resolve internal links.
     * @returns The component itself.
     * @remarks The formator is called when the component change in `not-edit` mode.
     * - The custom formator is ignored if this method is called!
     */
    public setRenderMarkdown(path = "") {
        this._onMarkdownPresentation = (value: string): Promise<void> => {
            if (Helper.isPossiblyMarkdown(value)) {
                const app = Global.getInstance().app;
                return MarkdownRenderer.render(app, value, this.presentationSpan, path, this.component);
            } else {
                this.presentationSpan.innerHTML = "";
                this.presentationSpan.textContent = value;
                return Promise.resolve();
            }
        }
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
    private build() {
        this.presentationSpan = document.createElement('span');
        this.presentationContainer.appendChild(this.presentationSpan);

        this.presentationSpan.contentEditable = 'false';
        this.presentationSpan.title = this._title;
        this.presentationSpan.classList.add('editable-data-view');
        this.presentationSpan.classList.add('textarea-presentation');
        if (this._onMarkdownPresentation) {
            this.presentationSpan.textContent = null;
            this._onMarkdownPresentation(this._value);
        } else if (this._onPresentation) {
            this._onPresentation(this._value);
        } else {
            this.presentationSpan.textContent = this._value;
        }
    }

    private buildInput() {
        this.component.registerDomEvent(this.presentationSpan, 'keydown', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                this.disableEditMode();
            }
        });
    }

    private enableEdit() {
        this.presentationSpan.textContent = this._value;
        this.presentationSpan.contentEditable = 'true';
        this.presentationSpan.focus();
    }

    private disableEdit() {
        if (this._onMarkdownPresentation) {
            this.presentationSpan.textContent = null;
            this._onMarkdownPresentation(this._value);
        } else if (this._onPresentation) {
            this._onPresentation(this._value);
        } else {
            this.presentationSpan.textContent = this._value;
        }
        this.presentationSpan.contentEditable = 'false';
    }

    private async save(): Promise<void> {
        this._value = this.presentationSpan.textContent ?? '';
        await this._onSave?.(this._value);
    }
    //#endregion
}
