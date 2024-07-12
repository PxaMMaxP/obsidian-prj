/* eslint-disable jsdoc/require-param-description */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-description */
import {
    ILifecycleManager_,
    ILifecycleObject,
} from '../interfaces/ILifecycleManager';
import { LifecycleManager } from '../LifecycleManager';

const manager: ILifecycleManager_ = LifecycleManager;

/**
 * Lifecycle decorator.
 * @param constructor The constructor to decorate with lifecycle methods.
 * @param args
 * @returns The decorated constructor with lifecycle management.
 */
export function Lifecycle<
    T extends { new (...args: unknown[]): ILifecycleObject } & ILifecycleObject,
>(constructor: T, ...args: unknown[]): T {
    const original = constructor;

    /**
     * Constructs a new instance and registers lifecycle methods.
     * @param constructor
     * @param args The arguments for the constructor.
     * @returns The instance with registered lifecycle methods.
     */
    function construct(constructor: T, args: unknown[]): ILifecycleObject {
        const instance = new constructor(...args);

        if (instance.onInit) {
            manager.registerOnInit(instance.onInit.bind(instance));
        }

        if (instance.onLoad) {
            manager.registerOnLoad(instance.onLoad.bind(instance));
        }

        if (instance.onUnload) {
            manager.registerOnUnload(instance.onUnload.bind(instance));
        }

        return instance;
    }

    /**
     * Registers static lifecycle methods.
     */
    if (original.onInit) {
        manager.registerOnInit(original.onInit.bind(original));
    }

    if (original.onLoad) {
        manager.registerOnLoad(original.onLoad.bind(original));
    }

    if (original.onUnload) {
        manager.registerOnUnload(original.onUnload.bind(original));
    }

    /**
     * The wrapped constructor function.
     * @param args The arguments for the constructor.
     * @returns The instance with registered lifecycle methods.
     */
    const wrappedConstructor: T = function (...args: unknown[]) {
        return construct(original, args) as T;
    } as unknown as T;

    // Transfer prototype
    wrappedConstructor.prototype = original.prototype;

    // Transfer static methods and properties
    Object.getOwnPropertyNames(constructor).forEach((prop) => {
        if (prop !== 'prototype') {
            (wrappedConstructor as any)[prop] = (constructor as any)[prop];
        }
    });

    return wrappedConstructor as T;
}
