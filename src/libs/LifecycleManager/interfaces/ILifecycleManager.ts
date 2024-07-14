/* istanbul ignore file */

import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';

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

/**
 * Interface for a lifecycle object.
 * Can be regular or static.
 * @see {@link ImplementsStatic|ImplementsStatic for interface checking}.
 */
export interface ILifecycleObject {
    beforeInit?(): void | Promise<void>;
    onInit?(): void | Promise<void>;
    afterInit?(): void | Promise<void>;
    beforeLoad?(): void | Promise<void>;
    onLoad?(): void | Promise<void>;
    afterLoad?(): void | Promise<void>;
    beforeUnload?(): void | Promise<void>;
    onUnload?(): void | Promise<void>;
    afterUnload?(): void | Promise<void>;
}

export type ILifecycleCallback = () => void | Promise<void> | unknown;

export type ILifecycleState = 'init' | 'load' | 'unload';

export const LifecycleState: ILifecycleState[] = ['init', 'load', 'unload'];

export type ILifecycleTime = 'before' | 'on' | 'after';

export const LifecycleTime: ILifecycleTime[] = ['before', 'on', 'after'];
