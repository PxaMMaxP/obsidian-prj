/**
 * @jest-environment jsdom
 */

import { Component } from 'obsidian';
import { DIContainer } from 'src/libs/DependencyInjection/DIContainer';
import {
    MockComponent_,
    registerMockComponent,
    resetMockComponent,
} from '../__mocks__/Component.mock';
import { DraggableElement } from '../DraggableElement';
import { ICSSStyleRuleComponent } from '../interfaces/ICSSStyleRuleComponent';

registerMockComponent();

const MockICSSStyleRuleComponent: Partial<ICSSStyleRuleComponent> = {
    onload: jest.fn(),
    onunload: jest.fn(),
    updateProperty: jest.fn(),
};

const MockICSSStyleRuleComponent_ = jest.fn().mockImplementation(() => {
    return MockICSSStyleRuleComponent;
});

DIContainer.getInstance().register(
    'ICSSStyleRuleComponent_',
    MockICSSStyleRuleComponent_,
);

describe('DraggableElement', () => {
    let draggableElement: DraggableElement;
    let mockElement: HTMLElement;
    let mockHandle: HTMLElement;
    let mockComponent: Component;

    beforeEach(() => {
        jest.clearAllMocks();
        resetMockComponent();
        mockComponent = new MockComponent_();
        mockElement = document.createElement('div');
        mockHandle = document.createElement('div');

        draggableElement = new DraggableElement(
            mockElement,
            mockHandle,
            mockComponent,
        );
    });

    it('should initialize with correct properties', () => {
        expect(draggableElement).toBeInstanceOf(DraggableElement);

        expect(mockComponent.addChild).toHaveBeenCalledWith(draggableElement);

        expect(mockElement.classList.contains(draggableElement.className)).toBe(
            true,
        );
        expect(MockICSSStyleRuleComponent_.mock.instances.length).toBe(1);
        expect(MockICSSStyleRuleComponent.onload).toHaveBeenCalled();
    });

    it.skip('should enable dragging', () => {
        draggableElement.enableDragging();
        expect(mockHandle.style.cursor).toBe('grab');
        expect(mockComponent.registerDomEvent).toHaveBeenCalledTimes(3);

        expect(mockComponent.registerDomEvent).toHaveBeenCalledWith(
            mockHandle,
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
    });

    it('should handle mousedown event', () => {
        const event = new MouseEvent('mousedown', {
            clientX: 100,
            clientY: 100,
        });
        jest.spyOn(event, 'target', 'get').mockReturnValue(mockHandle);

        draggableElement.enableDragging();
        mockHandle.dispatchEvent(event);

        expect(draggableElement['_isDragging']).toBe(true);
        expect(draggableElement['_initialX']).toBe(100);
        expect(draggableElement['_initialY']).toBe(100);
        expect(mockHandle.style.cursor).toBe('grabbing');
    });

    it('should handle mousemove event', () => {
        jest.useFakeTimers();

        draggableElement.enableDragging();
        draggableElement['_isDragging'] = true;
        draggableElement['_initialX'] = 50;
        draggableElement['_initialY'] = 50;

        const event = new MouseEvent('mousemove', {
            clientX: 150,
            clientY: 150,
        });
        document.dispatchEvent(event);

        jest.advanceTimersByTime(16);

        expect(draggableElement['_currentX']).toBe(100);
        expect(draggableElement['_currentY']).toBe(100);

        expect(MockICSSStyleRuleComponent.updateProperty).toHaveBeenCalledWith(
            'translate(100px, 100px)',
        );

        jest.useRealTimers();
    });

    it('should handle mouseup event', () => {
        draggableElement.enableDragging();
        draggableElement['_isDragging'] = true;
        mockHandle.style.cursor = 'grabbing';

        const event = new MouseEvent('mouseup');
        document.dispatchEvent(event);

        expect(draggableElement['_isDragging']).toBe(false);
        expect(mockHandle.style.cursor).toBe('grab');
    });

    it('should unload properly', () => {
        draggableElement.onunload();
        expect(MockICSSStyleRuleComponent.onunload).toHaveBeenCalled();
    });

    it('should generate a UID', () => {
        const uid = draggableElement['generateUID']();
        expect(uid).toHaveLength(12);
        expect(/[a-zA-Z0-9]{12}/.test(uid)).toBe(true);
    });
});
