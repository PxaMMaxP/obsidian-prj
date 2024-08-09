/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from 'obsidian';
import { DIContainer } from 'src/libs/DependencyInjection/DIContainer';

const RegisteredDomEvents = Symbol('RegisteredEvents');
const RegisteredChilds = Symbol('RegisteredChilds');
const Loaded = Symbol('Loaded');
const RegisteredUnloadingEvents = Symbol('Original');
/**
 * Mock component class.
 */
class MockComponent {
    /**
     * Gets whether the component is loaded.
     */
    protected get _loaded(): boolean {
        return this[Loaded];
    }

    /**
     * Sets whether the component is loaded.
     */
    protected set _loaded(value: boolean) {
        this[Loaded] = value;
    }

    [Loaded]: boolean;
    [RegisteredChilds]: { component: MockComponent }[];
    [RegisteredDomEvents]: {
        element: HTMLElement;
        event: string;
        callback: EventListenerOrEventListenerObject;
        options?: boolean | AddEventListenerOptions;
    }[];
    [RegisteredUnloadingEvents]: (() => void)[] = [];

    /**
     * Creates a new instance of the mock component.
     */
    constructor() {
        this[Loaded] = false;
        this[RegisteredChilds] = [];
        this[RegisteredDomEvents] = [];
    }

    load = jest.fn(function (this: MockComponent) {
        if (!this[Loaded]) {
            this[Loaded] = true;
            this.onload();
        }

        this[RegisteredChilds].forEach(({ component }) => {
            if (!component[Loaded]) {
                component.load?.();
            }
        });
    });

    onload = jest.fn(function (this: MockComponent) {});

    unload = jest.fn(function (this: MockComponent) {
        if (this[Loaded]) {
            this.onunload();
            this[Loaded] = false;
            this[RegisteredUnloadingEvents].forEach((cb) => cb());
        }

        this[RegisteredChilds].forEach(({ component }) => {
            if (component[Loaded]) {
                component.unload?.();
            }
        });
    });

    onunload = jest.fn(function (this: MockComponent) {});

    addChild = jest.fn(function (this: MockComponent, child: MockComponent) {
        this[RegisteredChilds].push({ component: child });

        if (this[Loaded]) {
            child.load?.();
        }

        return child;
    });

    removeChild = jest.fn(function (this: MockComponent, child: MockComponent) {
        const index = this[RegisteredChilds].findIndex(
            ({ component }) => component === child,
        );

        if (index >= 0) {
            if (this[Loaded]) {
                child.unload?.();
            }
            this[RegisteredChilds].splice(index, 1);
        }

        return child;
    });

    register = jest.fn(function (cb: () => unknown) {
        this[RegisteredUnloadingEvents].push(cb);
    });

    registerEvent = jest.fn(function (this: MockComponent) {});

    registerDomEvent = jest.fn(function (
        this: MockComponent,
        element: HTMLElement,
        event: string,
        callback: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ) {
        element.addEventListener(event, callback, options);

        // Register the event for later removal
        this[RegisteredDomEvents].push({
            element,
            event,
            callback,
            options,
        });
    });

    registerInterval = jest.fn(function (this: MockComponent) {});

    clearRegisteredEvents = jest.fn(function (this: MockComponent) {
        // Clear registered DOM events
        this[RegisteredDomEvents].forEach(
            ({ element, event, callback, options }) => {
                element.removeEventListener(event, callback, options);
            },
        );
        this[RegisteredDomEvents] = [];
    });
}

export const MockComponent_ = jest.fn().mockImplementation(() => {
    const mock = new MockComponent();
    registerMockInstance(mock);

    return mock;
});

const ActiveMocks: MockComponent[] = [];

/**
 * Register the mock instance on the active mocks list.
 * @param instance The instance to register.
 */
function registerMockInstance(instance: MockComponent): void {
    ActiveMocks.push(instance);
}

/**
 * Register the mock component on the DI container
 * as `Obsidian.Component_`.
 */
export function registerMockComponent(): void {
    const diContainer = DIContainer.getInstance();
    diContainer.register('Obsidian.Component_', MockComponent_);
}

/**
 * Reset the mock component
 * and clear all registered dom events.
 */
export function resetMockComponent(): void {
    ActiveMocks.forEach((instance) => {
        instance.clearRegisteredEvents();
        // instance.load.mockClear();
        // instance.onload.mockClear();
        // instance.unload.mockClear();
        // instance.onunload.mockClear();
        // instance.addChild.mockClear();
        // instance.removeChild.mockClear();
        // instance.register.mockClear();
        // instance.registerEvent.mockClear();
        // instance.registerDomEvent.mockClear();
        // instance.registerInterval.mockClear();
    });
}
