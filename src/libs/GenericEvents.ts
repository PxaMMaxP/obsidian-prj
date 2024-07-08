import { ILogger } from 'src/interfaces/ILogger';

/**
 * Interface for the callback.
 */
export interface ICallback {
    events: {
        [key: string]: IEvent<unknown, unknown>;
    };
}

/**
 * Interface for the events.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IEvent<TData, TReturn = void> {
    name: string;
    data: TData;
}

/**
 * Interface for the events.
 */
type RegisteredEvent<T extends ICallback, K extends keyof T['events']> = {
    eventName: K;
    callback: (
        data: T['events'][K]['data'],
    ) => T['events'][K] extends IEvent<unknown, infer TReturn>
        ? TReturn
        : unknown;
};

/**
 * Events class; encapsulates event registration and firing
 * @example
 * ```typescript
 * // Define a concrete interface for your specific events
 * interface MyEvents extends ICallback {
 *     events: {
 *         'myEvent1': IEvent<string, number>; // Event with a string as input and a number as output
 *         'myEvent2': IEvent<number, void>;   // Event with a number as input and no output
 *         // Add more events here
 *     };
 * }
 * 
 * // Use the Events class with your concrete interface
 * const eventsInstance = new GenericEvents<MyEvents>();
 * 
 * // Register event one with a string as input and a number as output
 * eventsInstance.registerEvent('myEvent1', (data) => {
 *     console.log(data);
 *     return 100;
 * });

 * // Fire event one with a string as input and a number as output
 * eventsInstance.fireEvent('myEvent1', 'Fire event 1', (result) => {
 *     console.log(result); // Result is a number
 * });
 * ```
 */
export default class GenericEvents<T extends ICallback> {
    private _logger: ILogger | undefined;
    private _events: Array<RegisteredEvent<T, keyof T['events']>> = [];

    /**
     * Creates a new Events instance
     * @param logger The logger to use. You can use your own logger or `console` as logger.
     */
    constructor(logger?: ILogger) {
        this._logger = logger;
    }

    /**
     * Registers an event with a callback.
     * @param eventName The name of the event to register.
     * @param callback The callback to execute when the event is fired.
     */
    public registerEvent<K extends keyof T['events']>(
        eventName: K,
        callback: (
            data: T['events'][K]['data'],
        ) => T['events'][K] extends IEvent<unknown, infer TReturn>
            ? TReturn
            : unknown,
    ): void {
        // Add the event to the _events array
        this._events.push({ eventName, callback });
        this._logger?.debug(`Event ${eventName.toString()} registered`);
    }

    /**
     * Deregisters an event with a callback.
     * @param eventName The name of the event to deregister.
     * @param callback The callback to deregister.
     */
    public deregisterEvent<K extends keyof T['events']>(
        eventName: K,
        callback: (
            data: T['events'][K]['data'],
        ) => T['events'][K] extends IEvent<unknown, infer TReturn>
            ? TReturn
            : unknown,
    ): void {
        // Delete the event from the _events array
        const initialLength = this._events.length;

        this._events = this._events.filter(
            (event) =>
                event.eventName !== eventName || event.callback !== callback,
        );
        const finalLength = this._events.length;

        if (finalLength === initialLength) {
            // No event was removed, log a warning
            this._logger?.warn(
                `Event ${eventName.toString()} could not be deregistered`,
            );
        } else {
            // Event was removed, log a debug message
            this._logger?.debug(`Event ${eventName.toString()} deregistered`);
        }
    }

    /**
     * Fires an event with a callback.
     * @param eventName The name of the event to fire.
     * @param eventData The data to pass to the event handler.
     * @param callback The callback to execute when the event is fired.
     */
    public fireEvent<K extends keyof T['events']>(
        eventName: K,
        eventData: T['events'][K]['data'],
        callback?: (
            result: T['events'][K] extends IEvent<unknown, infer TReturn>
                ? TReturn
                : unknown,
        ) => void,
    ): void {
        // Find the event in the _events array and execute the callback
        this._events
            .filter((event) => event.eventName === eventName)
            .forEach((event) => {
                this._executeEventHandler(event.callback, eventData, callback);
                this._logger?.debug(`Event ${eventName.toString()} fired`);
            });
    }

    /**
     * Executes an event handler and calls the callback with the result.
     * @param handler The event handler to execute.
     * @param eventData The data to pass to the event handler.
     * @param callback The callback to execute when the event handler is executed.
     */
    private async _executeEventHandler<K extends keyof T['events']>(
        handler: (
            data: T['events'][K]['data'],
        ) => T['events'][K] extends IEvent<unknown, infer TReturn>
            ? TReturn
            : unknown,
        eventData: T['events'][K]['data'],
        callback?: (
            result: T['events'][K] extends IEvent<unknown, infer TReturn>
                ? TReturn
                : unknown,
        ) => void,
    ): Promise<void> {
        try {
            // Execute the handler and call the callback with the result
            const result = await handler(eventData);

            this._logger?.debug(
                `Event handler for ${handler.toString()} executed`,
            );

            if (callback) {
                callback(result);

                this._logger?.debug(
                    `Callback for ${handler.toString()} executed`,
                );
            }
        } catch (error) {
            this._logger?.error(
                `Error in event handler for ${handler.toString()}: ${error}`,
            );
        }
    }
}
