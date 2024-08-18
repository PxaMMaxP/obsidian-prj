import { IComponent } from './IDIComponentCore';
import { EventArgsType, EventKey, EventCallback } from '../types/EventTypes';
import {
    _childrenComponents,
    _IDIComponent,
    _parentComponent,
    isLoaded,
    shouldRemoveOnUnload,
} from '../types/IDIComponentSymbols';

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
     * Emits an event with the given name and arguments
     * which can be listened to by any parent component
     * in the hierarchy.
     * **Once listened to, the event will not be propagated.**
     * @param event The name of the event.
     * @param args The arguments to pass to the event.
     */
    emitEvent<EventArgs extends EventArgsType = EventArgsType>(
        event: EventKey,
        ...args: EventArgs[]
    ): void;

    /**
     * Broadcasts an event with the given name and arguments
     * to all child components in the hierarchy.
     * **The event is always passed on regardless of listeners.**
     * @param event The name of the event.
     * @param args The arguments to pass to the event.
     */
    broadcastEvent<EventArgs extends EventArgsType = EventArgsType>(
        event: EventKey,
        ...args: EventArgs[]
    ): void;

    /**
     * Registers a callback to be called when the event is emitted.
     * Works for both parent and child components;
     * e.g. with `emitEvent` and `broadcastEvent`.
     * @param event The name of the event or `*` for all events.
     * @param cb The callback to call when the event is emitted.
     */
    on<EventArgs extends EventArgsType = EventArgsType>(
        event: EventKey,
        cb: EventCallback<EventArgs>,
    ): void;
}
