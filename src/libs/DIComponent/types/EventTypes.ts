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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'common-window-classes': [string[]];
    inject: [InjectDelegate];
};

export type SpecificEventCallback<K extends keyof SpecificEventMap> = (
    ...args: SpecificEventMap[K]
) => void;
