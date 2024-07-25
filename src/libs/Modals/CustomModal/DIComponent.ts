import { Component, EventRef } from 'obsidian';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import type { ForceConstructor } from 'src/libs/DependencyInjection/types/GenericContructor';

const _componentSymbol = Symbol('_component');
const componentSymbol = Symbol('component');
const _Component_Symbol = Symbol('_Component_');

/**
 * Custom implementation of {@link Component}
 * that uses dependency injection for itself.
 */
export abstract class DIComponent implements Component {
    @Inject('Obsidian.Component_')
    private readonly [_Component_Symbol]!: ForceConstructor<Component>;

    private [_componentSymbol]?: Component;

    /**
     * Gets or creates the component instance.
     */
    private get [componentSymbol](): Component {
        if (this[_componentSymbol] == null) {
            this[_componentSymbol] = new this[_Component_Symbol]();
        }

        return this[_componentSymbol];
    }

    /**
     * @inheritdoc
     */
    constructor() {
        this[componentSymbol];

        this.load = this.load.bind(this);
        this.onload = this.onload.bind(this);
        this.unload = this.unload.bind(this);
        this.onunload = this.onunload.bind(this);
        this.addChild = this.addChild.bind(this);
        this.removeChild = this.removeChild.bind(this);
        this.register = this.register.bind(this);
        this.registerEvent = this.registerEvent.bind(this);
        this.registerDomEvent = this.registerDomEvent.bind(this);
        this.registerInterval = this.registerInterval.bind;
    }

    /**
     * @inheritdoc
     */
    load(): void {
        this[componentSymbol].load();
    }

    /**
     * @inheritdoc
     * @overload
     */
    onload(): void {
        this[componentSymbol].onload();
    }

    /**
     * @inheritdoc
     */
    unload(): void {
        this[componentSymbol].unload();
    }

    /**
     * @inheritdoc
     * @overload
     */
    onunload(): void {
        this[componentSymbol].onunload();
    }

    /**
     * @inheritdoc
     */
    addChild<T extends Component>(component: T): T {
        return this[componentSymbol].addChild(component);
    }

    /**
     * @inheritdoc
     */
    removeChild<T extends Component>(component: T): T {
        return this[componentSymbol].removeChild(component);
    }

    /**
     * @inheritdoc
     */
    register(cb: () => unknown): void {
        this[componentSymbol].register(cb);
    }

    /**
     * @inheritdoc
     */
    registerEvent(eventRef: EventRef): void {
        this[componentSymbol].registerEvent(eventRef);
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
            this[componentSymbol].registerDomEvent as (
                ...args: unknown[]
            ) => void
        )(...args);
    }

    /**
     * @inheritdoc
     */
    registerInterval(id: number): number {
        return this[componentSymbol].registerInterval(id);
    }
}
