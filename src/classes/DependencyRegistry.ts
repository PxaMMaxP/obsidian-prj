/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DependencyRegistry is a singleton class that manages the registration and resolution
 * of instances and classes for dependency injection purposes.
 */
export default class DependencyRegistry {
    private static _instance: DependencyRegistry;
    private _instances: Map<string, any> = new Map();
    private _classes: Map<string, any> = new Map();

    /**
     * Private constructor to prevent direct instantiation.
     */
    private constructor() {}

    /**
     * Retrieves the singleton instance of DependencyRegistry.
     * @returns The singleton instance.
     */
    public static getInstance(): DependencyRegistry {
        if (!DependencyRegistry._instance) {
            DependencyRegistry._instance = new DependencyRegistry();
        }

        return DependencyRegistry._instance;
    }

    /**
     * Registers an instance with a specific name.
     * @param name - The name to register the instance under.
     * @param instance - The instance to register.
     */
    public registerInstance<T>(name: string, instance: T): void {
        this._instances.set(name, instance);
    }

    /**
     * Registers a class with a specific name.
     * @param name - The name to register the class under.
     * @param clazz - The class constructor to register.
     */
    public registerClass<T>(
        name: string,
        clazz: new (...args: unknown[]) => T,
    ): void {
        this._classes.set(name, clazz);
    }

    /**
     * Resolves a dependency by name.
     * @param name - The name of the dependency to resolve.
     * @returns The resolved instance or a new instance of the registered class.
     * @throws {Error} If the dependency is not found.
     */
    public resolve<T>(name: string): T {
        if (this._instances.has(name)) {
            return this._instances.get(name);
        }

        if (this._classes.has(name)) {
            const clazz = this._classes.get(name);

            return new clazz();
        }
        throw new Error(`Dependency ${name} not found`);
    }
    /**
     * Checks if the dependency is provided, if not, resolves it.
     * @param name The name of the dependency to check.
     * @param dependency The dependency which is provided or resolved.
     * @returns The provided or resolved dependency.
     * @throws {Error} If the dependency is not provided or resolved.
     */
    public static isDependencyProvided<T>(
        name: string,
        dependency: T | undefined,
    ): T {
        if (dependency !== undefined) {
            return dependency as T;
        } else {
            const solvedDependency = this._instance.resolve(name);

            if (!solvedDependency) {
                throw new Error(`Dependency ${name} not provided`);
            }

            return solvedDependency as T;
        }
    }
}
