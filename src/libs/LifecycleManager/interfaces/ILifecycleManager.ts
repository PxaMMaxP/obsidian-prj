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
    /**
     * Will be called before the initialization state.
     * Priority: **StartUp** (0)
     * @remarks Use this stage for all setup tasks
     * - that are base requirements for the application to run.
     * - or that are not dependent on other services or modules.
     */
    beforeInit?(): void | Promise<void>;
    /**
     * Will be called during the initialization state.
     * Priority: **StartUp** (1)
     */
    onInit?(): void | Promise<void>;
    /**
     * Will be called after the initialization state.
     * Priority: **StartUp** (2)
     */
    afterInit?(): void | Promise<void>;
    /**
     * Will be called before the loading state.
     * Priority: **StartUp** (3)
     */
    beforeLoad?(): void | Promise<void>;
    /**
     * Will be called during the loading state.
     * Priority: **StartUp** (4)
     */
    onLoad?(): void | Promise<void>;
    /**
     * Will be called after the loading state.
     * Priority: **StartUp** (5)
     */
    afterLoad?(): void | Promise<void>;
    /**
     * Will be called before the unloading state.
     * Priority: **Shutdown** (0)
     */
    beforeUnload?(): void | Promise<void>;
    /**
     * Will be called during the unloading state.
     * Priority: **Shutdown** (1)
     */
    onUnload?(): void | Promise<void>;
    /**
     * Will be called after the unloading state.
     * Priority: **Shutdown** (2)
     */
    afterUnload?(): void | Promise<void>;
}

export type ILifecycleCallback = () => void | Promise<void> | unknown;

export type ILifecycleState = 'init' | 'load' | 'unload';

export const LifecycleState: ILifecycleState[] = ['init', 'load', 'unload'];

export type ILifecycleTime = 'before' | 'on' | 'after';

export const LifecycleTime: ILifecycleTime[] = ['before', 'on', 'after'];
