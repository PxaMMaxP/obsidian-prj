import TextComponent from "./TextComponent";

export default class LinkComponent extends TextComponent<LinkComponent> {
    private link: HTMLAnchorElement;
    protected setOnSave: ((value: string) => Promise<{ href: string, text: string }>) | undefined;
    private linkType: 'tag' | 'file' | 'external' = 'external';
    private onChanges: (() => void) | undefined;
    private onEdit: (() => void) | undefined;

    constructor() {
        super();
        this._container.classList.remove('editable-text-input');
        this._container.classList.add('editable-link-input');

        this.label.classList.remove('text-input-sizer');
        this.label.classList.add('link-input-sizer');

        this.input.classList.remove('text-input');
        this.input.classList.add('link-input');
        this.input.oninput = () => {
            this.label.dataset.value = this.input.value;
            this.link.text = this.input.value;
        }

        this.link = document.createElement('a');
        this.label.appendChild(this.link);
        this.link.classList.add('editable-data-view');
        this.link.classList.add('link');

    }

    protected cancelChanges() {
        super.cancelChanges();
        if (this.onChanges)
            this.onChanges();
    }

    protected async saveChanges() {
        if (this.setOnSave) {
            const values = await this.setOnSave(this.input.value);
            this.link.href = values.href;
            this.link.text = values.text;
        }
        this.disableEdit();
        if (this.onChanges)
            this.onChanges();
    }

    protected enableEdit() {
        super.enableEdit();
        if (this.onEdit)
            this.onEdit();
        this.link.classList.add('hidden');
    }

    protected disableEdit() {
        super.disableEdit();
        if (this.onChanges)
            this.onChanges();
        this.link.classList.remove('hidden');
    }

    public setAsTagLink(): LinkComponent {
        this.link.classList.add('tag');
        this.link.target = '_blank';
        this.link.rel = 'noopener';
        this.onChanges = () => {
            this.label.dataset.value = `${this.link.text}_`;
        };
        this.onEdit = () => {
            this.label.dataset.value = `${this.input.value}`;
        }
        this.onChanges();
        return this;
    }

    public setAsFileLink(): LinkComponent {
        this.linkType = 'file';
        this.link.setAttribute('data-tooltip-position', 'top');
        this.onChanges = () => {
            this.link.setAttribute('aria-label', `${this.link.getAttribute('href')}`);
            this.link.setAttribute('data-href', `${this.link.getAttribute('href')}`);
            this.label.dataset.value = `${this.link.text}`;
        };
        this.onEdit = () => {
            this.label.dataset.value = `${this.input.value}`;
        }
        this.onChanges();
        this.link.classList.add('internal-link');
        this.link.target = '_blank';
        this.link.rel = 'noopener';
        return this;
    }

    public override setValue(value: string): LinkComponent {
        super.setValue(value);
        if (this.onChanges)
            this.onChanges();
        return this;
    }

    public setLinkValue(href: string, text: string): LinkComponent {
        this.link.href = href;
        this.link.text = text;
        if (this.onChanges)
            this.onChanges();
        return this;
    }

    public override onSave(callback: (value: string) => Promise<{ href: string, text: string }>): LinkComponent {
        this.setOnSave = callback;
        return this;
    }
}
