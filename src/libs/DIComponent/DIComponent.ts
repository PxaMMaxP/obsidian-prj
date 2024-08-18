import { Component } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Register } from 'ts-injex';
import { DIComponentCore } from './DIComponentCore';
import { IDIComponent, IDIComponent_ } from './interfaces/IDIComponent';
import { IComponent } from './interfaces/IDIComponentCore';
import {
    EventCallback,
    EventKey,
    EventRegistry,
    InjectDelegate,
    SpecificEventCallback,
    SpecificEventMap,
} from './types/EventTypes';
import {
    _childrenComponents,
    _IDIComponent,
    _isReflected,
    _parentComponent,
    _registeredEvents,
    broadcastEvent,
    emitEvent,
    isLoaded,
    onEvent,
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
@Register('IDIComponent_')
@ImplementsStatic<IDIComponent_>()
export class DIComponent extends DIComponentCore implements IDIComponent {
    #hasRegistryEvent(event: EventKey): boolean {
        return (
            this[_registeredEvents][event] != null &&
            this[_registeredEvents][event]?.length > 0
        );
    }

    protected [_registeredEvents]: EventRegistry = {
        reflect: [
            (...args) => {
                if (
                    this[isLoaded] &&
                    this[_parentComponent] == null && // Only reflect if there is no parent component.
                    args.length > 0 &&
                    typeof args[0] === 'string'
                ) {
                    this[broadcastEvent](args[0], args.slice(1));

                    return _isReflected;
                }
            },
        ],
        inject: [
            (...args) => {
                if (
                    this[isLoaded] &&
                    args.length === 2 &&
                    typeof args[0] === 'string' &&
                    typeof args[1] === 'function' &&
                    this[_registeredEvents][args[0]]?.length > 0 // Check if the target event exists.
                ) {
                    try {
                        (args[1] as InjectDelegate)(this);
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error(
                            `Error injecting function with args:`,
                            args,
                            `Error:`,
                            error,
                        );
                    }
                }
            },
        ],
    };

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
        if (this[_componentInstance]._children == null)
            this[_componentInstance]._children = [];

        return this[_componentInstance]._children as (
            | IDIComponent
            | IComponent
        )[];
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
    #executeEvens(event: EventKey, ...args: unknown[]): boolean {
        let hasEventsExecuted = false;

        if (this[isLoaded]) {
            const registeredHandlers = this[_registeredEvents][event] as
                | (EventCallback | undefined)[]
                | undefined;

            if (registeredHandlers != null && registeredHandlers?.length > 0) {
                registeredHandlers.forEach((cb) => {
                    hasEventsExecuted = true;

                    try {
                        const returnValue = cb?.(...args);

                        if (returnValue === _isReflected)
                            hasEventsExecuted = false;
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
    public [emitEvent]<K extends keyof SpecificEventMap>(
        event: K,
        ...args: SpecificEventMap[K]
    ): void;
    /**
     * @inheritdoc
     */
    public [emitEvent](event: EventKey, ...args: unknown[]): void;
    /**
     * @inheritdoc
     */
    public [emitEvent](event: EventKey, ...args: unknown[]): void {
        if (this[isLoaded]) {
            const hasEventsExecuted = this.#executeEvens(event, ...args);

            // Propagate the event to the parent component if it has not been executed.
            if (!hasEventsExecuted) {
                if (isIDIComponent(this[_parentComponent])) {
                    this[_parentComponent]?.[emitEvent](event, ...args);
                }
            }
        }
    }

    /**
     * @inheritdoc
     */
    public [broadcastEvent]<K extends keyof SpecificEventMap>(
        event: K,
        ...args: SpecificEventMap[K]
    ): void;
    /**
     * @inheritdoc
     */
    public [broadcastEvent](event: EventKey, ...args: unknown[]): void;
    /**
     * @inheritdoc
     */
    public [broadcastEvent](event: EventKey, ...args: unknown[]): void {
        if (this[isLoaded]) {
            this.#executeEvens(event, ...args);

            // Broadcast the event to all child components.
            this[_childrenComponents].forEach((child) => {
                if (isIDIComponent(child)) {
                    child?.[broadcastEvent]?.(event, ...args);
                }
            });
        }
    }

    /**
     * @inheritdoc
     */
    [onEvent]<K extends keyof SpecificEventMap>(
        event: K,
        cb: SpecificEventCallback<K>,
    ): void;
    /**
     * @inheritdoc
     */
    public [onEvent](event: EventKey, cb: EventCallback): void;
    /**
     * @inheritdoc
     */
    public [onEvent](event: EventKey, cb: EventCallback): void {
        const eventRegister = this[_registeredEvents] as EventRegistry;

        if (!eventRegister[event]) {
            eventRegister[event] = [];
        }

        eventRegister[event].push(cb);
    }
}
