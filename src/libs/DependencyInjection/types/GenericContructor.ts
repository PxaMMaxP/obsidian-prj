/**
 * Generic constructor type.
 */
export type GenericConstructor<
    T extends abstract new (...args: unknown[]) => InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => T;

/**
 * Force generic constructor type.
 * This type is used to force a class to be a constructor.
 */
export type ForceConstructor<T> = new (...args: unknown[]) => T;
