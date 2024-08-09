import { Component } from 'obsidian';

/**
 * Static interface for the draggable element.
 * @see {@link IDraggableElement}
 */
export interface IDraggableElement_ {
    /**
     * Creates a new instance of {@link IDraggableElement}.
     * @param draggableElement The element that should be draggable.
     * @param dragHandle The element that should be used as the drag handle.
     * @param component The component that the draggable element belongs to.
     */
    new (
        draggableElement: HTMLElement,
        dragHandle: HTMLElement,
        component: Component,
    ): IDraggableElement;
}

/**
 * Interface for the draggable element.
 * @see {@link IDraggableElement_}
 */
export interface IDraggableElement {
    /**
     * Enables dragging for the draggable element.
     */
    enableDragging(): void;

    /**
     * Gets the unique class name of the draggable element.
     */
    get className(): string;
}
