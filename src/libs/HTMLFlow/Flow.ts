import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import type { IFlow, IFlowApiType } from './interfaces/IFlow';
import { IFlow_, IFlowApi } from './interfaces/IFlow';
import type { IFlowTag } from './interfaces/IFlowTag';
import { IFlowSymbol, isIFlowTagged } from './interfaces/IFlowTag';
import { isConfigFunction, isFindFunction } from './types/IFlowDelegates';
import type {
    IFlowConfig,
    IFlowElCallback,
    IFlowEventCallback,
    IFlowThenCallback,
} from './types/IFlowDelegates';
import { Inject } from '../DependencyInjection/decorators/Inject';
import { Register } from '../DependencyInjection/decorators/Register';
import { DIComponent } from '../Modals/CustomModal/DIComponent';
import {
    isLoaded,
    shouldRemoveOnUnload,
} from '../Modals/CustomModal/interfaces/IDIComponent';

/**
 * A HTML Fluent API class.
 */
@Register('IFlow_')
@ImplementsStatic<IFlow_<keyof HTMLElementTagNameMap>>()
export class Flow<Tag extends keyof HTMLElementTagNameMap>
    extends DIComponent
    implements IFlow<Tag>
{
    /**
     * @inheritdoc
     */
    public override [shouldRemoveOnUnload] = true;

    /**
     * @inheritdoc
     */
    public readonly [IFlowSymbol] = true;

    //#region Dependencies
    @Inject('ILogger_', (x: ILogger_) => x.getLogger(''), false)
    protected _logger?: ILogger;
    //#endregion

    //#region Properties
    private _config: IFlowConfig<Tag>;
    private readonly _element: HTMLElementTagNameMap[Tag] & IFlowTag;

    /**
     * @inheritdoc
     */
    public get config(): IFlowConfig<Tag> {
        return this._config;
    }

    /**
     * @inheritdoc
     */
    public set config(value: IFlowConfig<Tag>) {
        if (this[isLoaded] === false && this._config != null) {
            this._config = Flow.injectedCfg(this._config, value);
        } else if (this[isLoaded] === true) {
            this._logger?.warn(
                'The configuration cannot be changed after the element is loaded.',
            );
        } else {
            this._config = value;
        }
    }

    /**
     * Inject the given configuration after the current configuration.
     * @param cfg The current configuration.
     * @param injectCfg The given configuration to inject.
     * @returns The merged configuration.
     */
    private static injectedCfg(
        cfg: IFlowConfig<keyof HTMLElementTagNameMap>,
        injectCfg: IFlowConfig<keyof HTMLElementTagNameMap>,
    ): IFlowConfig<keyof HTMLElementTagNameMap> {
        const mergedCfg: IFlowConfig<keyof HTMLElementTagNameMap> = (api) => {
            cfg(api);
            injectCfg(api);
        };

        return mergedCfg;
    }

    /**
     * @inheritdoc
     */
    public get element(): HTMLElementTagNameMap[Tag] {
        return this._element;
    }
    //#endregion

    /**
     * Creates a new Flow instance.
     * @param tag The tag name of the element to create or
     * the element to use as the Flow instance.
     * @param cfg The configuration to apply to the element.
     */
    constructor(tag: Tag | HTMLElementTagNameMap[Tag], cfg: IFlowConfig<Tag>) {
        const tagName = typeof tag === 'string' ? tag : undefined;

        const tagElement =
            typeof tag !== 'string' && tag != null ? tag : undefined;

        super();

        if (tagElement != null) {
            const ref = this.markElementWithSymbol(tagElement);

            if (ref?.[isLoaded] === false) {
                ref.config = cfg;

                return ref as this;
            }
            this._config = cfg;
            this._element = tagElement;

            return this;
        } else if (tagName != null) {
            this._config = cfg;
            this._element = document.createElement(tagName);
            this.markElementWithSymbol(this._element);

            return this;
        }

        throw new Error('The tag name or element must be provided.');
    }

    /**
     * Marks or checks the given element with the Flow symbol.
     * @param el The element to mark/check.
     * @returns The Flow instance if the element is marked, `Marked` otherwise.
     */
    private markElementWithSymbol(
        el: HTMLElementTagNameMap[Tag] & IFlowTag,
    ): IFlow<keyof HTMLElementTagNameMap> | undefined {
        const ref = el[IFlowSymbol]?.deref();

        if (isIFlowTagged(el) && ref != undefined) {
            return ref;
        } else {
            el[IFlowSymbol] = new WeakRef(this);

            return undefined;
        }
    }

    /**
     * @inheritdoc
     */
    public override onload(): void {
        try {
            this._config(this as unknown as IFlowApiType<Tag>);
        } catch (error) {
            this._logger?.error(
                'An error occurred while building the element.',
                error,
            );
        }
    }

    /**
     * @inheritdoc
     */
    public build(): HTMLElementTagNameMap[Tag] {
        this.load();

        return this._element;
    }

    /**
     * @inheritdoc
     */
    if(
        condition: boolean | (() => boolean),
        cfg: IFlowConfig<keyof HTMLElementTagNameMap>,
    ): IFlowApi<keyof HTMLElementTagNameMap> {
        if (
            condition === true ||
            (typeof condition === 'function' && condition())
        ) {
            cfg(this as unknown as IFlowApiType<Tag>);
        }

        return this;
    }

    //#region General Flow API

    /**
     * @inheritdoc
     */
    getEl(callback: IFlowElCallback<Tag> | undefined): IFlowApi<Tag> {
        try {
            callback?.(this._element);
        } catch (error) {
            this._logger?.error(
                'An error occurred while getting the element.',
                error,
            );
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public setId(id: string | undefined): IFlowApi<Tag> {
        if (id != null && typeof id === 'string') {
            this._element.id = id;
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    setInnerHTML(html: string | undefined): IFlowApi<Tag> {
        if (html != null && typeof html === 'string') {
            this._element.innerHTML = html;
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public setTextContent(text: string | undefined): IFlowApi<Tag> {
        if (text != null && typeof text === 'string') {
            this._element.textContent = text;
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    then(cb: IFlowThenCallback<Tag> | undefined): IFlowApi<Tag> {
        cb?.(this, this._element);

        return this;
    }

    //#region Classes & Styles

    /**
     * @inheritdoc
     */
    public setClass(className: string | undefined): IFlowApi<Tag> {
        if (className != null && typeof className === 'string') {
            this._element.className = className;
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public addClass(className: string | string[] | undefined): IFlowApi<Tag> {
        if (Array.isArray(className)) {
            this._element.classList.add(...className);
        } else if (className != null && typeof className === 'string') {
            this._element.classList.add(className);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public removeClass(
        className: string | string[] | undefined,
    ): IFlowApi<Tag> {
        if (Array.isArray(className)) {
            this._element.classList.remove(...className);
        } else if (className != null && typeof className === 'string') {
            this._element.classList.remove(className);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    toggleClass(className: string | string[] | undefined): IFlowApi<Tag> {
        if (Array.isArray(className)) {
            for (const name of className) {
                this._element.classList.toggle(name);
            }
        } else if (className != null && typeof className === 'string') {
            this._element.classList.toggle(className);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    setStyles(styles: Partial<CSSStyleDeclaration> | undefined): IFlowApi<Tag> {
        if (styles != null) {
            Object.assign(this._element.style, styles);
        }

        return this;
    }

    //#endregion

    //#region Attributes

    /**
     * @inheritdoc
     */
    public setAttribute(
        name?: unknown | undefined,
        value?: unknown | undefined,
    ): IFlowApi<Tag> {
        const _name: string | undefined =
            typeof name === 'string' ? name : undefined;

        const _value: string | undefined =
            typeof value === 'string' ? value : undefined;

        const _attributes: { [name: string]: string } | undefined =
            name != null && typeof name === 'object'
                ? (name as { [name: string]: string })
                : undefined;

        if (_name != null && _value != null) {
            // Single attribute case
            this._element.setAttribute(_name, _value);
        } else if (_attributes != null) {
            // Multiple attributes case
            for (const [name, val] of Object.entries(_attributes)) {
                this._element.setAttribute(name, val);
            }
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    public removeAttribute(name: string | undefined): IFlowApi<Tag> {
        if (name != null && typeof name === 'string') {
            this._element.removeAttribute(name);
        }

        return this;
    }

    //#endregion

    //#region Parents & Children

    /**
     * @inheritdoc
     */
    appendChildEl(tagName: unknown, cfg?: unknown): IFlowApi<Tag> {
        const child = tagName instanceof HTMLElement ? tagName : undefined;

        if (child != null) {
            this._element.appendChild(child);
        } else if (tagName !== 'void' && isConfigFunction(cfg)) {
            const element = new Flow(
                tagName as keyof HTMLElementTagNameMap,
                Flow.injectedCfg(
                    cfg,
                    (api): void => void api.appendToEl(this._element),
                ),
            );

            this.addChild(element);
            // Remove the child element when it is unloaded
            // to avoid reloading it when the parent is (re)loaded.
            element.register(() => this.removeChild(element));
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    appendToEl(parent: HTMLElement | undefined): IFlowApi<Tag> {
        if (parent != null) {
            parent?.appendChild(this._element);
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    removeChildEl(find: unknown): IFlowApi<Tag> {
        const child = find instanceof HTMLElement ? find : undefined;

        if (child != null) {
            this._element.removeChild(child);
        } else if (isFindFunction(find)) {
            try {
                const childElement = find(this as IFlow<Tag>);

                if (childElement == null) return this;

                this._element.removeChild(childElement);

                if (isIFlowTagged(childElement)) {
                    // Unload the child element to avoid memory leaks.
                    childElement[IFlowSymbol].deref()?.unload?.();
                }
            } catch (error) {
                this._logger?.error(
                    'An error occurred while removing the child element.',
                    error,
                );
            }
        }

        return this;
    }

    //#endregion

    //# Event Listeners

    /**
     * @inheritdoc
     */
    addEventListener<EventKey extends keyof HTMLElementEventMap | 'void'>(
        type: EventKey,
        callback: IFlowEventCallback<Tag, EventKey>,
        options?: boolean | AddEventListenerOptions,
    ): IFlowApi<Tag> {
        if (type !== 'void') {
            const arrowCallback = (
                ev: EventKey extends keyof HTMLElementEventMap
                    ? HTMLElementEventMap[EventKey]
                    : never,
            ): unknown => {
                try {
                    const flow = new Flow<Tag>(this._element, () => {});
                    const returnValue = callback(this.element, ev, flow);
                    this.addChild(flow);

                    return returnValue;
                } catch (error) {
                    this._logger?.error(
                        'An error occurred while executing the event listener.',
                        error,
                    );
                }
            };
            this.registerDomEvent(this._element, type, arrowCallback, options);
        }

        return this;
    }

    //#endregion
}
