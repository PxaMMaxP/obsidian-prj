import { Component } from 'obsidian';
import { DIContainer } from 'src/libs/DependencyInjection/DIContainer';

const RegisteredEvents = Symbol('Component');
const RegisteredChilds = Symbol('Component');
const Loaded = Symbol('Component');

interface RegisteredEvent {
    element: HTMLElement;
    event: string;
    callback: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
}

interface RegisteredChild {
    component: Component;
}

interface MockComponent extends Component {
    [RegisteredEvents]: RegisteredEvent[];
    [RegisteredChilds]: RegisteredChild[];
    [Loaded]: boolean;
    clearRegisteredEvents: () => void;
}

export const MockComponent: MockComponent = {
    [Loaded]: false,
    [RegisteredChilds]: [],

    [RegisteredEvents]: [],
    load: jest.fn(() => {
        MockComponent.onload();

        MockComponent[RegisteredChilds].forEach(({ component }) => {
            component.load?.();
        });

        MockComponent[Loaded] = true;
    }),
    onload: jest.fn(),
    unload: jest.fn(() => {
        MockComponent.onunload();

        MockComponent[RegisteredChilds].forEach(({ component }) => {
            component.unload?.();
        });

        MockComponent[Loaded] = false;
    }),
    onunload: jest.fn(),
    addChild: jest.fn((child) => {
        MockComponent[RegisteredChilds].push({ component: child });

        if (MockComponent[Loaded]) {
            child.load?.();
        }

        return child;
    }),
    removeChild: jest.fn((child) => {
        const index = MockComponent[RegisteredChilds].findIndex(
            ({ component }) => component === child,
        );

        if (index >= 0) {
            if (MockComponent[Loaded]) {
                child.unload?.();
            }
            MockComponent[RegisteredChilds].splice(index, 1);
        }

        return child;
    }),
    register: jest.fn(),
    registerEvent: jest.fn(),
    registerDomEvent: jest.fn((element, event, callback, options) => {
        element.addEventListener(event, callback, options);

        // Register the event for later removal
        MockComponent[RegisteredEvents].push({
            element,
            event,
            callback,
            options,
        });
    }) as unknown as Component['registerDomEvent'],
    registerInterval: jest.fn(),
    clearRegisteredEvents: jest.fn(() => {
        // Clear registered DOM events
        MockComponent[RegisteredEvents].forEach(
            ({ element, event, callback, options }) => {
                element.removeEventListener(event, callback, options);
            },
        );
        MockComponent[RegisteredEvents] = [];
    }),
};

export const MockComponentRef: MockComponent = {
    [Loaded]: false,
    [RegisteredChilds]: [],
    [RegisteredEvents]: MockComponent[RegisteredEvents],
    load: MockComponent.load,
    onload: MockComponent.onload,
    unload: MockComponent.unload,
    onunload: MockComponent.onunload,
    addChild: MockComponent.addChild,
    removeChild: MockComponent.removeChild,
    register: MockComponent.register,
    registerEvent: MockComponent.registerEvent,
    registerDomEvent: MockComponent.registerDomEvent,
    registerInterval: MockComponent.registerInterval,
    clearRegisteredEvents: MockComponent.clearRegisteredEvents,
};

export const MockComponent_ = jest.fn().mockImplementation(() => {
    return MockComponent;
});

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
    MockComponent.clearRegisteredEvents();
    const component = MockComponentRef as unknown as jest.Mocked<Component>;
    component.load.mockClear();
    component.onload.mockClear();
    component.unload.mockClear();
    component.onunload.mockClear();
    component.addChild.mockClear();
    component.removeChild.mockClear();
    component.register.mockClear();
    component.registerEvent.mockClear();
    component.registerDomEvent.mockClear();
    component.registerInterval.mockClear();
}
