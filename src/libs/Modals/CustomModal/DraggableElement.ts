import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Register } from 'ts-injex';
import { Inject } from 'ts-injex';
import type {
    ICSSStyleRuleComponent,
    ICSSStyleRuleComponent_,
} from './interfaces/ICSSStyleRuleComponent';
import {
    IDraggableElement,
    IDraggableElement_,
} from './interfaces/IDraggableElement';
import { DIComponent } from '../../DIComponent/DIComponent';

/**
 * Draggable element class.
 */
@Register('IDraggableElement_')
@ImplementsStatic<IDraggableElement_>()
export class DraggableElement extends DIComponent implements IDraggableElement {
    @Inject('ICSSStyleRuleComponent_')
    private readonly _ICSSStyleRuleComponent_!: ICSSStyleRuleComponent_;

    private _className?: string;
    /**
     * Gets the unique class name of the draggable element.
     */
    public get className(): string {
        if (this._className == null) {
            this._className = this.generateUID();
        }

        return this._className;
    }
    private readonly _component: Component;
    private readonly _draggableElement?: HTMLElement;
    private readonly _dragHandle?: HTMLElement;

    private readonly _cssRuleComponent: ICSSStyleRuleComponent;

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
        draggableElement: HTMLElement | undefined,
        dragHandle: HTMLElement | undefined,
        component: Component,
    ) {
        super();

        this._component = component;
        this._component.addChild(this);

        this._draggableElement = draggableElement;
        this._dragHandle = dragHandle;

        this._draggableElement?.classList.add(`${this.className}`);

        // Initialisiere CSSStyleRuleComponent
        this._cssRuleComponent = new this._ICSSStyleRuleComponent_(
            `.${this.className}`,
            'transform',
        );
        this._cssRuleComponent.onload();
    }

    /**
     * Unload the draggable element.
     */
    onunload(): void {
        this._cssRuleComponent.onunload();

        if (this._animationFrameId !== null) {
            cancelAnimationFrame(this._animationFrameId);
        }
    }

    /**
     * @inheritdoc
     */
    public enableDragging(): void {
        if (this._dragHandle != null) {
            this._dragHandle.style.cursor = 'grab';

            this.registerDomEvent(
                this._dragHandle,
                'mousedown',
                this.onMouseDown.bind(this),
            );
        }

        this.registerDomEvent(
            document,
            'mousemove',
            this.onMouseMove.bind(this),
        );

        this.registerDomEvent(document, 'mouseup', this.onMouseUp.bind(this));
    }

    /**
     * Update the position of the draggable element.
     */
    private updatePosition(): void {
        if (this._draggableElement == null) {
            return;
        }

        const transformValue = `translate(${this._currentX}px, ${this._currentY}px)`;

        this._cssRuleComponent.updateProperty(transformValue);
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
                this._animationFrameId = requestAnimationFrame(() => {
                    this.updatePosition();
                    this._animationFrameId = null;
                });
            }
        }
    }

    /**
     * On mouse up event => stop dragging.
     */
    private onMouseUp(): void {
        if (this._isDragging) {
            this._isDragging = false;

            if (this._dragHandle != null) {
                this._dragHandle.style.cursor = 'grab'; // Change cursor back to default
            }
        }
    }

    /**
     * Generates a random UID with a maximum length of 12 characters.
     * The UID will be a combination of random letters and numbers.
     * @returns The generated UID.
     */
    private generateUID(): string {
        const charset =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let uid = 'x';

        for (let i = 0; i < 11; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            uid += charset[randomIndex];
        }

        return uid;
    }
}
