import { Component } from "obsidian";


export default abstract class BaseComponent {
    public get container(): HTMLElement | DocumentFragment {
        return this._baseContainer;
    }
    protected _baseContainer: HTMLElement | DocumentFragment;
    protected component: Component;

    constructor(component: Component) {
        this.component = component;
        this._baseContainer = document.createDocumentFragment();
    }

    public abstract finalize(): void;
}