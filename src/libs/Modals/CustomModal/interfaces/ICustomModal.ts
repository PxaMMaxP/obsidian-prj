import { Component } from 'obsidian';

/**
 * Static interface for the custom modal.
 * @see {@link ICustomModal}
 */
export interface ICustomModal_ {
    /**
     * Creates a new Modal.
     * @param isDraggable Whether the modal should be draggable.
     * @param willDimBackground Whether the background should be dimmed.
     * @param component The component that the modal belongs to.
     * @see {@link ICustomModal}
     */
    new (
        isDraggable: boolean,
        willDimBackground: boolean,
        component?: Component,
    ): ICustomModal;
}

/**
 * Interface for the custom modal.
 * @see {@link ICustomModal_}
 */
export interface ICustomModal {
    /**
     * Opens the modal.
     */
    open(): void;

    /**
     * Closes the modal.
     */
    close(): void;

    /**
     * Sets the title of the modal.
     * @param title The title to set.
     */
    setTitle(title: string): void;

    /**
     * Sets the content of the modal.
     * @param content The content to replace the current content with.
     */
    setContent(content: DocumentFragment): void;
}
