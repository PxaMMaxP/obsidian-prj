import { Component } from 'obsidian';
import { CallbackError, MissingCallbackError } from './Exceptions';

/**
 * Static interface for the custom modal.
 * @see {@link ICustomModal}
 */
export interface ICustomModal_ {
    /**
     * Creates a new Modal.
     * @param component The component that the modal belongs to.
     * @see {@link ICustomModal}
     */
    new (component?: Component): ICustomModal;
}

/**
 * Interface for the custom modal.
 * @see {@link ICustomModal_}
 */
export interface ICustomModal {
    /**
     * The content of the modal.
     */
    get content(): HTMLElement;

    /**
     * Opens the modal.
     * @throws {MissingCallbackError} If the `onOpen` callback is missing.
     * @throws {CallbackError} If an error occurs in the `shouldOpen` callback.
     * @throws {CallbackError} If an error occurs in the `onOpen` callback.
     */
    open(): void;

    /**
     * Closes the modal.
     * @throws {CallbackError} If an error occurs in the `onClose` callback.
     */
    close(): void;

    /**
     * Sets the before open callback.
     * You can use this to check if the modal can be opened.
     * If the callback returns false, the modal won't be opened.
     * @param shouldOpen The callback to set.
     * @remarks **Optional**
     * @returns This instance.
     */
    setShouldOpen(shouldOpen: IShouldOpenCallback): this;

    /**
     * Sets the on open callback.
     * Will be called when the modal is opened.
     * @param onOpen The callback to set.
     * @returns This instance.
     */
    setOnOpen(onOpen: IOpenCallback): this;

    /**
     * Sets the on close callback.
     * Will be called when the modal is closed.
     * @param onClose The callback to set.
     * @remarks **Optional**
     * @returns This instance.
     */
    setOnClose(onClose: ICloseCallback): this;

    /**
     * Sets the title of the modal.
     * @param title The title to set.
     * @returns This instance.
     */
    setTitle(title: string): this;

    /**
     * Appends content to the modal content.
     * @param content The content to append.
     * @returns This instance.
     */
    setContent(content: DocumentFragment): this;

    /**
     * Sets the draggable state of the modal.
     * @param isDraggable Whether the modal should be draggable.
     * @returns This instance.
     */
    setDraggableEnabled(isDraggable: boolean): this;

    /**
     * Sets whether the background should be dimmed.
     * @param willDimBackground Whether the background should be dimmed.
     * @returns This instance.
     */
    setBackgroundDimmed(willDimBackground: boolean): this;
}

/**
 * Interface for the callback to determine if the modal should open.
 * @returns {boolean} True if the modal can be opened, otherwise false.
 */
export interface IShouldOpenCallback {
    (): boolean;
}

/**
 * Interface for the callback to be called when the modal is opened.
 */
export interface IOpenCallback {
    (): void;
}

/**
 * Interface for the callback to be called when the modal is closed.
 */
export interface ICloseCallback {
    (): void;
}
