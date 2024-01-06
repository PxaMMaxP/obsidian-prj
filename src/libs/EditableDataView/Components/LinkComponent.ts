import { Component } from "obsidian";
import TextComponent from "./TextComponent";

export default class LinkComponent extends TextComponent<LinkComponent> {
    //#region HTML Elements
    private link: HTMLAnchorElement;
    //#endregion
    //#region Properties
    private linkValue: { href: string, text: string };
    private linkType: 'tag' | 'file' | 'external' = 'external';
    //#endregion
    //#region Callbacks
    protected onSaveCallback: ((value: string) => Promise<{ href: string, text: string }>) | undefined;
    private _onChangeCallback: (() => void) | undefined;
    private onEditCallback: (() => void) | undefined;
    //#endregion

    constructor(component: Component) {
        super(component);
    }

    protected cancelChanges() {
        super.cancelChanges();
        if (this._onChangeCallback)
            this._onChangeCallback();
    }

    protected async saveChanges() {
        if (this.onSaveCallback) {
            const values = await this.onSaveCallback(this.input.value);
            this.link.href = values.href;
            this.link.text = values.text;
        }
        this.disableEdit();
        if (this._onChangeCallback)
            this._onChangeCallback();
    }

    protected enableEdit() {
        super.enableEdit();
        if (this.onEditCallback)
            this.onEditCallback();
        this.link.classList.add('hidden');
    }

    protected disableEdit() {
        super.disableEdit();
        if (this._onChangeCallback)
            this._onChangeCallback();
        this.link.classList.remove('hidden');
    }

    public setAsTagLink(): LinkComponent {
        this.linkType = 'tag';
        this.link.classList.add('tag');
        this.link.target = '_blank';
        this.link.rel = 'noopener';
        this._onChangeCallback = () => {
            this.label.dataset.value = `${this.link.text}_`;
        };
        this.onEditCallback = () => {
            this.label.dataset.value = `${this.input.value}`;
        }
        this._onChangeCallback();
        return this;
    }

    public setAsFileLink(): LinkComponent {
        this.linkType = 'file';
        this.link.setAttribute('data-tooltip-position', 'top');
        this._onChangeCallback = () => {
            this.link.setAttribute('aria-label', `${this.link.getAttribute('href')}`);
            this.link.setAttribute('data-href', `${this.link.getAttribute('href')}`);
            this.label.dataset.value = `${this.link.text}`;
        };
        this.onEditCallback = () => {
            this.label.dataset.value = `${this.input.value}`;
        }
        this._onChangeCallback();
        this.link.classList.add('internal-link');
        this.link.target = '_blank';
        this.link.rel = 'noopener';
        return this;
    }

    public override setValue(value: string): LinkComponent {
        super.setValue(value);
        return this;
    }

    private _setValueLink() {
        if (this._onChangeCallback)
            this._onChangeCallback();
    }

    public setLinkValue(href: string, text: string): LinkComponent {
        this.linkValue = { href, text };
        return this;
    }

    private _setLinkValue() {
        if (!this.linkValue)
            return;
        this.link.href = this.linkValue.href;
        this.link.text = this.linkValue.text;

        if (this._onChangeCallback)
            this._onChangeCallback();
    }

    public override onSave(callback: (value: string) => Promise<{ href: string, text: string }>): LinkComponent {
        this.onSaveCallback = callback;
        return this;
    }

    public finalize(): void {
        super.finalize();
        this._container.classList.remove('editable-text-input');
        this._container.classList.add('editable-link-input');

        this.label.classList.remove('text-input-sizer');
        this.label.classList.add('link-input-sizer');

        this.input.classList.remove('text-input');
        this.input.classList.add('link-input');
        this.component.registerDomEvent(this.input, 'input', () => {
            this.label.dataset.value = this.input.value;
            this.link.text = this.input.value;
        });

        this.link = document.createElement('a');
        this.label.appendChild(this.link);
        this.link.classList.add('editable-data-view');
        this.link.classList.add('link');

        this._setValueLink();
        this._setLinkValue();
    }
}
