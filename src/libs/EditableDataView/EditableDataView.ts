import { Component } from 'obsidian';
import DateComponent from './Components/DateComponent';
import DropdownComponent from './Components/DropdownComponent';
import LinkComponent from './Components/LinkComponent';
import TextareaComponent from './Components/TextareaComponent';
import TextComponent from './Components/TextComponent';

/**
 * Represents an editable data view that allows adding various components.
 */
export default class EditableDataView {
    private readonly _container: HTMLElement | DocumentFragment;
    private readonly _component: Component;
    private readonly _attributesList: Record<string, string> = {};

    /**
     * Creates a new instance of EditableDataView.
     * @param container - The container element where the components will be added.
     * @param component - The parent component.
     */
    constructor(
        container: HTMLElement | DocumentFragment,
        component: Component,
    ) {
        this._container = container;
        this._component = component;
    }

    /**
     * Adds a text component to the data view.
     * @param configure - A function that configures the text component.
     * @returns The EditableDataView instance.
     */
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

    /**
     * Adds a textarea component to the data view.
     * @param configure - A function that configures the textarea component.
     * @returns The EditableDataView instance.
     */
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

    /**
     * Adds a link component to the data view.
     * @param configure - A function that configures the link component.
     * @returns The EditableDataView instance.
     */
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

    /**
     * Adds a date component to the data view.
     * @param configure - A function that configures the date component.
     * @returns The EditableDataView instance.
     */
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

    /**
     * Adds a dropdown component to the data view.
     * @param configure - A function that configures the dropdown component.
     * @returns The EditableDataView instance.
     */
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
