/* istanbul ignore file */

/**
 * Static interface for the LifecycleManager class.
 */
export interface ILifecycleManager_ {
    /**
     * Registers a callback to be executed on a specific lifecycle time and state.
     * @param time - The lifecycle time (before, on, after).
     * @param state - The lifecycle state (init, load, unload).
     * @param callback - The callback function to be executed.
     */
    register(
        time: ILifecycleTime,
        state: ILifecycleState,
        callback: ILifecycleCallback,
    ): Promise<void>;

    /**
     * Unregisters a callback to be executed on a specific lifecycle time and state.
     * @param time - The lifecycle time (before, on, after).
     * @param state - The lifecycle state (init, load, unload).
     * @param callback - The callback function to be executed.
     */
    unregister(
        time: ILifecycleTime,
        state: ILifecycleState,
        callback: ILifecycleCallback,
    ): void;
}

/**
 * Interface for the LifecycleManager class.
 */
export interface ILifecycleManager {
    /**
     * Executes the registered callbacks for the initialization state.
     */
    onInit(): Promise<void>;
    /**
     * Executes the registered callbacks for the loading state.
     */
    onLoad(): Promise<void>;
    /**
     * Executes the registered callbacks for the unloading state.
     */
    onUnload(): Promise<void>;
}

export type ILifecycleCallback = () => void | Promise<void> | unknown;

export type ILifecycleState = 'init' | 'load' | 'unload';

export const LifecycleState: ILifecycleState[] = ['init', 'load', 'unload'];

export type ILifecycleTime = 'before' | 'on' | 'after';

export const LifecycleTime: ILifecycleTime[] = ['before', 'on', 'after'];
