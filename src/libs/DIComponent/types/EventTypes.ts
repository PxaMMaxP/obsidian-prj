export type EventArgsType = unknown[];
export type EventKey = string | '*';
export type EventCallback<EventArgs extends EventArgsType = EventArgsType> = (
    ...args: EventArgs
) => void;
export type EventRegistry = Record<EventKey, EventCallback[]>;
