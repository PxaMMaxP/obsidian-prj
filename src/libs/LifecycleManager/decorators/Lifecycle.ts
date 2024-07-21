import { copyStaticProperties } from 'src/classes/decorators/Helper';
import {
    ILifecycleManager_,
    ILifecycleState,
    ILifecycleTime,
} from '../interfaces/ILifecycleManager';
import { ILifecycleObject } from '../interfaces/ILifecycleObject';
import { LifecycleManager } from '../LifecycleManager';

const manager: ILifecycleManager_ = LifecycleManager;

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
 * @param type The type of lifecycle to register: 'Static', 'Instance', or 'All'.
 * @returns The decorated constructor with lifecycle management.
 */
export function Lifecycle<
    TargetType extends {
        new (...args: unknown[]): ILifecycleObject;
    } & ILifecycleObject,
>(type?: 'Static' | 'Instance' | 'All'): (constructor: TargetType) => void {
    /**
     * Lifecycle decorator.
     * @param constructor The constructor to decorate with lifecycle methods.
     * @param args The arguments for the constructor.
     * @returns The decorated constructor with lifecycle management.
     */
    return function lifecycle(
        constructor: TargetType,
        ...args: unknown[]
    ): TargetType {
        const original = constructor;

        /**
         * Constructs a new instance and registers lifecycle methods.
         * @param constructor The constructor to decorate with lifecycle methods.
         * @param args The arguments for the constructor.
         * @returns The instance with registered lifecycle methods.
         */
        function construct(
            constructor: TargetType,
            args: unknown[],
        ): ILifecycleObject {
            const instance = new constructor(...args);

            if (type == null || type === 'Instance' || type === 'All') {
                registerLifecycleMethod(
                    instance,
                    'before',
                    'init',
                    'beforeInit',
                );
                registerLifecycleMethod(instance, 'on', 'init', 'onInit');
                registerLifecycleMethod(instance, 'after', 'init', 'afterInit');

                registerLifecycleMethod(
                    instance,
                    'before',
                    'load',
                    'beforeLoad',
                );
                registerLifecycleMethod(instance, 'on', 'load', 'onLoad');
                registerLifecycleMethod(instance, 'after', 'load', 'afterLoad');

                registerLifecycleMethod(
                    instance,
                    'before',
                    'unload',
                    'beforeUnload',
                );
                registerLifecycleMethod(instance, 'on', 'unload', 'onUnload');

                registerLifecycleMethod(
                    instance,
                    'after',
                    'unload',
                    'afterUnload',
                );
            }

            return instance;
        }

        /**
         * Registers static lifecycle methods.
         */
        if (type == null || type === 'Static' || type === 'All') {
            registerLifecycleMethod(original, 'before', 'init', 'beforeInit');
            registerLifecycleMethod(original, 'on', 'init', 'onInit');
            registerLifecycleMethod(original, 'after', 'init', 'afterInit');

            registerLifecycleMethod(original, 'before', 'load', 'beforeLoad');
            registerLifecycleMethod(original, 'on', 'load', 'onLoad');
            registerLifecycleMethod(original, 'after', 'load', 'afterLoad');

            registerLifecycleMethod(
                original,
                'before',
                'unload',
                'beforeUnload',
            );
            registerLifecycleMethod(original, 'on', 'unload', 'onUnload');
            registerLifecycleMethod(original, 'after', 'unload', 'afterUnload');
        }

        /**
         * The wrapped constructor function.
         * @param args The arguments for the constructor.
         * @returns The instance with registered lifecycle methods.
         */
        const wrappedConstructor = function (
            ...args: unknown[]
        ): ILifecycleObject {
            return construct(original, args);
        };

        // Transfer prototype
        wrappedConstructor.prototype = original.prototype;

        // Copy static methods and properties
        return copyStaticProperties(wrappedConstructor, original);
    };
}
