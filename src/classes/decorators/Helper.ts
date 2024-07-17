/**
 * Copies static properties from the source to the target.
 * @param target The target to copy the properties to.
 * @param source The source to copy the properties from.
 * @returns The target with the copied properties as type SourceType.
 */
export function copyStaticProperties<SourceType>(
    target: unknown,
    source: SourceType,
): SourceType {
    let currentSource = source as unknown;

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

    return target as SourceType;
}
