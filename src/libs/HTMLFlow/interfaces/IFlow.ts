import { DIComponent } from 'src/libs/Modals/CustomModal/DIComponent';
import { shouldRemoveOnUnload } from 'src/libs/Modals/CustomModal/interfaces/IDIComponent';
import { IFlowSymbol } from './IFlowTag';
import { IFlowConfig } from '../types/IFlowDelegates';

/**
 * Fluent API of the Flow class.
 */
export interface IFlowApi<Tag extends keyof HTMLElementTagNameMap> {
    //#region General

    /**
     * Sets the ID of the element.
     * @param id The ID to set.
     * @returns The current instance of the fluent HTML API.
     */
    setId(id: string): IFlowApi<Tag>;

    /**
     * Sets the inner HTML content of the element.
     * @param html The HTML content to set.
     * @returns The current instance of the fluent HTML API.
     */
    setInnerHTML(html: string): IFlowApi<Tag>;

    /**
     * Sets the text content of the element.
     * @param text The text content to set.
     * @returns The current instance of the fluent HTML API.
     */
    setTextContent(text: string): IFlowApi<Tag>;

    /**
     * Custom methode for changing the element.
     * @param callback
     */
    then(
        callback: (
            ctx: IFlow<Tag>,
            element: HTMLElementTagNameMap[Tag],
        ) => unknown,
    ): IFlowApi<Tag>;

    //#endregion

    //#region Classes & Styles

    /**
     * Sets and replaces the class of the element.
     * @param className The class to set.
     * @returns The current instance of the fluent HTML API.
     */
    setClass(className: string): IFlowApi<Tag>;

    /**
     * Adds a class to the element.
     * @param className The class to add.
     * @returns The current instance of the fluent HTML API.
     */
    addClass(className: string): IFlowApi<Tag>;

    /**
     * Adds classes to the element.
     * @param classNames The classes to add.
     * @returns The current instance of the fluent HTML API.
     */
    addClass(classNames: string[]): IFlowApi<Tag>;

    /**
     * Removes a class from the element.
     * @param className The class to remove.
     * @returns The current instance of the fluent HTML API.
     */
    removeClass(className: string): IFlowApi<Tag>;

    /**
     * Removes the classes from the element.
     * @param classNames The classes to remove.
     * @returns The current instance of the fluent HTML API.
     */
    removeClass(classNames: string[]): IFlowApi<Tag>;

    /**
     * Sets CSS styles for the element.
     * @param styles An object containing CSS property-value pairs.
     * @returns The current instance of the fluent HTML API.
     */
    setStyles(styles: Partial<CSSStyleDeclaration>): IFlowApi<Tag>;

    //#endregion

    //#region Attributes

    /**
     * Sets an attribute of the element.
     * @param name The name of the attribute.
     * @param value The value of the attribute.
     * @returns The current instance of the fluent HTML API.
     */
    setAttribute(name: string, value: string): IFlowApi<Tag>;

    /**
     * Sets multiple attributes for the element.
     * @param attributes An object containing attribute-value pairs.
     * @returns The current instance of the fluent HTML API.
     */
    setAttribute(attributes: { [name: string]: string }): IFlowApi<Tag>;

    /**
     * Removes an attribute from the element.
     * @param name The name of the attribute to remove.
     * @returns The current instance of the fluent HTML API.
     */
    removeAttribute(name: string): IFlowApi<Tag>;

    //#endregion

    //#region Parents & Children

    /**
     * Appends a child element to the current element.
     * @param child The child element to append.
     * @returns The current instance of the fluent HTML API
     */
    appendChildEl(child: HTMLElement): IFlowApi<Tag>;

    /**
     * Appends a new child element to the current element.
     * @param tagName The tag name of the element to append.
     * @param cfg The configuration to apply to the appended element.
     * @returns The current instance of the fluent HTML API
     */
    appendChildEl<Key extends keyof HTMLElementTagNameMap>(
        tagName: Key,
        cfg: IFlowConfig<Key>,
    ): IFlowApi<Tag>;

    /**
     * Appends the element to the given parent.
     * @param parent The parent to append the element to.
     */
    appendToEl(parent: HTMLElement): IFlowApi<Tag>;

    /**
     * Removes a child element from the current element.
     * @param child The child element to remove.
     * @returns The current instance of the fluent HTML API.
     */
    removeChildEl(child: HTMLElement): IFlowApi<Tag>;

    /**
     * Removes a child element from the current element.
     * @param find The function to find the child element to remove.
     * @returns The current instance of the fluent HTML API.
     */
    removeChildEl(find: (ctx: IFlow<Tag>) => HTMLElement): IFlowApi<Tag>;

    //#endregion

    //# Event Listeners

    /**
     * Adds an event listener to the element.
     * @param type The type of the event.
     * @param callback The callback to execute when the event is triggered.
     * @param options The options to apply to the event listener.
     */
    addEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
        options?: boolean | AddEventListenerOptions,
    ): IFlowApi<Tag>;

    //#endregion
}

/**
 * Building API of the Flow class.
 */
export interface IFlowBuildApi<Tag extends keyof HTMLElementTagNameMap> {
    /**
     * Builds the element.
     */
    build(): HTMLElementTagNameMap[Tag];
}

/**
 * Main interface of the Flow class.
 */
export interface IFlow<Tag extends keyof HTMLElementTagNameMap>
    extends DIComponent,
        IFlowApi<Tag>,
        IFlowBuildApi<Tag> {
    /**
     * Enables the removal of the element
     * and its children when the element is unloaded.
     */
    [shouldRemoveOnUnload]: boolean;

    /**
     * Marks the instance as a {@link IFlow} instance.
     */
    get [IFlowSymbol](): true;

    /**
     * The element of the Flow instance.
     */
    get element(): HTMLElementTagNameMap[Tag];

    /**
     * The configuration of the Flow instance.
     */
    get config(): IFlowConfig<Tag>;

    /**
     * Sets the configuration of the Flow instance.
     * Enhances the existing configuration with the new one.
     */
    set config(value: IFlowConfig<Tag>);
}

/**
 * Checks if the given instance is a {@link IFlow} instance.
 * @param instance The instance to check.
 * @returns Whether the instance is a IFlow instance.
 */
export function isIFlow(
    instance: Partial<IFlow<keyof HTMLElementTagNameMap>>,
): instance is IFlow<keyof HTMLElementTagNameMap> {
    return instance[IFlowSymbol] === true;
}

/**
 * Static interface of the Flow class.
 */
export interface IFlow_<Tag extends keyof HTMLElementTagNameMap> {
    /**
     * Creates a new Flow instance.
     * @param tag The tag name of the element to create or
     * the element to use as the Flow instance.
     * @param cfg The configuration to apply to the element.
     */
    new (
        tag: Tag | HTMLElementTagNameMap[Tag],
        cfg: IFlowConfig<Tag>,
    ): IFlowBuildApi<Tag>;
}
