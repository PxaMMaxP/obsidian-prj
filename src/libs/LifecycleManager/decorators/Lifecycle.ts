import {
    ILifecycleManager_,
    ILifecycleObject,
    ILifecycleState,
    ILifecycleTime,
} from '../interfaces/ILifecycleManager';
import { LifecycleManager } from '../LifecycleManager';

const manager: ILifecycleManager_ = LifecycleManager;

/**
 * Copies static properties from the source to the target.
 * @param target The target to copy the properties to.
 * @param source The source to copy the properties from.
 */
export function copyStaticProperties(target: unknown, source: unknown): void {
    let currentSource = source;

    while (currentSource && currentSource !== Function.prototype) {
        Object.getOwnPropertyNames(currentSource)
            .concat(Object.getOwnPropertySymbols(currentSource).toString())
            .forEach((prop) => {
                if (prop !== 'prototype') {
                    const descriptor = Object.getOwnPropertyDescriptor(
                        currentSource,
                        prop,
                    );

                    if (descriptor && descriptor.configurable) {
                        Object.defineProperty(target, prop, descriptor);
                    }
                }
            });
        currentSource = Object.getPrototypeOf(currentSource);
    }
}

/**
 * Registers lifecycle methods based on time and state.
 * @param instance The instance whose methods are registered.
 * @param time The lifecycle time.
 * @param state The lifecycle state.
 * @param method The lifecycle method.
 */
function registerLifecycleMethod(
    instance: ILifecycleObject,
    time: ILifecycleTime,
    state: ILifecycleState,
    method: keyof ILifecycleObject,
): void {
    if (instance[method]) {
        manager.register(time, state, instance[method]?.bind(instance));
    }
}

/**
 * Lifecycle decorator.
 * @param constructor The constructor to decorate with lifecycle methods.
 * @param args The arguments for the constructor.
 * @returns The decorated constructor with lifecycle management.
 */
export function Lifecycle<
    T extends { new (...args: unknown[]): ILifecycleObject } & ILifecycleObject,
>(constructor: T, ...args: unknown[]): T {
    const original = constructor;

    /**
     * Constructs a new instance and registers lifecycle methods.
     * @param constructor The constructor to decorate with lifecycle methods.
     * @param args The arguments for the constructor.
     * @returns The instance with registered lifecycle methods.
     */
    function construct(constructor: T, args: unknown[]): ILifecycleObject {
        const instance = new constructor(...args);

        registerLifecycleMethod(instance, 'before', 'init', 'beforeInit');
        registerLifecycleMethod(instance, 'on', 'init', 'onInit');
        registerLifecycleMethod(instance, 'after', 'init', 'afterInit');

        registerLifecycleMethod(instance, 'before', 'load', 'beforeLoad');
        registerLifecycleMethod(instance, 'on', 'load', 'onLoad');
        registerLifecycleMethod(instance, 'after', 'load', 'afterLoad');

        registerLifecycleMethod(instance, 'before', 'unload', 'beforeUnload');
        registerLifecycleMethod(instance, 'on', 'unload', 'onUnload');
        registerLifecycleMethod(instance, 'after', 'unload', 'afterUnload');

        return instance;
    }

    /**
     * Registers static lifecycle methods.
     */
    registerLifecycleMethod(original, 'before', 'init', 'beforeInit');
    registerLifecycleMethod(original, 'on', 'init', 'onInit');
    registerLifecycleMethod(original, 'after', 'init', 'afterInit');

    registerLifecycleMethod(original, 'before', 'load', 'beforeLoad');
    registerLifecycleMethod(original, 'on', 'load', 'onLoad');
    registerLifecycleMethod(original, 'after', 'load', 'afterLoad');

    registerLifecycleMethod(original, 'before', 'unload', 'beforeUnload');
    registerLifecycleMethod(original, 'on', 'unload', 'onUnload');
    registerLifecycleMethod(original, 'after', 'unload', 'afterUnload');

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

    // Copy static methods and properties
    copyStaticProperties(wrappedConstructor, original);

    return wrappedConstructor as T;
}
