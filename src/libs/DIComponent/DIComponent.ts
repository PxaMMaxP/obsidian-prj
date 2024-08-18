import { Component } from 'obsidian';
import { DIComponentCore } from './DIComponentCore';
import { IDIComponent } from './interfaces/IDIComponent';
import { IComponent } from './interfaces/IDIComponentCore';
import {
    EventArgsType,
    EventCallback,
    EventKey,
    EventRegistry,
} from './types/EventTypes';
import {
    _childrenComponents,
    _IDIComponent,
    _parentComponent,
    _registeredEvents,
    isLoaded,
    shouldRemoveOnUnload,
} from './types/IDIComponentSymbols';
import {
    _componentClass,
    _componentInstance,
    _componentOriginalMethods,
} from './types/IDIComponentSymbols';
import { isIDIComponent } from './types/isIDIComponent';

/**
 * Custom implementation of {@link Component}
 * that uses dependency injection for itself.
 */
export abstract class DIComponent
    extends DIComponentCore
    implements IDIComponent
{
    protected [_registeredEvents]: EventRegistry = {};

    /**
     * @inheritdoc
     */
    constructor() {
        super();
    }

    /**
     * @inheritdoc
     */
    public readonly [_IDIComponent] = this;

    /**
     * @inheritdoc
     */
    public [_parentComponent]?: IDIComponent | IComponent;

    /**
     * @inheritdoc
     */
    public get [_childrenComponents](): (IDIComponent | IComponent)[] {
        return (
            (this[_componentInstance]._children as (
                | IDIComponent
                | IComponent
            )[]) ?? []
        );
    }

    /**
     * @inheritdoc
     */
    public get [isLoaded](): boolean {
        return this[_componentInstance]._loaded ?? false;
    }

    /**
     * @inheritdoc
     */
    public [shouldRemoveOnUnload] = false;

    /**
     * @inheritdoc
     */
    override addChild<T extends IComponent>(component: T): T {
        if (isIDIComponent(component)) {
            component[_parentComponent] = this;

            component[shouldRemoveOnUnload] = this[shouldRemoveOnUnload];

            component.register(() => {
                if (component[shouldRemoveOnUnload]) {
                    this.removeChild(component);
                }
            });
        }

        return super.addChild(component);
    }

    /**
     * Executes the events of the given type.
     * @param event The event to execute.
     * @param args The arguments to pass to the event.
     * @returns Whether the event has been executed.
     */
    private executeEvens(event: EventKey, ...args: unknown[]): boolean {
        let hasEventsExecuted = false;

        if (this[isLoaded]) {
            const registeredHandlers = this[_registeredEvents][event] as
                | EventCallback[]
                | undefined;

            if (registeredHandlers != null && registeredHandlers?.length > 0) {
                registeredHandlers.forEach((cb) => {
                    hasEventsExecuted = true;

                    try {
                        cb(...args);
                    } catch (error) {
                        //@todo: Check if we only log the error or throw it.
                        // eslint-disable-next-line no-console
                        console.error(
                            `Error executing event '${event}' with args:`,
                            args,
                            `Error:`,
                            error,
                        );
                    }
                });
            }
        }

        return hasEventsExecuted;
    }

    /**
     * @inheritdoc
     */
    emitEvent<EventArgs extends EventArgsType = EventArgsType>(
        event: EventKey,
        ...args: EventArgs[]
    ): void {
        if (this[isLoaded]) {
            const hasEventsExecuted = this.executeEvens(event, ...args);

            // Propagate the event to the parent component if it has not been executed.
            if (!hasEventsExecuted) {
                if (isIDIComponent(this[_parentComponent])) {
                    this[_parentComponent]?.emitEvent(event, ...args);
                }
            }
        }
    }

    /**
     * @inheritdoc
     */
    broadcastEvent<EventArgs extends EventArgsType = EventArgsType>(
        event: EventKey,
        ...args: EventArgs[]
    ): void {
        if (this[isLoaded]) {
            this.executeEvens(event, ...args);

            // Broadcast the event to all child components.
            this[_childrenComponents].forEach((child) => {
                if (isIDIComponent(child)) {
                    child.emitEvent?.(event, ...args);
                }
            });
        }
    }

    /**
     * @inheritdoc
     */
    on<EventArgs extends EventArgsType = EventArgsType>(
        event: EventKey,
        cb: EventCallback<EventArgs>,
    ): void {
        const eventRegister = this[_registeredEvents] as EventRegistry;

        if (!eventRegister[event]) {
            eventRegister[event] = [];
        }

        eventRegister[event].push(cb);
    }
}
