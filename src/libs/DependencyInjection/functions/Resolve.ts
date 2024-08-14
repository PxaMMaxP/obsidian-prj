/* eslint-disable deprecation/deprecation */
import { DIContainer } from '../DIContainer';

/**
 * Resolve a dependency
 * @param identifier The identifier of the dependency
 * @returns The resolved dependency
 * @throws Error if the dependency is not found
 * @deprecated Use the `Resolve` function from the `ts-injex` package instead.
 */
export function Resolve<T>(identifier: string): T;
/**
 * Resolve a dependency
 * @param identifier The identifier of the dependency
 * @param necessary If true, throws an error if the dependency is not found
 * @returns The resolved dependency or undefined if the dependency is not found
 * @deprecated Use the `Resolve` function from the `ts-injex` package instead.
 */
export function Resolve<T>(identifier: string, necessary: false): T | undefined;

/**
 * Resolve a dependency
 * @param identifier The identifier of the dependency
 * @param necessary If true, throws an error if the dependency is not found
 * @returns The resolved dependency or undefined if the dependency is not found
 * @deprecated Use the `Resolve` function from the `ts-injex` package instead.
 */
export function Resolve<T>(
    identifier: string,
    necessary?: boolean,
): T | undefined {
    return DIContainer.getInstance().resolve<T>(identifier, necessary);
}
