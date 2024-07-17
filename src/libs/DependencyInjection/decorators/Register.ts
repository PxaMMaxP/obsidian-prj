import { DIContainer } from '../DIContainer';

/**
 * A decorator to register a class in the DI (Dependency Injection) container.
 * @template TargetType The type of the class to be registered.
 * @param identifier The identifier used to register the class in the DI container.
 * @param deprecated If true, the dependency is deprecated => a warning
 * is logged when the dependency is resolved.
 * @returns A function that is applied as a decorator to the class.
 * @example
 * ```ts
 * \@Register('MyClassIdentifier')
 * class MyClass {
 *   // ...
 * }
 * ```
 */
export function Register<
    TargetType extends new (...args: unknown[]) => InstanceType<TargetType>,
>(identifier: string, deprecated?: boolean) {
    return function (constructor: TargetType, ...args: unknown[]): void {
        // Get the instance of the DI container
        const diContainer = DIContainer.getInstance();

        // Register the class in the DI container
        diContainer.register(identifier, constructor, deprecated);
    };
}

/**
 * A decorator to register an instance of a class in the DI (Dependency Injection) container.
 * The instance is created only when it is first needed (Lazy Initialization).
 * @template TargetType The type of the class whose instance is to be registered.
 * @param identifier The identifier used to register the instance in the DI container.
 * @param args The arguments to be passed to the constructor of the class.
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
>(identifier: string, ...args: unknown[]) {
    return function (constructor: TargetType, ..._args: unknown[]): void {
        // Get the instance of the DI container
        const diContainer = DIContainer.getInstance();

        // Create a proxy to instantiate the class when needed (Lazy Initialization)
        let lazyProxy: unknown = new Proxy(
            {},
            {
                get(target, prop, receiver) {
                    // Create the instance of the class
                    const instance = new constructor(...args);
                    lazyProxy = instance;

                    // Return the requested property of the instance
                    return instance[prop as keyof InstanceType<TargetType>];
                },
                set(target, prop, value, receiver) {
                    // Create the instance of the class
                    const instance = new constructor(...args);
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
