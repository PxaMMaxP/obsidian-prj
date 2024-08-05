/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { registerMockComponent } from '../__mocks__/Component.mock';
import {
    _componentInstance,
    _componentOriginalMethods,
    DIComponent,
} from '../DIComponent';

registerMockComponent();

describe('DIComponent', () => {
    beforeAll(() => {
        //resetMockComponent();
    });

    test('Initialization of Component Instance', () => {
        class TestComponent extends DIComponent {}
        const instance = new TestComponent();
        expect(instance[_componentInstance]).toBeDefined();
    });

    test('Initialization of Original Methods', () => {
        class TestComponent extends DIComponent {}
        const instance = new TestComponent();
        expect(instance[_componentOriginalMethods]).toBeDefined();

        expect(instance[_componentOriginalMethods].load).toBeDefined();
    });

    test('Constructor Method Binding', () => {
        class TestComponent extends DIComponent {}
        const instance = new TestComponent();
        expect(instance.load).toBeInstanceOf(Function);
        expect(instance.onload).toBeInstanceOf(Function);
    });

    test('Load Method Internal Call', () => {
        class TestComponent extends DIComponent {
            load = jest.fn(() => super.load());
        }
        const instance = new TestComponent();
        instance.load();
        expect(instance.load).toHaveBeenCalled();
    });

    test('Onload Method Internal Call', () => {
        class TestComponent extends DIComponent {
            onload = jest.fn(() => super.onload());
        }
        const instance = new TestComponent();
        instance.onload();
        expect(instance.onload).toHaveBeenCalled();
    });

    test('Unload Method Internal Call', () => {
        class TestComponent extends DIComponent {
            unload = jest.fn(() => super.unload());
        }
        const instance = new TestComponent();
        instance.unload();
        expect(instance.unload).toHaveBeenCalled();
    });

    test('Onunload Method Internal Call', () => {
        class TestComponent extends DIComponent {
            onunload = jest.fn(() => super.onunload());
        }
        const instance = new TestComponent();
        instance.onunload();
        expect(instance.onunload).toHaveBeenCalled();
    });

    test('AddChild Method Internal Call', () => {
        class TestComponent extends DIComponent {
            addChild = jest.fn((child) => super.addChild(child));
        }
        const instance = new TestComponent();
        const child = {};
        instance.addChild(child as any);
        expect(instance.addChild).toHaveBeenCalledWith(child);
    });

    test('RemoveChild Method Internal Call', () => {
        class TestComponent extends DIComponent {
            removeChild = jest.fn((child) => super.removeChild(child));
        }
        const instance = new TestComponent();
        const child = {};
        instance.removeChild(child as any);
        expect(instance.removeChild).toHaveBeenCalledWith(child);
    });

    test('Register Method Internal Call', () => {
        class TestComponent extends DIComponent {
            register = jest.fn((cb) => super.register(cb));
        }
        const instance = new TestComponent();
        const callback = jest.fn();
        instance.register(callback);
        expect(instance.register).toHaveBeenCalledWith(callback);
    });

    test('RegisterEvent Method Internal Call', () => {
        class TestComponent extends DIComponent {
            registerEvent = jest.fn((eventRef) =>
                super.registerEvent(eventRef),
            );
        }
        const instance = new TestComponent();
        const eventRef = {} as any;
        instance.registerEvent(eventRef);
        expect(instance.registerEvent).toHaveBeenCalledWith(eventRef);
    });

    test('RegisterDomEvent Method Internal Call', () => {
        class TestComponent extends DIComponent {
            registerDomEvent = jest.fn((el, type, callback, options) =>
                super.registerDomEvent(el, type, callback, options),
            );
        }
        const instance = new TestComponent();
        const element = document.createElement('div');
        const callback = jest.fn();
        instance.registerDomEvent(element, 'click', callback, undefined);

        expect(instance.registerDomEvent).toHaveBeenCalledWith(
            element,
            'click',
            callback,
            undefined,
        );
    });

    test('RegisterInterval Method Internal Call', () => {
        class TestComponent extends DIComponent {
            registerInterval = jest.fn((id) => super.registerInterval(id));
        }
        const instance = new TestComponent();
        const id = 1;
        instance.registerInterval(id);
        expect(instance.registerInterval).toHaveBeenCalledWith(id);
    });
});
