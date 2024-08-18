import { IComponent } from './IDIComponentCore';
import {
    EventKey,
    EventCallback,
    SpecificEventCallback,
    SpecificEventMap,
    InjectDelegate,
} from '../types/EventTypes';
import {
    _childrenComponents,
    _IDIComponent,
    _parentComponent,
    broadcastEvent,
    emitEvent,
    isLoaded,
    onEvent,
    shouldRemoveOnUnload,
} from '../types/IDIComponentSymbols';

export interface IDIComponent_ {
    new (): IDIComponent;
}

export interface IDIComponent extends IComponent, IDIComponentEvents {
    /**
     * A reference to the IDIComponent,
     * if the component is an instance of it.
     */
    readonly [_IDIComponent]?: IDIComponent;

    /**
     * Gets whether the component is loaded.
     */
    readonly [isLoaded]: boolean;

    /**
     * Gets whether the component should be automatically removed
     * from the parent component when unloaded.
     * Only works if both components are instances of IDIComponent.
     */
    [shouldRemoveOnUnload]: boolean;

    /**
     * The parent component of the component.
     */
    [_parentComponent]?: IDIComponent | IComponent;

    /**
     * The children components of the component.
     */
    [_childrenComponents]?: (IDIComponent | IComponent)[];

    /**
     * Add a child component to the component and
     * if the child component is an instance of {@link IDIComponent}
     * and `shouldRemoveOnUnload` is set to `true`,
     * it will be automatically removed when unloaded.
     * @inheritdoc
     */
    addChild<T extends IComponent>(component: T): T;
}

/**
 * Event related interface for IDIComponent.
 */
export interface IDIComponentEvents {
    /**
     * @inheritdoc
     */
    [emitEvent]<K extends keyof SpecificEventMap>(
        event: K,
        ...args: SpecificEventMap[K]
    ): void;

    /**
     * Emits an event with the given name and arguments
     * which can be listened to by any parent component
     * in the hierarchy.
     * **Once listened to, the event will not be propagated.**
     * @param event The name of the event.
     * @param args The arguments to pass to the event.
     */
    [emitEvent](event: EventKey, ...args: unknown[]): void;

    /**
     * Emits an event which will be reflected by the last parent.
     * The parent emits an event with the `reflectedEvent` as name
     * and the given arguments.
     * @param event 'reflect'
     * @param reflectedEvent The name of the reflected event.
     * @param args The arguments to pass to the event.
     */
    [emitEvent](
        event: 'reflect',
        reflectedEvent: EventKey,
        ...args: unknown[]
    ): void;

    /**
     * Broadcasts an event with the given name and arguments
     * to all child components in the hierarchy.
     * **The event is always passed on regardless of listeners.**
     * @param event The name of the event.
     * @param args The arguments to pass to the event.
     */
    [broadcastEvent](event: EventKey, ...args: unknown[]): void;

    /**
     * Broadcasts an event with `targetEvent` as name and
     * `targetHandler` as delegate to all child components in the hierarchy.
     * @param event 'inject'
     * @param targetEvent The name of the event in the receiver components.
     * @param targetHandler The delegate to send to the receiver components.
     */
    [broadcastEvent](
        event: 'inject',
        targetEvent: EventKey,
        targetHandler: InjectDelegate,
    ): void;

    /**
     * @inheritdoc
     */
    [broadcastEvent]<K extends keyof SpecificEventMap>(
        event: K,
        ...args: SpecificEventMap[K]
    ): void;

    /**
     * Registers a callback to be called when the event is emitted.
     * Works for both parent and child components;
     * e.g. with `emitEvent` and `broadcastEvent`.
     * @param event The name of the event or `*` for all events.
     * @param cb The callback to call when the event is emitted.
     */
    [onEvent](event: EventKey, cb: EventCallback): void;

    [onEvent]<K extends keyof SpecificEventMap>(
        event: K,
        cb: SpecificEventCallback<K>,
    ): void;
}
