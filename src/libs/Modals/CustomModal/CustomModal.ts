import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { IApp } from 'src/interfaces/IApp';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import type { ILifecycleManager_ } from 'src/libs/LifecycleManager/interfaces/ILifecycleManager';
import { DIComponent } from './DIComponent';
import { CallbackError, MissingCallbackError } from './interfaces/Exceptions';
import {
    ICloseCallback,
    ICustomModal,
    ICustomModal_,
    IOpenCallback,
    IShouldOpenCallback,
} from './interfaces/ICustomModal';
import type {
    IDraggableElement,
    IDraggableElement_,
} from './interfaces/IDraggableElement';

/**
 * Represents a custom modal, which can be dragged around
 * and don't dim the background.
 */
@Register('ICustomModal_')
@ImplementsStatic<ICustomModal_>()
export class CustomModal extends DIComponent implements ICustomModal {
    //#region Dependencies
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('CustomModal'), false)
    protected readonly _logger?: ILogger;
    @Inject('IApp')
    protected readonly _IApp!: IApp;
    @Inject('ILifecycleManager_')
    private readonly _ILifecycleManager!: ILifecycleManager_;
    @Inject('IDraggableElement_')
    private readonly _IDraggableElement_!: IDraggableElement_;
    //#endregion

    private readonly _beforeUnload: () => void = this.close.bind(this);

    private _draggableElement?: IDraggableElement;

    /**
     * @inheritdoc
     */
    public get draggableClassName(): string | undefined {
        return this._draggableElement?.className;
    }

    /**
     * Called before the modal is opened.
     * @returns True if the modal can be opened, otherwise false.
     */
    protected _shouldOpen?: IShouldOpenCallback;

    /**
     * Called when the modal is opened.
     */
    protected _onOpen?: IOpenCallback;

    /**
     * Called when the modal is closed.
     */
    protected _onClose?: ICloseCallback;

    private _isDraggable = false;
    private _willDimBackground = true;

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
            this.registerDomEvent(this.__bg, 'click', this.close.bind(this));
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
        this.registerDomEvent(
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
     * @inheritdoc
     */
    public get content(): HTMLElement {
        if (this.__content == null) {
            this.__content = document.createElement('div');
            this.__content.classList.add('modal-content');
        }

        return this.__content;
    }

    /**
     * Creates a new Modal.
     */
    constructor() {
        super();
    }

    /**
     * @inheritdoc
     */
    public open(): void {
        if (this._onOpen == null) {
            this._logger?.error('The onOpen callback must be set.');
            throw new MissingCallbackError('onOpen');
        }

        try {
            // Check if the modal can be opened
            if (this._shouldOpen?.() === false) return;
        } catch (error) {
            this._logger?.error('Error in shouldOpen callback', error);
            throw new CallbackError('shouldOpen', error);
        }

        // Register the before unload event
        // to close the modal when the plugin is unloaded.
        this._ILifecycleManager.register(
            'before',
            'unload',
            this._beforeUnload,
        );

        this.buildModal();
        this.load();

        if (this._isDraggable && this._draggableElement != null) {
            this._draggableElement.enableDragging();
        }

        try {
            this._onOpen?.();
        } catch (error) {
            this._logger?.error('Error in onOpen callback', error);
            throw new CallbackError('onOpen', error);
        }
    }

    /**
     * @inheritdoc
     */
    public close(): void {
        // Unregister the before unload event
        this._ILifecycleManager.unregister(
            'before',
            'unload',
            this._beforeUnload,
        );

        try {
            this._onClose?.();
        } catch (error) {
            this._logger?.error('Error in onClose callback', error);
            throw new CallbackError('onClose', error);
        }
        this.unload();
        this._container.remove();
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
        this._modal.appendChild(this.content);
        this._container.appendChild(this._modal);

        this._body.appendChild(fragment);

        if (this._isDraggable) {
            this._draggableElement = new this._IDraggableElement_(
                this._container,
                this._title,
                this,
            );
        }
    }

    /**
     * @inheritdoc
     */
    public setShouldOpen(shouldOpen: IShouldOpenCallback): this {
        this._shouldOpen = shouldOpen;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setOnOpen(onOpen: IOpenCallback): this {
        this._onOpen = onOpen;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setOnClose(onClose: ICloseCallback): this {
        this._onClose = onClose;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setTitle(title: string): this {
        // The title must never be empty so that it can still serve as a drag handler.
        this._title.innerText = title.trim().length > 0 ? title : '\u00A0';

        return this;
    }

    /**
     * @inheritdoc
     */
    public setContent(content: DocumentFragment): this {
        this.content.appendChild(content);

        return this;
    }

    /**
     * @inheritdoc
     */
    public setDraggableEnabled(isDraggable: boolean): this {
        this._isDraggable = isDraggable;

        return this;
    }

    /**
     * @inheritdoc
     */
    public setBackgroundDimmed(willDimBackground: boolean): this {
        this._willDimBackground = willDimBackground;

        return this;
    }
}
