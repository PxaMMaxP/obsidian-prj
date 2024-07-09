/**
 * Dependency Injection Container Constructor Interface
 */
export interface IDIContainer_ {
    new (): IDIContainer;
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
     */
    resolve<T>(identifier: string): T;
}
