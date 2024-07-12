import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';

/**
 * Static interface for the LifecycleManager class.
 */
export interface ILifecycleManager_ {
    registerOnInit(callback: ILifecycleCallback): Promise<void>;
    registerOnLoad(callback: ILifecycleCallback): Promise<void>;
    registerOnUnload(callback: ILifecycleCallback): Promise<void>;
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
    onInit?(): void | Promise<void>;
    onLoad?(): void | Promise<void>;
    onUnload?(): void | Promise<void>;
}

export type ILifecycleCallback = () => void | Promise<void> | unknown;
