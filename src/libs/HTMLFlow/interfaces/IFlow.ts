import { DIComponent } from 'src/libs/Modals/CustomModal/DIComponent';
import { shouldRemoveOnUnload } from 'src/libs/Modals/CustomModal/interfaces/IDIComponent';
import { IFlowSymbol } from './IFlowTag';
import {
    IFlowConfig,
    IFlowElCallback,
    IFlowEventCallback,
    IFlowFindFunction,
    IFlowThenCallback,
} from '../types/IFlowDelegates';

export type IFlowApiType<
    Tag extends
        | keyof HTMLElementTagNameMap
        | 'void' = keyof HTMLElementTagNameMap,
> = Tag extends keyof HTMLElementTagNameMap ? IFlowApi<Tag> : never;

export interface IFlowConditionalApi {
    /**
     * Runs the configuration if the condition is true.
     * @param condition A condition to check.
     * @param cfg The configuration to apply if the condition is true.
     * @returns The current instance of the fluent HTML API.
     */
    if(
        condition: boolean | (() => boolean),
        cfg: IFlowConfig<keyof HTMLElementTagNameMap>,
    ): IFlowApi<keyof HTMLElementTagNameMap>;
}

/**
 * Fluent API of the Flow class.
 */
export interface IFlowApi<
    Tag extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> extends IFlowConditionalApi {
    //#region General

    /**
     * Gets the element of the Flow instance.
     * @param callback The callback to execute with the element.
     * @returns The current instance of the fluent HTML API.
     * @remarks You can use this method to get the element and
     * attach it to properties or variables.
     */
    getEl(callback: IFlowElCallback<Tag> | undefined): IFlowApi<Tag>;

    /**
     * Sets the ID of the element.
     * @param id The ID to set.
     * @returns The current instance of the fluent HTML API.
     */
    setId(id: string | undefined): IFlowApi<Tag>;

    /**
     * Sets the inner HTML content of the element.
     * @param html The HTML content to set.
     * @returns The current instance of the fluent HTML API.
     */
    setInnerHTML(html: string | undefined): IFlowApi<Tag>;

    /**
     * Sets the text content of the element.
     * @param text The text content to set.
     * @returns The current instance of the fluent HTML API.
     */
    setTextContent(text: string | undefined): IFlowApi<Tag>;

    /**
     * Custom methode for changing the element.
     * @param callback
     */
    then(callback: IFlowThenCallback<Tag> | undefined): IFlowApi<Tag>;

    //#endregion

    //#region Classes & Styles

    /**
     * Sets and replaces the class of the element.
     * @param className The class to set.
     * @returns The current instance of the fluent HTML API.
     */
    setClass(className: string | undefined): IFlowApi<Tag>;

    /**
     * Adds a class to the element.
     * @param className The class to add.
     * @returns The current instance of the fluent HTML API.
     */
    addClass(className: string | undefined): IFlowApi<Tag>;

    /**
     * Adds classes to the element.
     * @param classNames The classes to add.
     * @returns The current instance of the fluent HTML API.
     */
    addClass(classNames: string[] | undefined): IFlowApi<Tag>;

    /**
     * Removes a class from the element.
     * @param className The class to remove.
     * @returns The current instance of the fluent HTML API.
     */
    removeClass(className: string | undefined): IFlowApi<Tag>;

    /**
     * Removes the classes from the element.
     * @param classNames The classes to remove.
     * @returns The current instance of the fluent HTML API.
     */
    removeClass(classNames: string[] | undefined): IFlowApi<Tag>;

    /**
     * **Toggles a class of the element:**
     * - If the class is present, it removes it.
     * - If the class is not present, it adds it.
     * @param className The class to toggle.
     * @returns The current instance of the fluent HTML API.
     */
    toggleClass(className: string | undefined): IFlowApi<Tag>;

    /**
     * **Toggles classes of the element:**
     * - If the class is present, it removes it.
     * - If the class is not present, it adds it.
     * @param className The classes to toggle.
     * @returns The current instance of the fluent HTML API.
     */
    toggleClass(className: string[] | undefined): IFlowApi<Tag>;

    /**
     * Sets CSS styles for the element.
     * @param styles An object containing CSS property-value pairs.
     * @returns The current instance of the fluent HTML API.
     */
    setStyles(styles: Partial<CSSStyleDeclaration> | undefined): IFlowApi<Tag>;

    //#endregion

    //#region Attributes

    /**
     * Sets an attribute of the element.
     * @param name The name of the attribute.
     * @param value The value of the attribute.
     * @returns The current instance of the fluent HTML API.
     */
    setAttribute(
        name: string | undefined,
        value: string | undefined,
    ): IFlowApi<Tag>;

    /**
     * Sets multiple attributes for the element.
     * @param attributes An object containing attribute-value pairs.
     * @returns The current instance of the fluent HTML API.
     */
    setAttribute(
        attributes: { [name: string]: string } | undefined,
    ): IFlowApi<Tag>;

    /**
     * Removes an attribute from the element.
     * @param name The name of the attribute to remove.
     * @returns The current instance of the fluent HTML API.
     */
    removeAttribute(name: string | undefined): IFlowApi<Tag>;

    //#endregion

    //#region Parents & Children

    /**
     * Appends a child element to the current element.
     * @param child The child element to append.
     * @returns The current instance of the fluent HTML API
     */
    appendChildEl(child: HTMLElement | undefined): IFlowApi<Tag>;

    /**
     * Appends a new child element to the current element.
     * @param tagName The tag name of the element to append.
     * @param cfg The configuration to apply to the appended element.
     * @returns The current instance of the fluent HTML API
     */
    appendChildEl<Key extends keyof HTMLElementTagNameMap | 'void'>(
        tagName: Key,
        cfg: IFlowConfig<Key>,
    ): IFlowApi<Tag>;

    /**
     * Appends the element to the given parent.
     * @param parent The parent to append the element to.
     */
    appendToEl(parent: HTMLElement | undefined): IFlowApi<Tag>;

    /**
     * Removes a child element from the current element.
     * @param child The child element to remove.
     * @returns The current instance of the fluent HTML API.
     */
    removeChildEl(child: HTMLElement | undefined): IFlowApi<Tag>;

    /**
     * Removes a child element from the current element.
     * @param find The function to find the child element to remove.
     * @returns The current instance of the fluent HTML API.
     */
    removeChildEl(find: IFlowFindFunction<Tag> | undefined): IFlowApi<Tag>;

    //#endregion

    //# Event Listeners

    /**
     * Adds an event listener to the element.
     * @param type The type of the event or 'void' to dismiss the event registration.
     * @param callback The callback to execute when the event is triggered.
     * @param options The options to apply to the event listener.
     */
    addEventListener<EventKey extends keyof HTMLElementEventMap | 'void'>(
        type: EventKey,
        callback: IFlowEventCallback<Tag, EventKey>,
        options?: boolean | AddEventListenerOptions,
    ): IFlowApi<Tag>;

    //#endregion
}

/**
 * Building API of the Flow class.
 */
export interface IFlowBuildApi<
    Tag extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> {
    /**
     * Builds the element.
     */
    build(): HTMLElementTagNameMap[Tag];
}

/**
 * Main interface of the Flow class.
 */
export interface IFlow<
    Tag extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> extends DIComponent,
        IFlowApi<Tag>,
        IFlowBuildApi<Tag>,
        IFlowConditionalApi {
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
export interface IFlow_<
    Tag extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> {
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
