import { DIContainer } from '../DIContainer';
import { InitDelegate } from '../types/InitDelegate';

/**
 * A decorator to inject a dependency from a DI (Dependency Injection) container.
 * The dependency is lazily evaluated when the property is accessed for the first time.
 * This can help avoid issues like circular dependencies and not-found dependencies.
 * @template ClassType The type of the property to be injected.
 * @param identifier The identifier used to resolve the dependency from the DI container.
 * @param init An optional initializer function to transform the dependency before injection.
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
export function Inject<T, U>(
    identifier: string,
    init?: InitDelegate<T, U>,
    necessary = true,
) {
    return function (target: unknown, propertyKey: string | symbol): void {
        // Unique symbol to store the private property
        const privatePropertyKey: unique symbol = Symbol();
        // Get the DI container instance
        const diContainer = DIContainer.getInstance();

        // Function to evaluate the dependency lazily
        // to avoid circular dependencies, not found dependencies, etc.
        const evaluate = (): T | undefined => {
            return diContainer.resolve<T>(identifier, necessary);
        };

        // Define the property
        Object.defineProperty(target, propertyKey, {
            get() {
                // If the property is not defined, evaluate the dependency
                if (!this.hasOwnProperty(privatePropertyKey)) {
                    if (init) {
                        try {
                            this[privatePropertyKey] = init(evaluate() as T);
                        } catch (error) {
                            if (necessary) {
                                throw error;
                            }
                        }
                    } else {
                        this[privatePropertyKey] = evaluate();
                    }
                }

                return this[privatePropertyKey];
            },
            // Not necessary to set the property
            // set(value: PropertieType) {
            //     this[privatePropertyKey] = value;
            // },
            enumerable: true,
            configurable: false,
        });
    };
}
