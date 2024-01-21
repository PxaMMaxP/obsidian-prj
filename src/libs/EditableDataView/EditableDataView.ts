import { Component } from 'obsidian';
import DateComponent from './Components/DateComponent';
import DropdownComponent from './Components/DropdownComponent';
import LinkComponent from './Components/LinkComponent';
import TextComponent from './Components/TextComponent';
import TextareaComponent from './Components/TextareaComponent';

export default class EditableDataView {
    private _container: HTMLElement | DocumentFragment;
    private _component: Component;
    private _attributesList: Record<string, string> = {};

    constructor(
        container: HTMLElement | DocumentFragment,
        component: Component,
    ) {
        this._container = container;
        this._component = component;
    }

    public addText(
        configure: (component: TextComponent) => void,
    ): EditableDataView {
        const textComponent = new TextComponent(this._component);
        configure(textComponent);
        textComponent.finalize();
        textComponent.thenCallback?.(textComponent.container);

        this._container.append(textComponent.container);

        return this;
    }

    public addTextarea(
        configure: (component: TextareaComponent) => void,
    ): EditableDataView {
        const textComponent = new TextareaComponent(this._component);
        configure(textComponent);
        textComponent.finalize();
        textComponent.thenCallback?.(textComponent.container);

        this._container.append(textComponent.container);

        return this;
    }

    public addLink(
        configure: (component: LinkComponent) => void,
    ): EditableDataView {
        const linkComponent = new LinkComponent(this._component);
        configure(linkComponent);
        linkComponent.finalize();
        linkComponent.thenCallback?.(linkComponent.container);

        this._container.appendChild(linkComponent.container);

        return this;
    }

    public addDate(
        configure: (component: DateComponent) => void,
    ): EditableDataView {
        const dateComponent = new DateComponent(this._component);
        configure(dateComponent);
        dateComponent.finalize();
        dateComponent.thenCallback?.(dateComponent.container);

        this._container.append(dateComponent.container);

        return this;
    }

    public addDropdown(
        configure: (component: DropdownComponent) => void,
    ): EditableDataView {
        const dropdownComponent = new DropdownComponent(this._component);
        configure(dropdownComponent);
        dropdownComponent.finalize();
        dropdownComponent.thenCallback?.(dropdownComponent.container);

        this._container.appendChild(dropdownComponent.container);

        return this;
    }
}
