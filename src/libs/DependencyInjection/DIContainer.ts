import { IDIContainer, IDIContainer_ } from './interfaces/IDIContainer';

/**
 * Dependency Injection Container
 */
const DIContainer_: IDIContainer_ = class DIContainer implements IDIContainer {
    private static _instance: DIContainer;
    private _dependencies = new Map<string, unknown>();

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
     */
    public register<T>(identifier: string, dependency: T): void {
        this._dependencies.set(identifier, dependency);
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

        return dependency as T;
    }
};

export { DIContainer_ as DIContainer };
