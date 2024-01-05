import DateComponent from "./Components/DateComponent";
import DropdownComponent from "./Components/DropdownComponent";
import LinkComponent from "./Components/LinkComponent";
import TextComponent from "./Components/TextComponent";

export default class EditableDataView {
    private _container: HTMLElement | DocumentFragment;
    private attributesList: Record<string, string> = {};

    constructor(container: HTMLElement | DocumentFragment) {
        this._container = container;
    }

    public setTitle(title: string): EditableDataView {
        this.attributesList['title'] = title;
        return this;
    }

    public addText(configure: (component: TextComponent<any>) => void): EditableDataView {
        const textComponent = new TextComponent();
        configure(textComponent);

        if (this.attributesList['title']) {
            textComponent.container.setAttribute('title', this.attributesList['title']);
        }

        this._container.appendChild(textComponent.container);

        return this;
    }

    public addLink(configure: (component: LinkComponent) => void): EditableDataView {
        const linkComponent = new LinkComponent();
        configure(linkComponent);

        if (this.attributesList['title']) {
            linkComponent.container.setAttribute('title', this.attributesList['title']);
        }

        this._container.appendChild(linkComponent.container);

        return this;
    }

    public addDate(configure: (component: DateComponent) => void): EditableDataView {
        const dateComponent = new DateComponent();
        configure(dateComponent);

        if (this.attributesList['title']) {
            dateComponent.container.setAttribute('title', this.attributesList['title']);
        }

        this._container.appendChild(dateComponent.container);

        return this;
    }

    public addDropdown(configure: (component: DropdownComponent) => void): EditableDataView {
        const dropdownComponent = new DropdownComponent();
        configure(dropdownComponent);

        if (this.attributesList['title']) {
            dropdownComponent.container.setAttribute('title', this.attributesList['title']);
        }

        this._container.appendChild(dropdownComponent.container);

        return this;
    }
}
