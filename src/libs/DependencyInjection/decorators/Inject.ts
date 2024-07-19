import { DIContainer } from '../DIContainer';
import { InitDelegate } from '../types/InitDelegate';

/**
 * Evaluate a dependency from a DI (Dependency Injection) container.
 * @param identifier The identifier used to resolve the dependency from the DI container.
 * @param necessary Indicates if the dependency is necessary.
 * @returns The resolved dependency or `undefined` if the dependency is not found and not necessary.
 */
const evaluate = (identifier: string, necessary: boolean): unknown => {
    const diContainer = DIContainer.getInstance();

    return diContainer.resolve<unknown>(identifier, necessary);
};

/**
 * Try to initialize a dependency with an optional initializer function.
 * @param init A function to transform the dependency before injection.
 * @param dependency The dependency to be transformed.
 * @param necessary Indicates if the dependency is necessary.
 * @returns The transformed dependency or `undefined` if the transformation fails and the dependency is not necessary.
 */
const tryInit = <DependencyType, FieldType>(
    init: InitDelegate<DependencyType, FieldType>,
    dependency: DependencyType,
    necessary: boolean,
): FieldType => {
    try {
        return init(dependency);
    } catch (error) {
        if (necessary) {
            throw new Error(
                `Failed to initialize the dependency: ${error.message}`,
            );
        } else {
            return undefined as unknown as FieldType;
        }
    }
};

/**
 * A decorator to inject a dependency from a DI (Dependency Injection) container.
 * The dependency is lazily evaluated when the property is accessed for the first time.
 * This can help avoid issues like circular dependencies and not-found dependencies.
 * @template ClassType The type of the property to be injected.
 * @param identifier The identifier used to resolve the dependency from the DI container.
 * @param init An optional initializer function to transform the dependency before injection.
 * It get the raw dependency as input and returns the transformed dependency.
 * @param necessary Indicates if the dependency is necessary.
 * - If `true`, an error will be thrown if the dependency cannot be resolved.
 * - If `false`, `undefined` will be returned if the dependency cannot be resolved.
 * @returns A decorator function to be applied on the class property.
 * @see {@link DIContainer}
 * @example
 * ```ts
 * class MyClass {
 *   \@Inject<MyDependency>('MyDependencyIdentifier')
 *   private myDependency!: MyDependency;
 * }
 * ```
 * @example
 * ```ts
 * class MyClass {
 *   \@Inject('ILogger_', (x: ILogger_) => x.getLogger('Tags'), false)
 *   private _logger?: ILogger;
 * }
 * ```
 */
export function Inject<FieldType, DependencyType = FieldType>(
    identifier: string,
    init?: InitDelegate<DependencyType, FieldType>,
    necessary = true,
) {
    return function <ClassType>(
        target: ClassType,
        propertyKey: string | symbol,
    ): void {
        // Unique symbol to store the private property
        const privatePropertyKey: unique symbol = Symbol();

        // Define the property
        Object.defineProperty(target, propertyKey, {
            get() {
                // If the property is not defined, evaluate the dependency
                if (this.hasOwnProperty(privatePropertyKey) == null) {
                    if (init) {
                        tryInit(
                            init,
                            evaluate(identifier, necessary),
                            necessary,
                        );
                    } else {
                        this[privatePropertyKey] = evaluate(
                            identifier,
                            necessary,
                        );
                    }
                }

                return this[privatePropertyKey];
            },
            enumerable: true,
            configurable: false,
        });
    };
}
