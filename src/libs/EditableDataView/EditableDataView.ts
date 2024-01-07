import { Component } from "obsidian";
import DateComponent from "./Components/DateComponent";
import DropdownComponent from "./Components/DropdownComponent";
import LinkComponent from "./Components/LinkComponent";
import TextComponent from "./Components/TextComponent";

export default class EditableDataView {
    private _container: HTMLElement | DocumentFragment;
    private component: Component;
    private attributesList: Record<string, string> = {};

    constructor(container: HTMLElement | DocumentFragment, component: Component) {
        this._container = container;
        this.component = component;
    }


    public addText(configure: (component: TextComponent) => void): EditableDataView {
        const textComponent = new TextComponent(this.component);
        configure(textComponent);
        textComponent.finalize();

        this._container.append(textComponent.container);

        return this;
    }

    public addLink(configure: (component: LinkComponent) => void): EditableDataView {
        const linkComponent = new LinkComponent(this.component);
        configure(linkComponent);
        linkComponent.finalize();

        if (this.attributesList['title']) {
            const innerContainer = linkComponent.container.getRootNode() as HTMLElement;
            innerContainer.setAttribute('title', this.attributesList['title']);
        }

        this._container.appendChild(linkComponent.container);

        return this;
    }

    public addDate(configure: (component: DateComponent) => void): EditableDataView {
        const dateComponent = new DateComponent(this.component);
        configure(dateComponent);
        dateComponent.finalize();

        if (this.attributesList['title']) {
            const innerContainer = dateComponent.container.getRootNode() as HTMLElement;
            innerContainer.setAttribute('title', this.attributesList['title']);
        }

        this._container.append(dateComponent.container);

        return this;
    }

    public addDropdown(configure: (component: DropdownComponent) => void): EditableDataView {
        const dropdownComponent = new DropdownComponent(this.component);
        configure(dropdownComponent);
        dropdownComponent.finalize();

        if (this.attributesList['title']) {
            const innerContainer = dropdownComponent.container.getRootNode() as HTMLElement;
            innerContainer.setAttribute('title', this.attributesList['title']);
        }

        this._container.appendChild(dropdownComponent.container);

        return this;
    }
}
