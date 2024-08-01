import { Component, EventRef } from 'obsidian';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import type { ForceConstructor } from 'src/libs/DependencyInjection/types/GenericContructor';

const __componentInstance = Symbol('componentInstance');
const _componentClass = Symbol('componentClass');
const _componentOriginalMethods = Symbol('componentOriginalMethods');

/**
 * Custom implementation of {@link Component}
 * that uses dependency injection for itself.
 */
export abstract class DIComponent implements Component {
    @Inject('Obsidian.Component_')
    private readonly [_componentClass]!: ForceConstructor<Component>;

    private [__componentInstance]?: Component;
    private [_componentOriginalMethods]?: Component;

    /**
     * Retrieves or initializes the component instance.
     */
    private get componentInstance(): Component {
        if (!this[__componentInstance]) {
            this[__componentInstance] = new this[_componentClass]();
        }

        return this[__componentInstance];
    }

    /**
     * Retrieves or initializes the original methods of the component.
     */
    private get componentOriginalMethods(): Component {
        if (!this[_componentOriginalMethods]) {
            this[_componentOriginalMethods] = this.getOriginalMethods();
        }

        return this[_componentOriginalMethods];
    }

    /**
     * Gets the current original reference
     * of the methods of the component.
     * @returns The original reference of the methods of the component.
     */
    private getOriginalMethods(): Component {
        return {
            load: this.componentInstance.load.bind(this.componentInstance),
            onload: this.componentInstance.onload.bind(this.componentInstance),
            unload: this.componentInstance.unload.bind(this.componentInstance),
            onunload: this.componentInstance.onunload.bind(
                this.componentInstance,
            ),
            addChild: this.componentInstance.addChild.bind(
                this.componentInstance,
            ),
            removeChild: this.componentInstance.removeChild.bind(
                this.componentInstance,
            ),
            register: this.componentInstance.register.bind(
                this.componentInstance,
            ),
            registerEvent: this.componentInstance.registerEvent.bind(
                this.componentInstance,
            ),
            registerDomEvent: this.componentInstance.registerDomEvent.bind(
                this.componentInstance,
            ),
            registerInterval: this.componentInstance.registerInterval.bind(
                this.componentInstance,
            ),
        };
    }

    /**
     * Overrides the original methods of the component.
     */
    private overrideMethods(): void {
        if (this.componentOriginalMethods) {
            this.componentInstance.load = this.load.bind(this);
            this.componentInstance.onload = this.onload.bind(this);
            this.componentInstance.unload = this.unload.bind(this);
            this.componentInstance.onunload = this.onunload.bind(this);
            this.componentInstance.addChild = this.addChild.bind(this);
            this.componentInstance.removeChild = this.removeChild.bind(this);
            this.componentInstance.register = this.register.bind(this);

            this.componentInstance.registerEvent =
                this.registerEvent.bind(this);

            this.componentInstance.registerDomEvent =
                this.registerDomEvent.bind(this);

            this.componentInstance.registerInterval =
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
        this.componentOriginalMethods.load();
    }

    /**
     * @inheritdoc
     * @overload
     */
    onload(): void {
        this.componentOriginalMethods.onload();
    }

    /**
     * @inheritdoc
     */
    unload(): void {
        this.componentOriginalMethods.unload();
    }

    /**
     * @inheritdoc
     * @overload
     */
    onunload(): void {
        this.componentOriginalMethods.onunload();
    }

    /**
     * @inheritdoc
     */
    addChild<T extends Component>(component: T): T {
        return this.componentOriginalMethods.addChild(component);
    }

    /**
     * @inheritdoc
     */
    removeChild<T extends Component>(component: T): T {
        return this.componentOriginalMethods.removeChild(component);
    }

    /**
     * @inheritdoc
     */
    register(cb: () => unknown): void {
        this.componentOriginalMethods.register(cb);
    }

    /**
     * @inheritdoc
     */
    registerEvent(eventRef: EventRef): void {
        this.componentOriginalMethods.registerEvent(eventRef);
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
            this.componentOriginalMethods.registerDomEvent as (
                ...args: unknown[]
            ) => void
        )(...args);
    }

    /**
     * @inheritdoc
     */
    registerInterval(id: number): number {
        return this.componentOriginalMethods.registerInterval(id);
    }
}
