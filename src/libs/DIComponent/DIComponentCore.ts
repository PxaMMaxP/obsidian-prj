import { EventRef } from 'obsidian';
import { LazzyLoading } from 'src/classes/decorators/LazzyLoading';
import { Inject } from 'ts-injex';
import type { ForceConstructor } from 'ts-injex';
import {
    IDIComponentCore,
    type IComponent,
} from './interfaces/IDIComponentCore';
import {
    _componentClass,
    _componentInstance,
    _componentOriginalMethods,
} from './types/IDIComponentSymbols';

/**
 * Custom implementation of {@link Component}
 * that uses dependency injection for itself.
 *
 * Core implementation of the DIComponent. Every extension of this class
 * should implement the {@link DIComponent} abstract class, which is derived
 * from this class.
 */
export abstract class DIComponentCore implements IDIComponentCore {
    @Inject('Obsidian.Component_')
    protected readonly [_componentClass]!: ForceConstructor<IComponent>;

    @LazzyLoading((ctx) => {
        return new ctx[_componentClass]();
    })
    protected [_componentInstance]!: IComponent;

    @LazzyLoading((ctx) => {
        return ctx.getOriginalMethods();
    })
    protected [_componentOriginalMethods]!: IComponent;

    /**
     * Gets the current original reference
     * of the methods of the component.
     * @returns The original reference of the methods of the component.
     */
    protected getOriginalMethods(): IComponent {
        const bindOrAssign = <T>(
            method: T & { bind?: (X: unknown) => T },
        ): T => (method?.bind ? method.bind(this[_componentInstance]) : method);

        return {
            load: bindOrAssign(this[_componentInstance].load),
            onload: bindOrAssign(this[_componentInstance].onload),
            unload: bindOrAssign(this[_componentInstance].unload),
            onunload: bindOrAssign(this[_componentInstance].onunload),
            addChild: bindOrAssign(this[_componentInstance].addChild),
            removeChild: bindOrAssign(this[_componentInstance].removeChild),
            register: bindOrAssign(this[_componentInstance].register),
            registerEvent: bindOrAssign(this[_componentInstance].registerEvent),
            registerDomEvent: bindOrAssign(
                this[_componentInstance].registerDomEvent,
            ),
            registerInterval: bindOrAssign(
                this[_componentInstance].registerInterval,
            ),
        };
    }

    /**
     * Overrides the original methods of the component.
     */
    protected overrideMethods(): void {
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
    addChild<ChildType extends IComponent>(component: ChildType): ChildType {
        // if (isIDIComponent(component)) {
        //     component[shouldRemoveOnUnload] = this[shouldRemoveOnUnload];

        //     component.register(() => {
        //         if (component[shouldRemoveOnUnload]) {
        //             this.removeChild(component);
        //         }
        //     });
        // }

        return this[_componentOriginalMethods].addChild(component);
    }

    /**
     * @inheritdoc
     */
    removeChild<ChildType extends IComponent>(component: ChildType): ChildType {
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
