/**
 * Static Dependency Injection Container Interface
 */
export interface IDIContainer_ {
    getInstance(): IDIContainer;
}

/**
 * Dependency Injection Container Interface
 */
export interface IDIContainer {
    /**
     * Register a dependency
     * @param identifier The identifier of the dependency
     * @param dependency The dependency to register
     */
    register<T>(identifier: string, dependency: T): void;

    /**
     * Resolve a dependency
     * @param identifier The identifier of the dependency
     * @param necessary If true, throws an error if the dependency is not found
     * @returns The resolved dependency
     * @throws Error if the dependency is not found
     */
    resolve<T>(identifier: string, necessary?: true): T;
    /**
     * Resolve a dependency
     * @param identifier The identifier of the dependency
     * @param necessary If true, throws an error if the dependency is not found
     * @returns The resolved dependency or undefined if the dependency is not found
     */
    resolve<T>(identifier: string, necessary?: false): T | undefined;
}
