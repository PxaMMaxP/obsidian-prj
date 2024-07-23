import { Component } from 'obsidian';
import type { IApp } from 'src/interfaces/IApp';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import type { ILifecycleManager_ } from 'src/libs/LifecycleManager/interfaces/ILifecycleManager';
import { ICustomModal } from './interfaces/ICustomModal';
import type {
    IDraggableElement,
    IDraggableElement_,
} from './interfaces/IDraggableElement';

/**
 * Represents a custom modal, which can be dragged around
 * and don't dim the background.
 */
export abstract class CustomModal implements ICustomModal {
    @Inject('IApp')
    protected readonly _IApp!: IApp;
    @Inject('ILifecycleManager_')
    private readonly _ILifecycleManager!: ILifecycleManager_;
    @Inject('IDraggableElement_')
    private readonly _IDraggableElement_!: IDraggableElement_;

    private readonly _beforeUnload: () => void = this.close.bind(this);
    protected _IComponent: Component;
    private _draggableElement?: IDraggableElement;

    private readonly _isDraggable: boolean;
    private readonly _willDimBackground: boolean;

    private readonly _body: HTMLElement = document.body;
    private __container?: HTMLElement;
    private __bg?: HTMLElement;
    private __closeButton?: HTMLElement;
    private __title?: HTMLElement;
    private __modal?: HTMLElement;
    private __content?: HTMLElement;

    /**
     * The container of the modal.
     */
    private get _container(): HTMLElement {
        if (this.__container == null) {
            this.__container = document.createElement('div');
            this.__container.classList.add('modal-container', 'mod-dim');

            if (!this._willDimBackground)
                this.__container.style.pointerEvents = 'none';
        }

        return this.__container;
    }

    /**
     * The background of the modal, if it will be dimmed
     * else an empty fragment.
     */
    private get _bg(): DocumentFragment {
        if (this._willDimBackground && this.__bg == null) {
            this.__bg = document.createElement('div');
            this.__bg.classList.add('modal-bg');
            this.__bg.style.opacity = '0.85';

            // Add event listener to close the modal
            // if the background is clicked
            this._IComponent.registerDomEvent(
                this.__bg,
                'click',
                this.close.bind(this),
            );
        }

        const fragment = new DocumentFragment();

        if (this._willDimBackground && this.__bg != null)
            fragment.appendChild(this.__bg);

        return fragment;
    }

    /**
     * The close button of the modal.
     */
    private get _closeButton(): HTMLElement {
        if (this.__closeButton == null) {
            this.__closeButton = document.createElement('div');
            this.__closeButton.classList.add('modal-close-button');
        }

        // Add event listener to close the modal
        this._IComponent.registerDomEvent(
            this.__closeButton,
            'click',
            this.close.bind(this),
        );

        return this.__closeButton;
    }

    /**
     * The title of the modal.
     */
    private get _title(): HTMLElement {
        if (this.__title == null) {
            this.__title = document.createElement('div');
            this.__title.classList.add('modal-title');
            this.__title.innerText = '\u00A0';
        }

        return this.__title;
    }

    /**
     * The modal element.
     */
    private get _modal(): HTMLElement {
        if (this.__modal == null) {
            this.__modal = document.createElement('div');
            this.__modal.classList.add('modal');
            this.__modal.style.pointerEvents = 'auto';
        }

        return this.__modal;
    }

    /**
     * The content of the modal.
     */
    protected get _content(): HTMLElement {
        if (this.__content == null) {
            this.__content = document.createElement('div');
            this.__content.classList.add('modal-content');
        }

        return this.__content;
    }

    /**
     * Creates a new Modal.
     * @param isDraggable Whether the modal should be draggable.
     * @param willDimBackground Whether the background should be dimmed.
     * @param component The component that the modal belongs to.
     */
    constructor(
        isDraggable: boolean,
        willDimBackground: boolean,
        component: Component = new Component(),
    ) {
        this._isDraggable = isDraggable;
        this._willDimBackground = willDimBackground;
        this._IComponent = component;
    }

    /**
     * Opens the modal.
     */
    public open(): void {
        // Register the before unload event
        // to close the modal when the plugin is unloaded.
        this._ILifecycleManager.register(
            'before',
            'unload',
            this._beforeUnload,
        );

        this._IComponent.load();
        this.buildModal();

        if (this._isDraggable && this._draggableElement != null) {
            this._draggableElement.enableDragging();
        }
        this.onOpen();
    }

    /**
     * Closes the modal.
     */
    public close(): void {
        // Unregister the before unload event
        this._ILifecycleManager.unregister(
            'before',
            'unload',
            this._beforeUnload,
        );

        this.onClose();
        this._container.remove();
        this._IComponent.unload();
    }

    /**
     * Builds the modal.
     */
    private buildModal(): void {
        const fragment = new DocumentFragment();

        this._container.appendChild(this._bg);
        fragment.appendChild(this._container);

        this._modal.appendChild(this._closeButton);
        this._modal.appendChild(this._title);
        this._modal.appendChild(this._content);
        this._container.appendChild(this._modal);

        this._body.appendChild(fragment);

        if (this._isDraggable) {
            this._draggableElement = new this._IDraggableElement_(
                this._modal,
                this._title,
                this._IComponent,
            );
        }
    }

    /**
     * Called when the modal is opened.
     */
    protected abstract onOpen(): void;

    /**
     * Called when the modal is closed.
     */
    protected abstract onClose(): void;

    /**
     * Sets the title of the modal.
     * @param title The title to set.
     */
    public setTitle(title: string): void {
        // The title must never be empty so that it can still serve as a drag handler.
        this._title.innerText = title.trim().length > 0 ? title : '\u00A0';
    }

    /**
     * Sets the content of the modal.
     * @param content The content to set.
     */
    public setContent(content: DocumentFragment): void {
        this._content.empty();
        this._content.appendChild(content);
    }
}
