import { Component } from 'obsidian';
import { DIContainer } from 'src/libs/DependencyInjection/DIContainer';

const MockComponentSymbol = Symbol('Component');

interface RegisteredEvent {
    element: HTMLElement;
    event: string;
    callback: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
}

interface MockComponent extends Component {
    [MockComponentSymbol]: RegisteredEvent[];
    clearRegisteredEvents: () => void;
}

export const MockComponent: MockComponent = {
    [MockComponentSymbol]: [],
    load: jest.fn(),
    onload: jest.fn(),
    unload: jest.fn(),
    onunload: jest.fn(),
    addChild: jest.fn(),
    removeChild: jest.fn(),
    register: jest.fn(),
    registerEvent: jest.fn(),
    registerDomEvent: jest.fn((element, event, callback, options) => {
        element.addEventListener(event, callback, options);

        // Register the event for later removal
        MockComponent[MockComponentSymbol].push({
            element,
            event,
            callback,
            options,
        });
    }) as unknown as Component['registerDomEvent'],
    registerInterval: jest.fn(),
    clearRegisteredEvents: jest.fn(() => {
        // Clear registered DOM events
        MockComponent[MockComponentSymbol].forEach(
            ({ element, event, callback, options }) => {
                element.removeEventListener(event, callback, options);
            },
        );
        MockComponent[MockComponentSymbol] = [];
    }),
};

export const MockComponentRef: MockComponent = {
    [MockComponentSymbol]: MockComponent[MockComponentSymbol],
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
    const component = MockComponent as unknown as jest.Mocked<Component>;
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
