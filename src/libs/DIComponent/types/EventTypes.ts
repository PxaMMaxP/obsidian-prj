/* eslint-disable @typescript-eslint/naming-convention */
import { IDIComponent } from '../interfaces/IDIComponent';

/**
 * Event key type
 * Can be a string or:
 * - '*' to listen to all events,
 * - 'reflect' to send the event up the hierarchy
 * to the last parent component which reflects the event
 * as broadcasted event to all child components.
 * - 'inject' to send a delegate to the receiver components.
 * See at {@link InjectDelegate}
 */
export type EventKey = string | '*' | 'reflect' | 'inject';

/**
 * Event callback type
 */
export type EventCallback = (...args: unknown[]) => unknown;

/**
 * Event registry type
 */
export type EventRegistry = Record<EventKey, (EventCallback | undefined)[]>;

/**
 * Delegate to inject into the receiver components.
 */
export type InjectDelegate = (ctx: IDIComponent & unknown) => void;

export type SpecificEventMap = {
    /**
     * All indipendent Windows should have this classes.
     * The parent will emit this event to all children
     * after the parent and children are loaded.
     */
    'common-window-classes': [string[]];
    /**
     * A child can emit this event to the parent with the
     * key of the result and the result itself.
     */
    result: [string, unknown];
};

export type SpecificEventCallback<K extends keyof SpecificEventMap> = (
    ...args: SpecificEventMap[K]
) => void;
