import { ILogger } from 'src/interfaces/ILogger';
import { ObjectPath } from './types/ObjectPath';

/**
 * A class responsible for
 * - creating and handling proxy operations on data objects,
 * - manage a change object through a delegate function to track changes on the data object.
 * @template T The type of the data object.
 */
export default class ProxyHandler<T extends object> {
    /**
     * A map to store proxies of objects to reuse them
     * instead of unnecessarily creating new proxies for the same objects.
     * @remarks - The key is the object (proxy target) and the value is the proxy itself.
     * - A WeakMap is used to prevent memory leaks =>
     * weak references to objects ensure that they can be garbage collected
     * when they are no longer needed or referenced elsewhere.
     */
    private _proxyMap: WeakMap<object, unknown> = new WeakMap();

    /**
     * A logger instance for logging purposes.
     * @remarks - The logger is optional and can be undefined.
     * @see {@link ILogger}
     */
    private logger: ILogger | undefined;

    /**
     * A delegate function for updating key-value pairs.
     * @remarks - If the proxy is used to update key-value pairs on the original object,
     * this delegate function is used to update the key-value pairs on a different `change tracking` object.
     */
    private _updateKeyValue: (key: string, value: unknown) => void;

    /**
     * Updates a key/value pair indirectly via the `_updateKeyValue` delegate and encapsulates it for error handling.
     * @param key The key of the pair.
     * @param value The value of the pair.
     */
    private updateKeyValue(key: string, value: unknown): void {
        try {
            this._updateKeyValue(key, value);
        } catch (error) {
            this.logger?.error(
                `Failed to update key-value pair for key ${key} with value: ${error.message}`,
            );
        }
    }

    /**
     * Creates an instance of ProxyHandler.
     * @param logger A optional logger instance for logging purposes.
     * @param updateKeyValue A delegate function for updating key-value pairs.
     *                       See {@link _updateKeyValue} & {@link updateKeyValue}.
     */
    constructor(
        logger: ILogger | undefined,
        updateKeyValue: (key: string, value: unknown) => void,
    ) {
        this.logger = logger;
        this._updateKeyValue = updateKeyValue;
    }

    /**
     * Creates a proxy for the given object.
     * @param obj The object to create a proxy for.
     * @param path The path of the object.
     *            Default is an empty string. See {@link ObjectPath}.
     * @returns The proxy object.
     */
    public createProxy(obj: Partial<T>, path: ObjectPath = ''): T {
        const existingProxy = this.getExistingProxy(obj);

        if (existingProxy) {
            return existingProxy;
        }

        const proxy = new Proxy(obj, {
            get: (target, property, receiver) =>
                this.handleGet(target, property, receiver, path),
            set: (target, property, value, receiver) =>
                this.handleSet(target, property, value, receiver, path),
            deleteProperty: (target, property) =>
                this.handleDeleteProperty(target, property, path),
        });

        this.addProxyToMap(obj, proxy);

        return proxy as T;
    }

    /**
     * Handles the get operation for the proxy.
     * @private
     * @param target The target object.
     * @param property The property to get.
     * @param The proxy or an object that inherits from the proxy.
     * @param path The path of the object. See {@link ObjectPath}.
     * @returns The value of the property.
     */
    private handleGet(
        target: Partial<T>,
        property: string | symbol,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        receiver: any,
        path: ObjectPath,
    ): unknown {
        if (this.isPrivate(property)) {
            return target[property as keyof Partial<T>];
        }

        const propertyKey = this.getPropertyKey(property);
        const value = target[property as keyof Partial<T>];

        if (value && typeof value === 'object') {
            const newPath = this.createObjectPath(path, propertyKey);

            return this.createProxy(value as Partial<T>, newPath);
        }

        return value;
    }

