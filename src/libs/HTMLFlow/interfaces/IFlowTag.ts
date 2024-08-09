import { IFlow } from './IFlow';

export const IFlowSymbol = Symbol('IFlow');

/**
 * A fast way to create an element as a child of the current element.
 * @param tag The tag name of the element to create.
 * @param o The configuration of the element to create.
 * @param callback The callback to apply to the created element.
 */
export type CreateEl = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    o?: DomElementInfo | string,
    callback?: (el: HTMLElementTagNameMap[K]) => void,
) => HTMLElementTagNameMap[K];

/**
 * An Interface to tag elements with the Flow interface.
 */
export interface IFlowTag {
    /**
     * The symbol to tag the element with the Flow interface.
     */
    [IFlowSymbol]?: WeakRef<IFlow<keyof HTMLElementTagNameMap>>;
}

/**
 * Checks if the given element is tagged with the Flow symbol.
 * @param element The element to check.
 * @returns Whether the element is tagged with the Flow symbol.
 */
export function isIFlowTagged(
    element: HTMLElement & IFlowTag,
): element is HTMLElement & Required<IFlowTag> {
    return element[IFlowSymbol] !== undefined;
}
