/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from 'obsidian';
import { DIContainer } from 'src/libs/DependencyInjection/DIContainer';

const RegisteredEvents = Symbol('RegisteredEvents');
const RegisteredChilds = Symbol('RegisteredChilds');
const Loaded = Symbol('Loaded');
const Original = Symbol('Original');
/**
 * Mock component class.
 */
class MockComponent {
    [Loaded]: boolean;
    [RegisteredChilds]: { component: MockComponent }[];
    [RegisteredEvents]: {
        element: HTMLElement;
        event: string;
        callback: EventListenerOrEventListenerObject;
        options?: boolean | AddEventListenerOptions;
    }[];

    /**
     * Creates a new instance of the mock component.
     */
    constructor() {
        this[Loaded] = false;
        this[RegisteredChilds] = [];
        this[RegisteredEvents] = [];
    }

    load = jest.fn(function (this: MockComponent) {
        this.onload();

        this[RegisteredChilds].forEach(({ component }) => {
            component.load?.();
        });

        this[Loaded] = true;
    });

    onload = jest.fn(function (this: MockComponent) {});

    unload = jest.fn(function (this: MockComponent) {
        this.onunload();

        this[RegisteredChilds].forEach(({ component }) => {
            component.unload?.();
        });

        this[Loaded] = false;
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

    register = jest.fn(function (this: MockComponent) {});

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
        this[RegisteredEvents].push({
            element,
            event,
            callback,
            options,
        });
    });

    registerInterval = jest.fn(function (this: MockComponent) {});

    clearRegisteredEvents = jest.fn(function (this: MockComponent) {
        // Clear registered DOM events
        this[RegisteredEvents].forEach(
            ({ element, event, callback, options }) => {
                element.removeEventListener(event, callback, options);
            },
        );
        this[RegisteredEvents] = [];
    });
}

export const MockComponent_ = jest.fn().mockImplementation(() => {
    const mock = new MockComponent();
    registerMockInstance(mock);

    return mock;
});

const ActiveMocks: MockComponent[] = [];

/**
 *
 * @param instance
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
