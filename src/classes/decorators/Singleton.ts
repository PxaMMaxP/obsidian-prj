import { copyStaticProperties } from './Helper';

/**
 * Singleton decorator.
 * @param constructor The constructor to create a singleton from.
 * @param args Other arguments from the decorator interface.
 * @returns The singleton class.
 * @remarks - To get the singleton instance, call the constructor.
 * - Place this decorator directly above the class declaration
 * @example
 * ```ts
 * \@anotherDecorators //---> third priority
 * \@otherDecorators   //--> second priority
 * \@Singleton         //-> first priority
 * class MyClass {     // Place the Singleton decorator
 *    constructor() {  // directly above the class declaration
 *       // ...        // for priority above other decorators!
 *   }
 * }
 *
 * const instance = new MyClass();
 * const instance2 = new MyClass();
 *
 * console.log(instance === instance2); // true
 * ```
 */
export function Singleton<
    TargetType extends new (...args: unknown[]) => InstanceType<TargetType>,
>(constructor: TargetType, ...args: unknown[]): TargetType {
    const original = constructor;
    let instance: InstanceType<TargetType>;

    /**
     * Wraps the constructor to create a singleton.
     * @param args The arguments for the constructor.
     * @returns The singleton instance.
     */
    const wrappedConstructor = function (
        ...args: unknown[]
    ): InstanceType<TargetType> {
        if (!instance) {
            instance = new constructor(...args) as InstanceType<TargetType>;
        }

        return instance;
    };

    // Transfer prototype
    wrappedConstructor.prototype = constructor.prototype;

    // Copy static methods and properties
    return copyStaticProperties(wrappedConstructor, original);
}
