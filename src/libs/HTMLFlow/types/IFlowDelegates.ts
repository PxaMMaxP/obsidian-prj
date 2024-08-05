import { IFlow, IFlowApi } from '../interfaces/IFlow';

/**
 * Configuration function for the Flow Api.
 */

export type IFlowConfig<Tag extends keyof HTMLElementTagNameMap> = (
    cfg: IFlowApi<Tag>,
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
) => HTMLElement;

/**
 * Checks if the given find function is a valid find function for the Flow Api.
 * @param find The find function to check.
 * @returns True if the find function is a valid find function for the Flow Api, false otherwise.
 */
export function isFindFunction(
    find: unknown,
): find is IFlowFindFunction<keyof HTMLElementTagNameMap> {
    return typeof find === 'function';
}
