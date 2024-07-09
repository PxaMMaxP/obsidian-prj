import { IDIContainer, IDIContainer_ } from './interfaces/IDIContainer';

/**
 * Dependency Injection Container
 */
const DIContainer_: IDIContainer_ = class DIContainer implements IDIContainer {
    private _dependencies = new Map<string, unknown>();

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
     * @returns The resolved dependency
     * @throws Error if the dependency is not found
     */
    public resolve<T>(identifier: string): T {
        const dependency = this._dependencies.get(identifier);

        if (!dependency) {
            throw new Error(`Dependency ${identifier} not found`);
        }

        return dependency as T;
    }
};

export { DIContainer_ as DIContainer };
