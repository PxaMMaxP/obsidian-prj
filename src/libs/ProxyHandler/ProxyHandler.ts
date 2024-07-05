import { ILogger } from 'src/interfaces/ILogger';

/**
 * A class responsible for handling proxy operations on data objects.
 * @template T The type of the data object.
 */
export default class ProxyHandler<T extends object> {
    /**
     * A map to store proxies of objects.
     * @private
     */
    private _proxyMap: WeakMap<object, unknown> = new WeakMap();

    /**
     * A logger instance for logging purposes.
     * @private
     */
    private logger: ILogger | undefined;

    /**
     * A delegate function for updating key-value pairs.
     * @private
     */
    private _updateKeyValue: (key: string, value: unknown) => void;

    /**
     * Updates a key/value pair indirectly via the `_updateKeyValue` delegate and encapsulates it for error handling.
     * @private
     * @param {string} key The key of the pair.
     * @param {unknown} value The value of the pair.
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
     * @param {ILogger} logger - The logger instance to use for logging.
     * @param {(key: string, value: unknown) => void} updateKeyValue - The delegate function for updating key-value pairs.
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
     * @param {Partial<T>} obj - The object to create a proxy for.
     * @param {string} [path=''] - The path of the object (default is an empty string).
     * @returns {T} - The proxy object.
     */
    public createProxy(obj: Partial<T>, path = ''): T {
        const existingProxy = this._proxyMap.get(obj);

        if (existingProxy) {
            return existingProxy as T;
        }

        const proxy = new Proxy(obj, {
            get: (target, property, receiver) =>
                this.handleGet(target, property, receiver, path),
            set: (target, property, value, receiver) =>
                this.handleSet(target, property, value, receiver, path),
            deleteProperty: (target, property) =>
                this.handleDeleteProperty(target, property, path),
        });

        this._proxyMap.set(obj, proxy);

        return proxy as T;
    }

    /**
     * Handles the get operation for the proxy.
     * @private
     * @param {Partial<T>} target - The target object.
     * @param {string | symbol} property - The property to get.
     * @param {any} receiver - The proxy or an object that inherits from the proxy.
     * @param {string} path - The path of the object.
     * @returns {unknown} - The value of the property.
     */
    private handleGet(
        target: Partial<T>,
        property: string | symbol,
        receiver: any,
        path: string,
    ): unknown {
        if (this.isPrivate(property)) {
            return target[property as keyof Partial<T>];
        }

        const propertyKey = this.getPropertyKey(property);
        const value = target[property as keyof Partial<T>];

        if (value && typeof value === 'object') {
            return this.createProxy(
                value as Partial<T>,
                path ? `${path}.${propertyKey}` : `${propertyKey}`,
            );
        }

        return value;
    }

    /**
     * Handles the set operation for the proxy.
     * @private
     * @param {Partial<T>} target - The target object.
     * @param {string | symbol} property - The property to set.
     * @param {unknown} value - The value to set.
     * @param {any} receiver - The proxy or an object that inherits from the proxy.
     * @param {string} path - The path of the object.
     * @returns {boolean} - True if the property was set successfully, false otherwise.
     */
    private handleSet(
        target: Partial<T>,
        property: string | symbol,
        value: unknown,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        receiver: any,
        path: string,
    ): boolean {
        if (this.isPrivate(property)) {
            target[property as keyof Partial<T>] = value as
                | T[keyof T]
                | undefined;

            return true;
        }

        const propertyKey = this.getPropertyKey(property);
        const newPath = path ? `${path}.${propertyKey}` : `${propertyKey}`;
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
     * @private
     * @param {Partial<T>} target - The target object.
     * @param {string | symbol} property - The property to delete.
     * @param {string} path - The path of the object.
     * @returns {boolean} - True if the property was deleted successfully, false otherwise.
     */
    private handleDeleteProperty(
        target: Partial<T>,
        property: string | symbol,
        path: string,
    ): boolean {
        const propertyKey = this.getPropertyKey(property);
        const newPath = path ? `${path}.${propertyKey}` : `${propertyKey}`;

        try {
            delete target[property as keyof Partial<T>];
            this._updateKeyValue(newPath, undefined);

            return true;
        } catch (error) {
            this.logger?.error(
                `Failed to delete property ${propertyKey} on path ${newPath}: ${error.message}`,
            );

            return false;
        }
    }

    /**
     * Determines if a property is private based on its name. Private properties start with an underscore.
     * @private
     * @param {string | symbol} property - The property to check.
     * @returns {boolean} - True if the property is private, false otherwise.
     */
    private isPrivate(property: string | symbol): boolean {
        return property.toString().startsWith('_');
    }

    /**
     * Resolves the value of a proxy object.
     * @private
     * @param {unknown} value - The value to resolve.
     * @returns {unknown} - The resolved value.
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
     * @private
     * @param {string | symbol} property - The property to get the key for.
     * @returns {string} - The string key of the property.
     */
    private getPropertyKey(property: string | symbol): string {
        return typeof property === 'symbol' ? property.toString() : property;
    }
}
