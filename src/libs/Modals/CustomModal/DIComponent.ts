import { Component, EventRef } from 'obsidian';
import { LazzyLoading } from 'src/classes/decorators/LazzyLoading';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import type { ForceConstructor } from 'src/libs/DependencyInjection/types/GenericContructor';

export const _componentInstance = Symbol('componentInstance');
export const _componentClass = Symbol('componentClass');
export const _componentOriginalMethods = Symbol('componentOriginalMethods');

/**
 * Custom implementation of {@link Component}
 * that uses dependency injection for itself.
 */
export abstract class DIComponent implements Component {
    @Inject('Obsidian.Component_')
    private readonly [_componentClass]!: ForceConstructor<Component>;

    @LazzyLoading((ctx) => {
        return new ctx[_componentClass]();
    })
    private [_componentInstance]!: Component;
    @LazzyLoading((ctx) => {
        return ctx.getOriginalMethods();
    })
    private [_componentOriginalMethods]!: Component;

    /**
     * Gets the current original reference
     * of the methods of the component.
     * @returns The original reference of the methods of the component.
     */
    private getOriginalMethods(): Component {
        return {
            load: this[_componentInstance].load.bind(this[_componentInstance]),
            onload: this[_componentInstance].onload.bind(
                this[_componentInstance],
            ),
            unload: this[_componentInstance].unload.bind(
                this[_componentInstance],
            ),
            onunload: this[_componentInstance].onunload.bind(
                this[_componentInstance],
            ),
            addChild: this[_componentInstance].addChild.bind(
                this[_componentInstance],
            ),
            removeChild: this[_componentInstance].removeChild.bind(
                this[_componentInstance],
            ),
            register: this[_componentInstance].register.bind(
                this[_componentInstance],
            ),
            registerEvent: this[_componentInstance].registerEvent.bind(
                this[_componentInstance],
            ),
            registerDomEvent: this[_componentInstance].registerDomEvent.bind(
                this[_componentInstance],
            ),
            registerInterval: this[_componentInstance].registerInterval.bind(
                this[_componentInstance],
            ),
        };
    }

    /**
     * Overrides the original methods of the component.
     */
    private overrideMethods(): void {
        if (this[_componentOriginalMethods]) {
            this[_componentInstance].load = this.load.bind(this);
            this[_componentInstance].onload = this.onload.bind(this);
            this[_componentInstance].unload = this.unload.bind(this);
            this[_componentInstance].onunload = this.onunload.bind(this);
            this[_componentInstance].addChild = this.addChild.bind(this);
            this[_componentInstance].removeChild = this.removeChild.bind(this);
            this[_componentInstance].register = this.register.bind(this);

            this[_componentInstance].registerEvent =
                this.registerEvent.bind(this);

            this[_componentInstance].registerDomEvent =
                this.registerDomEvent.bind(this);

            this[_componentInstance].registerInterval =
                this.registerInterval.bind(this);
        }
    }

    /**
     * @inheritdoc
     */
    constructor() {
        this.load = this.load.bind(this);
        this.onload = this.onload.bind(this);
        this.unload = this.unload.bind(this);
        this.onunload = this.onunload.bind(this);
        this.addChild = this.addChild.bind(this);
        this.removeChild = this.removeChild.bind(this);
        this.register = this.register.bind(this);
        this.registerEvent = this.registerEvent.bind(this);
        this.registerDomEvent = this.registerDomEvent.bind(this);
        this.registerInterval = this.registerInterval.bind(this);

        this.overrideMethods();
    }

    /**
     * @inheritdoc
     */
    load(): void {
        this[_componentOriginalMethods].load();
    }

    /**
     * @inheritdoc
     * @overload
     */
    onload(): void {
        this[_componentOriginalMethods].onload();
    }

    /**
     * @inheritdoc
     */
    unload(): void {
        this[_componentOriginalMethods].unload();
    }

    /**
     * @inheritdoc
     * @overload
     */
    onunload(): void {
        this[_componentOriginalMethods].onunload();
    }

    /**
     * @inheritdoc
     */
    addChild<T extends Component>(component: T): T {
        return this[_componentOriginalMethods].addChild(component);
    }

    /**
     * @inheritdoc
     */
    removeChild<T extends Component>(component: T): T {
        return this[_componentOriginalMethods].removeChild(component);
    }

    /**
     * @inheritdoc
     */
    register(cb: () => unknown): void {
        this[_componentOriginalMethods].register(cb);
    }

    /**
     * @inheritdoc
     */
    registerEvent(eventRef: EventRef): void {
        this[_componentOriginalMethods].registerEvent(eventRef);
    }

    /**
     * @inheritdoc
     */
    registerDomEvent<K extends keyof WindowEventMap>(
        el: Window,
        type: K,
        callback: (this: HTMLElement, ev: WindowEventMap[K]) => unknown,
        options?: boolean | AddEventListenerOptions,
    ): void;
    /**
     * @inheritdoc
     */
    registerDomEvent<K extends keyof DocumentEventMap>(
        el: Document,
        type: K,
        callback: (this: HTMLElement, ev: DocumentEventMap[K]) => unknown,
        options?: boolean | AddEventListenerOptions,
    ): void;
    /**
     * @inheritdoc
     */
    registerDomEvent<K extends keyof HTMLElementEventMap>(
        el: HTMLElement,
        type: K,
        callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
        options?: boolean | AddEventListenerOptions,
    ): void;
    /**
     * @inheritdoc
     */
    registerDomEvent(...args: unknown[]): void {
        (
            this[_componentOriginalMethods].registerDomEvent as (
                ...args: unknown[]
            ) => void
        )(...args);
    }

    /**
     * @inheritdoc
     */
    registerInterval(id: number): number {
        return this[_componentOriginalMethods].registerInterval(id);
    }
}
