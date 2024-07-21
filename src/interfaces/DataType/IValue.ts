/**
 * Interface for value
 */
export interface IValue<Type> {
    /**
     * Get the value as {@link Type} of the Interface.
     */
    get value(): Type | null | undefined;
    /**
     * Set the value.
     * @param value The value to set as `unknown`.
     */
    set value(value: unknown);
}

/**
 * Checks if the object is an {@link IValue}.
 * @param obj The object to check.
 * @returns Whether the object is an {@link IValue}.
 */
export function isIValue(obj: unknown): obj is IValue<unknown> {
    if (obj == null || typeof obj !== 'object') {
        return false;
    }

    const descriptor = Object.getOwnPropertyDescriptor(obj, 'value');

    if (!descriptor) {
        return false;
    }

    const hasGetter = typeof descriptor.get === 'function';
    const hasSetter = typeof descriptor.set === 'function';

    return hasGetter && hasSetter;
}
