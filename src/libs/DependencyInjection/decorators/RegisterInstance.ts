import { DIContainer } from '../DIContainer';
import { InitDelegate } from '../types/InitDelegate';

/**
 * A decorator to register an instance of a class in the DI (Dependency Injection) container.
 * The instance is created only when it is first needed (Lazy Initialization).
 * @template TargetType The type of the class whose instance is to be registered.
 * @param identifier The identifier used to register the instance in the DI container.
 * @param init An optional initializer function which get the constructor of the class
 * as input and returns an instance of the class.
 * @returns A function that is applied as a decorator to the class.
 * @example
 * ```ts
 * \@RegisterInstance('MyClassInstanceIdentifier', arg1, arg2)
 * class MyClass {
 *   // ...
 * }
 * ```
 */
export function RegisterInstance<
    TargetType extends new (..._args: unknown[]) => InstanceType<TargetType>,
>(
    identifier: string,
    init?: InitDelegate<
        TargetType & { new (..._args: unknown[]): InstanceType<TargetType> },
        InstanceType<TargetType>
    >,
) {
    return function (constructor: TargetType, ...args: unknown[]): void {
        // Get the instance of the DI container
        const diContainer = DIContainer.getInstance();

        // Create a proxy to instantiate the class when needed (Lazy Initialization)
        let lazyProxy: unknown = new Proxy(
            {},
            {
                get(target, prop, receiver) {
                    let instance: InstanceType<TargetType>;

                    if (init) {
                        instance = init(constructor);
                    } else {
                        instance = new constructor(...args);
                    }
                    lazyProxy = instance;

                    // Return the requested property of the instance
                    return instance[prop as keyof InstanceType<TargetType>];
                },
                set(target, prop, value, receiver) {
                    let instance: InstanceType<TargetType>;

                    if (init) {
                        instance = init(constructor);
                    } else {
                        instance = new constructor(...args);
                    }
                    lazyProxy = instance;

                    // Set the requested property of the instance
                    return (instance[prop as keyof InstanceType<TargetType>] =
                        value);
                },
            },
        );

        // Register the lazy proxy in the DI container
        diContainer.register(identifier, lazyProxy);
    };
}
