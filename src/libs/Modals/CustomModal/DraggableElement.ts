import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import {
    IDraggableElement,
    IDraggableElement_,
} from './interfaces/IDraggableElement';

/**
 * Draggable element class.
 */
@ImplementsStatic<IDraggableElement_>()
export class DraggableElement implements IDraggableElement {
    private readonly _component: Component;
    private readonly _draggableElement: HTMLElement;
    private readonly _dragHandle: HTMLElement;

    private _isDragging = false;
    private _currentX = 0;
    private _currentY = 0;
    private _initialX = 0;
    private _initialY = 0;

    private _animationFrameId: number | null = null;

    /**
     * Creates a new instance of the draggable element.
     * @param draggableElement The element that should be draggable.
     * @param dragHandle The element that should be used as the drag handle.
     * @param component The component that the draggable element belongs to.
     */
    constructor(
        draggableElement: HTMLElement,
        dragHandle: HTMLElement,
        component: Component,
    ) {
        this._component = component;
        this._draggableElement = draggableElement;
        this._dragHandle = dragHandle;
    }

    /**
     * @inheritdoc
     */
    public enableDragging(): void {
        this._dragHandle.style.cursor = 'grab';

        this._component.registerDomEvent(
            this._dragHandle,
            'mousedown',
            this.onMouseDown.bind(this),
        );

        this._component.registerDomEvent(
            document,
            'mousemove',
            this.onMouseMove.bind(this),
        );

        this._component.registerDomEvent(
            document,
            'mouseup',
            this.onMouseUp.bind(this),
        );
    }

    /**
     * Update the position of the draggable element.
     */
    private updatePosition(): void {
        this._draggableElement.style.transform = `translate(${this._currentX}px, ${this._currentY}px)`;
        this._animationFrameId = null;
    }

    /**
     * On mouse down event => start dragging.
     * @param event The mouse event.
     */
    private onMouseDown(event: MouseEvent): void {
        if (event.target === this._dragHandle) {
            this._isDragging = true;
            this._initialX = event.clientX - this._currentX;
            this._initialY = event.clientY - this._currentY;
            this._dragHandle.style.cursor = 'grabbing'; // Change cursor to grabbing
        }
    }

    /**
     * On mouse move event => move the draggable element.
     * @param event The mouse event.
     */
    private onMouseMove(event: MouseEvent): void {
        if (this._isDragging) {
            event.preventDefault();
            this._currentX = event.clientX - this._initialX;
            this._currentY = event.clientY - this._initialY;

            if (this._animationFrameId === null) {
                this._animationFrameId = requestAnimationFrame(
                    this.updatePosition.bind(this),
                );
            }
        }
    }

    /**
     * On mouse up event => stop dragging.
     */
    private onMouseUp(): void {
        if (this._isDragging) {
            this._isDragging = false;
            this._dragHandle.style.cursor = 'grab'; // Change cursor back to default

            if (this._animationFrameId !== null) {
                cancelAnimationFrame(this._animationFrameId);
                this._animationFrameId = null;
            }
        }
    }
}
