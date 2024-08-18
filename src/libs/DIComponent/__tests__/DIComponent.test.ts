/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { registerMockComponent } from '../../Modals/Modal/__mocks__/Component.mock';
import { DIComponent } from '../DIComponent';
import { IDIComponent } from '../interfaces/IDIComponent';
import { IComponent } from '../interfaces/IDIComponentCore';
import { EventCallback } from '../types/EventTypes';
import {
    _childrenComponents,
    _componentInstance,
    _componentOriginalMethods,
    _parentComponent,
    _registeredEvents,
    broadcastEvent,
    emitEvent,
    onEvent,
} from '../types/IDIComponentSymbols';

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

describe('DIComponent - Events', () => {
    class TestComponent extends DIComponent {
        public get registry() {
            return this[_registeredEvents];
        }

        public get children() {
            return this[_childrenComponents];
        }

        public get parent(): IDIComponent | IComponent | undefined {
            return this[_parentComponent];
        }

        public setLoaded(loaded: boolean) {
            this[_componentInstance]._loaded = loaded;
        }
    }

    let instance: TestComponent;

    beforeEach(() => {
        instance = new TestComponent();
    });

    test('registered events should be defined', () => {
        const cb: EventCallback = () => {};
        instance[onEvent]('test', cb);

        expect(instance.registry).toBeDefined();
        expect(instance.registry['test'].length).toBe(1);
        expect(instance.registry['test'][0]).toBe(cb);
    });

    test('a registered event should not called on `emitEvent` when the component is not loaded', () => {
        const cb = jest.fn();
        instance[onEvent]('test', cb);

        instance[emitEvent]('test');

        expect(cb).not.toHaveBeenCalled();
    });

    test('a registered event should be only loaded called on `emitEvent`', () => {
        const cb = jest.fn();
        instance[onEvent]('test', cb);

        instance.setLoaded(true);
        instance[emitEvent]('test');

        expect(cb).toHaveBeenCalled();
    });

    test('a registered event should not called on `broadcastEvent` when the component is not loaded', () => {
        const cb = jest.fn();
        instance[onEvent]('test', cb);

        instance[broadcastEvent]('test');

        expect(cb).not.toHaveBeenCalled();
    });

    test('a registered event should be only loaded called on `broadcastEvent`', () => {
        const cb = jest.fn();
        instance[onEvent]('test', cb);

        instance.setLoaded(true);
        instance[broadcastEvent]('test');

        expect(cb).toHaveBeenCalled();
    });

    test('an error should be log on console when an error occurs on event execution', () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const cb = () => {
            throw new Error('test');
        };
        instance[onEvent]('test', cb);

        instance.setLoaded(true);
        instance[broadcastEvent]('test');

        // eslint-disable-next-line no-console
        expect(console.error).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    test('the parent should be set on `addChild`', () => {
        const child = new TestComponent();
        instance.addChild(child);

        expect(child.parent).toBe(instance);
    });

    test('a event from `emitEvent` should be propagated to the parent when it is not executed', () => {
        const child = instance;
        const parent = new TestComponent();
        parent.addChild(child);

        const cb = jest.fn();
        parent[onEvent]('test', cb);

        parent.setLoaded(true);
        child.setLoaded(true);
        child[emitEvent]('test');

        expect(cb).toHaveBeenCalled();
    });

    test('a event from `broadcastEvent` should be propagated to the children', () => {
        const child = new TestComponent();
        instance.children.push(child);

        const cb = jest.fn();
        child[onEvent]('test', cb);

        child.setLoaded(true);
        instance.setLoaded(true);
        instance[broadcastEvent]('test');

        expect(cb).toHaveBeenCalled();
    });

    test('a `reflect` event should be reflected from the parent to the children', () => {
        const parent = instance;

        const child = new TestComponent();
        parent.children.push(child);

        const cb = jest.fn();
        child[onEvent]('test', cb);

        parent.setLoaded(true);
        child.setLoaded(true);
        child[emitEvent]('reflect', 'test');

        expect(cb).toHaveBeenCalled();
    });
});
