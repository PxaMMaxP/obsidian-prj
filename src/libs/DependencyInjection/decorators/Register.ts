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
