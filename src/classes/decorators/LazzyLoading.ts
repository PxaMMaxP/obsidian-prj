/**
 * A function type representing a delegate that retrieves a property of type `PropertieType`.
 * @template ClassInstType - The type of the class instance.
 * @template PropertieType - The type of the property to be retrieved.
 * @param context - The context (`this`) in which the getter is called.
 * @returns The property of type `PropertieType` or `undefined`.
 */
export type GetDelegate<ClassInstType, PropertieType> = (
    context: ClassInstType,
) => PropertieType | undefined;

/**
 * A function type representing a delegate that sets a property of type `PropertieType` using an input of type `InputType`.
 * @template ClassInstType - The type of the class instance.
 * @template InputType - The type of the input parameter.
 * @template PropertieType - The type of the property to be set.
 * @param value - The input value of type `InputType`.
 * @param context - The context (`this`) in which the setter is called.
 * @returns The property of type `PropertieType` or `undefined`.
 */
export type SetDelegate<ClassInstType, InputType, PropertieType> = (
    value: InputType,
    context: ClassInstType,
) => PropertieType | undefined;

/**
 * A decorator to lazily load a property in a class. The property is initialized using the provided `get` delegate
 * when accessed for the first time. Optionally, a `set` delegate can be provided to customize the setting behavior
 * of the property.
 * @template ClassInstType - The type of the class instance.
 * @template PropertieType - The type of the property to be lazily loaded.
 * @template InputType - The type of the input value used in the setter delegate.
 * @param get - A delegate function to retrieve the property value.
 * @param set - An optional delegate function or `false`. If `false`, no setter is defined. If `undefined`, a simple setter is used. If a function, the function is used as the setter.
 * @returns A decorator function to be applied on the class property.
 * @remarks This decorator does not handle asynchronous loading or error handling. Asynchronous operations and errors should be managed within the provided delegates.
 * @example
 * ```ts
 * class Example {
 *   \@LazzyLoading(
 *     (context) => {
 *       console.log("Loading value...");
 *       return 42;
 *     },
 *     (value, context) => {
 *       console.log("Setting value to", value);
 *       return value;
 *     }
 *   )
 *   public myProperty!: number;
 * }
 *
 * const example = new Example();
 *
 * // The value is loaded only when myProperty is accessed for the first time
 * console.log(example.myProperty); // Output: "Loading value..." 42
 *
 * // The setter is called when myProperty is set
 * example.myProperty = 100; // Output: "Setting value to 100"
 * console.log(example.myProperty); // Output: 100
 * ```
 */
export function LazzyLoading<ClassInstType, PropertieType, InputType>(
    get: GetDelegate<ClassInstType, PropertieType>,
    set?: SetDelegate<ClassInstType, InputType, PropertieType> | false,
) {
    return function (
        target: ClassInstType,
        propertyKey: string | symbol,
    ): void {
        // Unique symbol to store the private property
        const privatePropertyKey: unique symbol = Symbol();

        // Define the property descriptor
        const descriptor: PropertyDescriptor = {
            get() {
                // If the property is not defined, evaluate the loading delegate
                if (!this.hasOwnProperty(privatePropertyKey)) {
                    this[privatePropertyKey] = get(this);
                }

                return this[privatePropertyKey];
            },
            enumerable: true,
            configurable: false,
        };

        // Handle setter definition based on the set parameter
        if (set !== false) {
            descriptor.set = function (value: InputType) {
                if (typeof set === 'function') {
                    this[privatePropertyKey] = set(value, this);
                } else {
                    this[privatePropertyKey] = value;
                }
            };
        }

        // Define the property on the target
        Object.defineProperty(target, propertyKey, descriptor);
    };
}
