/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
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
 * Copies static properties from the source to the target.
 * @param target The target to copy the properties to.
 * @param source The source to copy the properties from.
 */
export function copyStaticProperties(target: Function, source: Function): void {
    let currentSource = source;

    while (currentSource && currentSource !== Function.prototype) {
        Object.getOwnPropertyNames(currentSource)
            .concat(Object.getOwnPropertySymbols(currentSource) as any)
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

    // Copy static methods and properties
    copyStaticProperties(wrappedConstructor, original);

    return wrappedConstructor as T;
}
