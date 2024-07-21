/* istanbul ignore file */

/**
 * Static interface for the LifecycleManager class.
 */
export interface ILifecycleManager_ {
    register(
        time: ILifecycleTime,
        state: ILifecycleState,
        callback: ILifecycleCallback,
    ): Promise<void>;
}

/**
 * Interface for the LifecycleManager class.
 */
export interface ILifecycleManager {
    onInit(): Promise<void>;
    onLoad(): Promise<void>;
    onUnload(): Promise<void>;
}

export type ILifecycleCallback = () => void | Promise<void> | unknown;

export type ILifecycleState = 'init' | 'load' | 'unload';

export const LifecycleState: ILifecycleState[] = ['init', 'load', 'unload'];

export type ILifecycleTime = 'before' | 'on' | 'after';

export const LifecycleTime: ILifecycleTime[] = ['before', 'on', 'after'];
