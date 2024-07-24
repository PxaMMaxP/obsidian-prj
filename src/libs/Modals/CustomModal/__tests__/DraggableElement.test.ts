/**
 * @jest-environment jsdom
 */

import { Component } from 'obsidian';
import { DraggableElement } from '../DraggableElement';

const mockComponent = {
    registerDomEvent: jest.fn((element, event, callback) => {
        element.addEventListener(event, callback);
    }),
};

describe('DraggableElement', () => {
    let draggableElement: DraggableElement;
    let draggableElementNode: HTMLElement;
    let dragHandleNode: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = ''; // Clear the document body before each test

        // Create mock DOM elements
        draggableElementNode = document.createElement('div');
        dragHandleNode = document.createElement('div');
        document.body.appendChild(draggableElementNode);
        document.body.appendChild(dragHandleNode);

        draggableElement = new DraggableElement(
            draggableElementNode,
            dragHandleNode,
            mockComponent as unknown as Component,
        );
    });

    test('should register drag events on enableDragging', () => {
        draggableElement.enableDragging();

        expect(mockComponent.registerDomEvent).toHaveBeenCalledWith(
            dragHandleNode,
            'mousedown',
            expect.any(Function),
        );

        expect(mockComponent.registerDomEvent).toHaveBeenCalledWith(
            document,
            'mousemove',
            expect.any(Function),
        );

        expect(mockComponent.registerDomEvent).toHaveBeenCalledWith(
            document,
            'mouseup',
            expect.any(Function),
        );
        expect(dragHandleNode.style.cursor).toBe('grab');
    });

    test('should start dragging on mousedown', () => {
        draggableElement.enableDragging();

        const mouseDownEvent = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 100,
            bubbles: true, // Ensure the event bubbles up
        });

        dragHandleNode.dispatchEvent(mouseDownEvent);

        expect(draggableElement['_isDragging']).toBe(true);
        expect(draggableElement['_initialX']).toBe(100);
        expect(draggableElement['_initialY']).toBe(100);
        expect(dragHandleNode.style.cursor).toBe('grabbing');
    });

    test('should move element on mousemove', () => {
        draggableElement.enableDragging();

        const mouseDownEvent = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 100,
            bubbles: true,
        });

        dragHandleNode.dispatchEvent(mouseDownEvent);

        const mouseMoveEvent = new MouseEvent('mousemove', {
            clientX: 150,
            clientY: 150,
            bubbles: true,
        });

        // Simulate the dragging state
        draggableElement['_isDragging'] = true;
        draggableElement['_initialX'] = 100;
        draggableElement['_initialY'] = 100;

        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            cb(0);

            return 1;
        });

        document.dispatchEvent(mouseMoveEvent);

        // Force the updatePosition call
        requestAnimationFrame(() => {
            expect(draggableElement['_currentX']).toBe(50);
            expect(draggableElement['_currentY']).toBe(50);

            expect(draggableElementNode.style.transform).toBe(
                'translate(50px, 50px)',
            );
        });
    });

    test('should stop dragging on mouseup', () => {
        draggableElement.enableDragging();

        const mouseDownEvent = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 100,
            bubbles: true,
        });

        dragHandleNode.dispatchEvent(mouseDownEvent);

        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });

        document.dispatchEvent(mouseUpEvent);

        expect(draggableElement['_isDragging']).toBe(false);
        expect(dragHandleNode.style.cursor).toBe('grab');
        expect(draggableElement['_animationFrameId']).toBeNull();
    });

    test('should cancel animation frame on mouseup if dragging', () => {
        draggableElement.enableDragging();

        draggableElement['_isDragging'] = true;
        draggableElement['_animationFrameId'] = requestAnimationFrame(() => {});

        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });

        document.dispatchEvent(mouseUpEvent);

        expect(draggableElement['_animationFrameId']).toBeNull();
    });
});
