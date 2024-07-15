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
    T extends { new (...args: unknown[]): NonNullable<unknown> },
>(constructor: T, ...args: unknown[]): T {
    const original = constructor;
    let instance: T;

    /**
     * Wraps the constructor to create a singleton.
     * @param args The arguments for the constructor.
     * @returns The singleton instance.
     */
    const wrappedConstructor: T = function (...args: unknown[]) {
        if (!instance) {
            instance = new constructor(...args) as T;
        }

        return instance;
    } as unknown as T;

    // Transfer prototype
    wrappedConstructor.prototype = constructor.prototype;

    // Copy static methods and properties
    copyStaticProperties(wrappedConstructor, original);

    return wrappedConstructor as T;
}
