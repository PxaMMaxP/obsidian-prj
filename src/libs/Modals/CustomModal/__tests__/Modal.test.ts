/**
 * @jest-environment jsdom
 */

import MockLogger, {
    registerMockLogger,
    resetMockLogger,
} from 'src/__mocks__/ILogger.mock';
import { Flow } from 'src/libs/HTMLFlow/Flow';
import { IFlowSymbol, IFlowTag } from 'src/libs/HTMLFlow/interfaces/IFlowTag';
import { TSinjex } from 'ts-injex';
import { MockComponent_ } from '../__mocks__/Component.mock';
import { MissingCallbackError, CallbackError } from '../interfaces/Exceptions';
import { Modal } from '../Modal';

const mockIApp = {};

const mockILifecycleManager = {
    register: jest.fn(),
    unregister: jest.fn(),
};

const mockIDraggableElement = jest.fn().mockImplementation(() => ({
    enableDragging: jest.fn(),
}));

// Registering the mocks
registerMockLogger();
TSinjex.register('IApp', mockIApp);
TSinjex.register('ILifecycleManager_', mockILifecycleManager);
TSinjex.register('IDraggableElement_', mockIDraggableElement);
TSinjex.register('Obsidian.Component_', MockComponent_);
TSinjex.register('IFlow_', Flow);

describe('CustomModal', () => {
    let customModal: Modal;

    beforeEach(() => {
        const body = document.body as HTMLElement & IFlowTag;
        // Reset the flow symbol for each test
        body[IFlowSymbol] = undefined;
        body.innerHTML = ''; // Reset the document body for each test

        resetMockLogger();
        customModal = new Modal();
        customModal.setOnOpen(() => {});
    });

    test('should throw MissingCallbackError if _onOpen is not set when calling open', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        customModal.setOnOpen(undefined as any);
        expect(() => customModal.open()).toThrow(MissingCallbackError);

        expect(MockLogger.error).toHaveBeenCalledWith(
            'The onOpen callback must be set.',
        );
    });

    test('should call _shouldOpen and _onOpen when opening the modal', () => {
        const mockShouldOpen = jest.fn().mockReturnValue(true);
        const mockOnOpen = jest.fn();
        customModal.setShouldOpen(mockShouldOpen).setOnOpen(mockOnOpen);
        customModal.open();
        expect(mockShouldOpen).toHaveBeenCalled();
        expect(mockOnOpen).toHaveBeenCalled();
    });

    test('should not open the modal if _shouldOpen returns false', () => {
        const mockShouldOpen = jest.fn().mockReturnValue(false);
        const mockOnOpen = jest.fn();
        customModal.setShouldOpen(mockShouldOpen).setOnOpen(mockOnOpen);
        customModal.open();
        expect(mockShouldOpen).toHaveBeenCalled();
        expect(mockOnOpen).not.toHaveBeenCalled();
    });

    test('should call _onClose when closing the modal', () => {
        const mockOnClose = jest.fn();
        customModal.setOnClose(mockOnClose);
        customModal.open();
        customModal.close();
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('should build modal correctly when open is called', () => {
        const mockOnOpen = jest.fn();
        customModal.setOnOpen(mockOnOpen);
        customModal.open();

        expect(document.body.querySelector('.modal-container')).toBeTruthy();
        expect(document.body.querySelector('.modal-bg')).toBeTruthy();
        expect(document.body.querySelector('.modal-close-button')).toBeTruthy();
        expect(document.body.querySelector('.modal-title')).toBeTruthy();
        expect(document.body.querySelector('.modal-content')).toBeTruthy();
    });

    test('should handle draggable element correctly', () => {
        customModal.setDraggableEnabled(true).setOnOpen(() => {});
        customModal.open();

        expect(mockIDraggableElement).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.any(HTMLElement),
            expect.any(Object),
        );
    });

    test('should set title correctly', () => {
        customModal.setTitle('Test Title');
        customModal.setOnOpen(() => {});
        customModal.open();
        expect(customModal['_title'].textContent).toBe('Test Title');
    });

    test('should set content correctly', () => {
        const content = document.createDocumentFragment();
        const div = document.createElement('div');
        div.innerText = 'Test Content';
        content.appendChild(div);
        customModal.setContent(content);

        customModal.open();
        expect(customModal.content.contains(div)).toBe(true);
    });

    test('should register and unregister lifecycle events correctly', () => {
        customModal.setOnOpen(() => {});
        customModal.open();

        expect(mockILifecycleManager.register).toHaveBeenCalledWith(
            'before',
            'unload',
            expect.any(Function),
        );
        customModal.close();

        expect(mockILifecycleManager.unregister).toHaveBeenCalledWith(
            'before',
            'unload',
            expect.any(Function),
        );
    });

    test('should set modal pointer events correctly', () => {
        customModal.open();

        const modal = customModal['_modalContainer'].querySelector('.modal');
        expect((modal as HTMLDivElement).style.pointerEvents).toBe('auto');
    });

    test('should set background dimming correctly', () => {
        customModal.setBackgroundDimmed(false);
        expect(customModal['_settings']['willDimBackground']).toBe(false);

        customModal.setBackgroundDimmed(true);
        expect(customModal['_settings']['willDimBackground']).toBe(true);
    });

    test('should set background dimming styles correctly  when background is not dimmed', () => {
        customModal.setBackgroundDimmed(false);
        expect(customModal['_settings']['willDimBackground']).toBe(false);

        customModal.open();

        const container = customModal['_modalContainer'];
        expect(container.style.pointerEvents).toBe('none');
    });

    test('should set background dimming styles correctly when background is dimmed', () => {
        customModal.setBackgroundDimmed(true);
        expect(customModal['_settings']['willDimBackground']).toBe(true);

        customModal.open();

        const container = customModal['_modalContainer'];
        expect(container.style.pointerEvents).toBe('');
    });

    test('should set title to non-breaking space if given an empty string', () => {
        customModal.setTitle('');
        customModal.open();
        expect(customModal['_title'].textContent).toBe('\u00A0');
    });

    test('should log and throw CallbackError if _shouldOpen callback throws an error', () => {
        const error = new Error('Test Error');

        const mockShouldOpen = jest.fn().mockImplementation(() => {
            throw error;
        });
        customModal.setShouldOpen(mockShouldOpen);
        expect(() => customModal.open()).toThrow(CallbackError);

        expect(MockLogger.error).toHaveBeenCalledWith(
            'Error in shouldOpen callback',
            error,
        );
    });

    test('should log and throw CallbackError if _onOpen callback throws an error', () => {
        const error = new Error('Test Error');

        const mockOnOpen = jest.fn().mockImplementation(() => {
            throw error;
        });
        customModal.setOnOpen(mockOnOpen);
        expect(() => customModal.open()).toThrow(CallbackError);

        expect(MockLogger.error).toHaveBeenCalledWith(
            'Error in onOpen callback',
            error,
        );
    });

    test('should log and throw CallbackError if _onClose callback throws an error', () => {
        const error = new Error('Test Error');

        const mockOnClose = jest.fn().mockImplementation(() => {
            throw error;
        });
        customModal.setOnClose(mockOnClose);
        customModal.open();
        expect(() => customModal.close()).toThrow(CallbackError);

        expect(MockLogger.error).toHaveBeenCalledWith(
            'Error in onClose callback',
            error,
        );
    });
});
