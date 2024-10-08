import { IFlow, IFlowApi } from '../interfaces/IFlow';

/**
 * Configuration function for the Flow Api.
 */

export type IFlowConfig<Tag extends keyof HTMLElementTagNameMap | 'void'> = (
    cfg: Tag extends keyof HTMLElementTagNameMap ? IFlowApi<Tag> : never,
) => void;

/**
 * Checks if the given configuration is a valid fluent HTML API configuration.
 * @param cfg The configuration to check.
 * @returns True if the configuration is a valid fluent HTML API configuration, false otherwise.
 * @remarks It will be only true if the configuration is a function.
 */
export function isConfigFunction(
    cfg: unknown,
): cfg is IFlowConfig<keyof HTMLElementTagNameMap> {
    return typeof cfg === 'function';
}
/**
 * Find function for the Flow Api.
 */
export type IFlowFindFunction<Tag extends keyof HTMLElementTagNameMap> = (
    ctx: IFlow<Tag>,
) => HTMLElement | undefined;

/**
 * Checks if the given find function is a valid find function for the Flow Api.
 * @param find The find function to check.
 * @returns True if the find function is a valid find function for the Flow Api, false otherwise.
 */
export function isFindFunction(
    find: unknown,
): find is IFlowFindFunction<keyof HTMLElementTagNameMap> {
    return find !== null && typeof find === 'function';
}

/**
 * Callback function which get the element.
 * @param el The element.
 */
export type IFlowElCallback<Tag extends keyof HTMLElementTagNameMap> = (
    el: HTMLElementTagNameMap[Tag],
) => unknown;

/**
 * Callback function for an event.
 * @param el The element.
 * @param ev The event.
 */
export type IFlowEventCallback<
    Tag extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
    EventKey extends
        | keyof HTMLElementEventMap
        | 'void' = keyof HTMLElementEventMap,
> = (
    el: HTMLElementTagNameMap[Tag],
    ev: EventKey extends keyof HTMLElementEventMap
        ? HTMLElementEventMap[EventKey]
        : typeof Event,
    flow: IFlowApi<Tag>,
) => unknown;

/**
 * Callback function for a `then` call.
 * @param ctx The flow context.
 * @param element The element.
 */
export type IFlowThenCallback<
    Tag extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> = (ctx: IFlow<Tag>, el: HTMLElementTagNameMap[Tag]) => unknown;
