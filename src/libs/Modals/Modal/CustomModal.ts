import { Component } from 'obsidian';
import type { IApp } from 'src/interfaces/IApp';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { DraggableModal } from './DraggableModal';
import { ICustomModal } from './interfaces/ICustomModal';

/**
 * Represents a custom modal, which can be dragged around
 * and don't dim the background.
 */
export abstract class CustomModal implements ICustomModal {
    private readonly _body: HTMLElement = document.body;

    @Inject('IApp')
    protected _IApp: IApp;

    protected _IComponent = new Component();

    private _container: HTMLElement;
    private _title: HTMLElement;
    private _modal: HTMLElement;
    protected _content: HTMLElement;

    /**
     * Opens the modal.
     */
    public open(): void {
        this._IComponent.load();
        this.buildModal();
        this.onOpen();
    }

    /**
     * Closes the modal.
     */
    public close(): void {
        this.onClose();
        this._container.remove();
        this._IComponent.unload();
    }

    /**
     * Builds the modal.
     */
    private buildModal(): void {
        const fragment = new DocumentFragment();
        this._container = document.createElement('div');
        this._container.classList.add('modal-container', 'mod-dim');
        this._container.style.pointerEvents = 'none';
        fragment.appendChild(this._container);

        this._modal = document.createElement('div');
        this._modal.classList.add('modal');
        this._modal.style.pointerEvents = 'auto';

        const closeButton = document.createElement('div');
        closeButton.classList.add('modal-close-button');

        // Add event listener to close the modal
        this._IComponent.registerDomEvent(
            closeButton,
            'click',
            this.close.bind(this),
        );
        this._modal.appendChild(closeButton);

        this._title = document.createElement('div');
        this._title.classList.add('modal-title');
        this._title.innerText = '\u00A0';
        this._modal.appendChild(this._title);

        this._content = document.createElement('div');
        this._content.classList.add('modal-content');
        this._modal.appendChild(this._content);

        this._container.appendChild(this._modal);

        this._body.appendChild(fragment);

        new DraggableModal(
            this._modal,
            this._title,
            this._IComponent,
        ).enableDragging();
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
