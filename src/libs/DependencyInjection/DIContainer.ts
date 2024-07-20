import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { IDIContainer, IDIContainer_ } from './interfaces/IDIContainer';

/**
 * Dependency Entry Interface
 */
interface IDependency {
    /**
     * The dependency itself
     */
    dependency: unknown;
    /**
     * If true, the dependency is deprecated => a warning
     * is logged when the dependency is resolved
     */
    deprecated?: boolean;
}

/**
 * Dependency Injection Container
 */
@ImplementsStatic<IDIContainer_>()
export class DIContainer implements IDIContainer {
    private static _instance: DIContainer;
    private readonly _dependencies = new Map<string, IDependency>();

    /**
     * Private constructor to prevent direct instantiation.
     */
    private constructor() {}

    /**
     * Retrieves the singleton instance of DependencyRegistry.
     * @returns The singleton instance.
     */
    public static getInstance(): DIContainer {
        if (!DIContainer._instance) {
            DIContainer._instance = new DIContainer();
        }

        return DIContainer._instance;
    }

    /**
     * Register a dependency
     * @param identifier The identifier of the dependency
     * @param dependency The dependency to register
     * @param deprecated If true, the dependency is deprecated => a warning
     * is logged when the dependency is resolved
     */
    public register<T>(
        identifier: string,
        dependency: T,
        deprecated = false,
    ): void {
        this._dependencies.set(identifier, {
            dependency: dependency,
            deprecated: deprecated,
        });
    }

    /**
     * Resolve a dependency
     * @param identifier The identifier of the dependency
     * @param necessary If true, throws an error if the dependency is not found
     * @returns The resolved dependency or undefined if the dependency is not found (if necessary is false)
     * @throws Error if the dependency is not found (if necessary is true)
     */
    public resolve<T>(identifier: string, necessary = true): T | undefined {
        const dependency = this._dependencies.get(identifier);

        if (necessary && !dependency) {
            throw new Error(`Dependency ${identifier} not found`);
        } else if (!dependency) {
            return undefined;
        }

        if (dependency.deprecated) {
            // eslint-disable-next-line no-console
            console.warn(`Dependency ${identifier} is deprecated`);

            // Remove the deprecation warning; it should only be logged once.
            dependency.deprecated = false;
        }

        return dependency.dependency as T;
    }
}
