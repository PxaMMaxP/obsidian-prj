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

    public addText(configure: (textComponent: TextComponent) => void): EditableDataView {
        const textComponent = new TextComponent();
        configure(textComponent);

        if (this.attributesList['title']) {
            textComponent.container.setAttribute('title', this.attributesList['title']);
        }

        this._container.appendChild(textComponent.container);

        return this;
    }
}