    /**
     * Handles the set operation for the proxy.
     * @private
     * @param target The target object.
     * @param property The property to set.
     * @param value The value to set.
     * @param receiver The proxy or an object that inherits from the proxy.
     * @param path The path of the object. See {@link ObjectPath}.
     * @returns {boolean} True if the property was set successfully, false otherwise.
     */
    private handleSet(
        target: Partial<T>,
        property: string | symbol,
        value: unknown,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        receiver: any,
        path: ObjectPath,
    ): boolean {
        if (this.isPrivate(property)) {
            target[property as keyof Partial<T>] = value as
                | T[keyof T]
                | undefined;

            return true;
        }

        const propertyKey = this.getPropertyKey(property);
        const newPath = this.createObjectPath(path, propertyKey);
        const resolvedValue = this.resolveProxyValue(value);

        try {
            target[property as keyof Partial<T>] = resolvedValue as
                | T[keyof T]
                | undefined;
            this.updateKeyValue(newPath, target[property as keyof Partial<T>]);

            return true;
        } catch (error) {
            this.logger?.error(
                `Failed to set property ${propertyKey} on path ${newPath}: ${error.message}`,
            );

            return false;
        }
    }

    /**
     * Handles the delete operation for the proxy.
     * @param target The target object.
     * @param property The property to delete.
     * @param path The path of the object. See {@link ObjectPath}.
     * @returns {boolean} True if the property was deleted successfully, false otherwise.
     */
    private handleDeleteProperty(
        target: Partial<T>,
        property: string | symbol,
        path: ObjectPath,
    ): boolean {
        const propertyKey = this.getPropertyKey(property);
        const newPath = this.createObjectPath(path, propertyKey);

        try {
            delete target[property as keyof Partial<T>];
            this._updateKeyValue(newPath, null);

            return true;
        } catch (error) {
            this.logger?.error(
                `Failed to delete property ${propertyKey} on path ${newPath}: ${error.message}`,
            );

            return false;
        }
    }

    /**
     * Determines if a property is private based on its name.
     * Private properties start with an underscore. Example: `_privateProperty`.
     * @param property The property to check.
     * @returns {boolean} True if the property is private, false otherwise.
     */
    private isPrivate(property: string | symbol): boolean {
        return property.toString().startsWith('_');
    }

    /**
     * Resolves the value of a proxy object.
     * @param value The value to resolve.
     * @returns {unknown} The resolved value.
     */
    private resolveProxyValue(value: unknown): unknown {
        if (Array.isArray(value)) {
            return value.map((item) => this.resolveProxyValue(item));
        } else if (value && typeof value === 'object') {
            const result: Record<string | symbol, unknown> = {};
            const entries = Object.entries(value as object);

            for (const [key, val] of entries) {
                result[key] = this.resolveProxyValue(val);
            }

            return result;
        }

        return value;
    }

    /**
     * Retrieves the string key of a property.
     * @param property The property to get the key for.
     * @returns {string} The string key of the property.
     */
    private getPropertyKey(property: string | symbol): string {
        return typeof property === 'symbol' ? property.toString() : property;
    }

    /**
     * Creates an object path by appending a property to an optional existing path.
     * @param path Optional existing path. See {@link ObjectPath}.
     * @param property The property to append.
     * @returns {ObjectPath} The object path.
     * @example - createObjectPath('data', 'title') => 'data.title'
     *          - createObjectPath(undefined, 'title') => 'title'
     */
    private createObjectPath(
        path: ObjectPath | undefined,
        property: string,
    ): ObjectPath {
        return path ? `${path}.${property}` : `${property}`;
    }

    /**
     * Retrieves an existing proxy for the given object.
     * @param obj The object for which the proxy, if available, is to be retrieved.
     * @returns {T | undefined} The existing proxy or undefined if no proxy is available.
     */
    private getExistingProxy(obj: Partial<T>): T | undefined {
        return this._proxyMap.get(obj) as T | undefined;
    }

    /**
     * Adds a proxy to the map for the given object.
     * @param obj The object to add the proxy for.
     * @param proxy The proxy to add.
     */
    private addProxyToMap(obj: Partial<T>, proxy: Partial<T>): void {
        this._proxyMap.set(obj, proxy);
    }
}
