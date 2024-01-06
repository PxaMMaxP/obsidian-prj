import { Component } from "obsidian";


export default abstract class BaseComponent {
    public get container(): HTMLElement {
        return this._baseContainer;
    }
    protected _baseContainer: HTMLElement;
    protected component: Component;

    constructor(component: Component) {
        this.component = component;
        this._baseContainer = document.createElement('div');
        this._baseContainer.classList.add('editable-data-view');
        this._baseContainer.classList.add('base-container');
    }

    public abstract finalize(): void;
}