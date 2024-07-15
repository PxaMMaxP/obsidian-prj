import { ILogger } from 'src/interfaces/ILogger';
import { ObjectPath } from '../types/ObjectPath';

/**
 * Constructor Interface for ProxyHandler.
 */
export interface IProxyHandler_ {
    /**
     * Creates an instance of ProxyHandler.
     * @param logger A optional logger instance for logging purposes.
     * @param updateKeyValue A delegate function for updating key-value pairs.
     */
    new <T extends object>(
        logger: ILogger | undefined,
        updateKeyValue: (key: string, value: unknown) => void,
    ): IProxyHandler<T>;
}

/**
 * Interface for ProxyHandler.
 * @template T The type of the data object.
 */
export interface IProxyHandler<T extends object> {
    /**
     * Creates a proxy for the given object.
     * @param obj The object to create a proxy for.
     * @param path The path of the object.
     * Default is an empty string. See {@link ObjectPath}.
     * @returns The proxy object.
     */
    createProxy(obj: Partial<T>, path?: ObjectPath): T;
}
