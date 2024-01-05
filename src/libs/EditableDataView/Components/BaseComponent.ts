export default class BaseComponent {
    public get container(): HTMLElement {
        return this._baseContainer;
    }
    private _baseContainer: HTMLElement;

    constructor() {
        this._baseContainer = document.createElement('div');
        this._baseContainer.classList.add('editable-data-view');
        this._baseContainer.classList.add('base-container');
    }
}
