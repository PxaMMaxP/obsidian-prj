import { IFlowEventCallback } from './IFlowDelegates';
import { IFlow } from '../interfaces/IFlow';

/**
 * Check if the given parameter is a valid AddEventsParameters.
 * @param params The parameter to check.
 * @returns True if the parameter is a valid AddEventsParameters, false otherwise.
 */
export function isAddEventsParameters<
    Tag extends keyof HTMLElementTagNameMap,
    EventKey extends keyof HTMLElementEventMap | 'void',
>(params: unknown): params is AddEventsParameters<Tag, EventKey> {
    if (!Array.isArray(params) || params.length < 2 || params.length > 3) {
        return false;
    }

    const [type, callback, options] = params;

    if (typeof type !== 'string') {
        return false;
    }

    if (typeof callback !== 'function') {
        return false;
    }

    if (
        options !== undefined &&
        typeof options !== 'boolean' &&
        typeof options !== 'object'
    ) {
        return false;
    }

    return true;
}

/**
 * Check if the given parameter is a valid array of AddEventsParameters.
 * @param params The parameter to check.
 * @returns True if the parameter is a valid array of AddEventsParameters, false otherwise.
 */
export function isArrayOfAddEventsParameters<
    Tag extends keyof HTMLElementTagNameMap,
    EventKey extends keyof HTMLElementEventMap | 'void',
>(params: unknown): params is AddEventsParameters<Tag, EventKey>[] {
    if (!Array.isArray(params)) {
        return false;
    }

    // Überprüfe, ob jedes Element im Array ein gültiges AddEventsParameters ist
    return params.every(isAddEventsParameters);
}

export type AddEventsParameters<
    Tag extends keyof HTMLElementTagNameMap,
    EventKey extends keyof HTMLElementEventMap | 'void' =
        | keyof HTMLElementEventMap
        | 'void',
> = [
    type: EventKey,
    callback: IFlowEventCallback<Tag, EventKey>,
    options?: boolean | AddEventListenerOptions,
];

export type EventsParameters<
    Tag extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
    EventKey extends keyof HTMLElementEventMap | 'void' =
        | keyof HTMLElementEventMap
        | 'void',
> =
    | AddEventsParameters<Tag, EventKey>[]
    | AddEventsParameters<Tag, EventKey>
    | undefined;

export type StylesParameters<Tag extends keyof HTMLElementTagNameMap> =
    Parameters<IFlow<Tag>['setStyles']>;

export type ClassesParameters<Tag extends keyof HTMLElementTagNameMap> =
    Parameters<IFlow<Tag>['addClass']>;

export type GetElParameters<Tag extends keyof HTMLElementTagNameMap> =
    Parameters<IFlow<Tag>['getEl']>;

export type TupleToUnion<T extends unknown[]> = T[number];
