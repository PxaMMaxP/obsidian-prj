// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TFile, FileManager } from "obsidian";
import Global from "../classes/Global";
import { TransactionModel } from "./TransactionModel";
import { YamlKeyMap } from "../types/YamlKeyMap";
import Logging from "src/classes/Logging";

export class BaseModel<T extends object> extends TransactionModel<T> {
    protected global = Global.getInstance();
    protected app = Global.getInstance().app;
    protected metadataCache = Global.getInstance().metadataCache;
    protected logger: Logging = Global.getInstance().logger;

    private _file: TFile | undefined;
    public get file(): TFile {
        if (this._file === undefined) {
            this.logger.warn("File not set");
        }
        return this._file as TFile;
    }
    /**
     * Sets the file of the model if not already set.
     * @param value The file to set.
     * @remarks - If the file is already set, a warning is logged and the file is not set.
     * - If the given file is set, the `writeChanges` function is set. 
     * And the default transaction is finished. Changes between the file and the data object are written.
     */
    public set file(value: TFile) {
        if (this._file === undefined) {
            super.setWriteChanges((update) => {
                return this.setFrontmatter(update as Record<string, unknown>);
            });
            this._file = value;
            super.callWriteChanges();
        } else {
            this.logger.warn("File already set");
        }
    }
    /**
     * The constructor of the data object.
     * @remarks - This is needed to create a new instance of the data object.
     * - It is set in the constructor of this class.
     * @see {@link BaseModel.constructor}
     */
    private ctor: new (data?: Partial<T>) => T;
    /**
     * The proxy of the data object.
     * @see {@link BaseModel._data}
     * @see {@link BaseModel.createProxy}
     */
    private dataProxy: T;
    /**
     * The proxy map to use.
     * @see {@link BaseModel.createProxy}
     */
    private proxyMap: WeakMap<object, unknown> = new WeakMap();
    /**
     * The yaml key map to use.
     * @see {@link YamlKeyMap}
     * @see {@link BaseModel.initYamlKeyMap}
     */
    private yamlKeyMap: YamlKeyMap | undefined;

    /**
     * Creates a new BaseModel instance.
     * @param file The file to create the model for.
     * @param ctor The constructor of the data object.
     * @param yamlKeyMap The yaml key map to use.
     */
    constructor(file: TFile | undefined, ctor: new (data?: Partial<T>) => T, yamlKeyMap: YamlKeyMap | undefined) {
        super(undefined);
        if (file) {
            super.setWriteChanges((update) => {
                return this.setFrontmatter(update as Record<string, unknown>);
            });
            this._file = file;
        }
        this.ctor = ctor;
        this.initYamlKeyMap(yamlKeyMap);
    }

    /**
     * Returns the data object as a proxy.
     * @returns The data object as a proxy.
     * @remarks This is the main entry point for the data object:
     * - If a proxy already exists, it is returned.
     * - If no proxy exists,
     * - and if frontmatter exists, a new proxy with the frontmatter as data is created.
     * - and if no frontmatter exists, a new proxy with an empty object as data is created.
     */
    protected get _data(): Partial<T> {
        if (this.dataProxy) {
            return this.dataProxy;
        }
        const frontmatter = this.getMetadata();
        if (!frontmatter) {
            this.logger.trace('Creating empty object');
            const emptyObject = new this.ctor();
            this.dataProxy = this.createProxy(emptyObject) as T;
            return this.dataProxy;
        }

        if (this.yamlKeyMap) {
            for (const key in this.yamlKeyMap) {
                if (frontmatter[this.yamlKeyMap[key]]) {
                    frontmatter[key] = frontmatter[this.yamlKeyMap[key]];
                    delete frontmatter[this.yamlKeyMap[key]];
                }
            }
        }

        const dataObject: T = new this.ctor(frontmatter as Partial<T>);
        this.dataProxy = this.createProxy(dataObject) as T;

        return this.dataProxy;
    }

    /**
     * Sets the data object.
     * @param values The values to set.
     * @remarks Overwrites only the given values.
     */
    protected set _data(values: Partial<T>) {
        const dataObject: T = new this.ctor(values);
        for (const key in dataObject) {
            this._data[key] = values[key];
        }
    }

    /**
     * Returns the frontmatter of the file if available.
     * @see {@link BaseModel.getMetadata}
     */
    private get frontmatter(): Record<string, unknown> {
        return this.getMetadata() ?? {};
    }

    /**
     * Sets the frontmatter of the file.
     * @param value The new frontmatter to set.
     * @remarks - Overwrites only the given values.
     * - If the file is not set, the frontmatter is not set.
     * @see {@link BaseModel.setFrontmatter}
     */
    private set frontmatter(value: Record<string, unknown>) {
        (async () => {
            await this.setFrontmatter(value);
        })();
    }

    /**
     * Updates the key value pair in the frontmatter.
     * @param value The new value to set.
     * @remarks - Overwrites only the given values.
     * - If the file is not set, the frontmatter is not set.
     */
    private async setFrontmatter(value: Record<string, unknown>) {
        if (!this._file) return Promise.resolve();
        try {
            await this.app.fileManager.processFrontMatter(this._file, (frontmatter) => {
                this.updateNestedFrontmatterObjects(frontmatter, value);
            });
            this.logger.debug(`Frontmatter for file ${this._file.path} successfully updated.`);
        } catch (error) {
            this.logger.error(`Error updating the frontmatter for file ${this._file.path}:`, error);
        }
    }

    private proxyMap: WeakMap<object, unknown> = new WeakMap();

    /**
     * Creates a proxy for the given object.
     * @param obj The object to create a proxy for.
     * @param path The path of the object. e.g. `data.title`
     * @returns The proxy object.
     * @remarks - If the object is already proxied, the existing proxy is returned.
     * - If the object is not proxied, a new proxy is created
     * and the `proxyMap` is updated. The proxy is returned.
     * @see {@link BaseModel.proxyMap}
     * - If the object is an object, the function is called recursively.
     * - Only non-proxy values are sent to the `updateKeyValue` function.
     * @see {@link BaseModel.resolveProxyValue}
     * @see {@link BaseModel.updateKeyValue}
     */
    private createProxy(obj: Partial<T>, path = ""): unknown {
        const existingProxy = this.proxyMap.get(obj);
        if (existingProxy) {
            return existingProxy;
        }

        const proxy = new Proxy(obj, {
            get: (target, property, receiver) => {
                const propertyKey = this.getPropertyKey(property);
                const value = Reflect.get(target, property, receiver);
                const newPath = path ? `${path}.${propertyKey}` : `${propertyKey}`;
                if (value && typeof value === 'object') {
                    return this.createProxy(value, newPath);
                }
                return value;
            },
            set: (target, property, value, receiver) => {
                const propertyKey = this.getPropertyKey(property);
                const newPath = path ? `${path}.${propertyKey}` : `${propertyKey}`;

                const resolvedValue = this.resolveProxyValue(value);

                Reflect.set(target, property, resolvedValue, receiver);
                this.updateKeyValue(newPath, resolvedValue);
                return true;
            },
        });

        this.proxyMap.set(obj, proxy);
        return proxy;
    }

    private resolveProxyValue(value: unknown): unknown {
        if (this.proxyMap.has(value as object)) {
            // If the value is a proxy, get the original value
            return this.proxyMap.get(value as object);
        } else if (value && typeof value === 'object') {
            // If the value is an object, recursively check the properties
            return Object.fromEntries(
                Object.entries(value).map(([key, val]) => [key, this.resolveProxyValue(val)])
            );
        }
        // Return only non-proxy values
        return value;
    }

    /**
     * Returns the value of the given property key.
     * @param property The property key to get the value for.
     * @returns The value of the given property key.
     */
    private getPropertyKey(property: string | symbol): string {
        return typeof property === 'symbol' ? property.toString() : property;
    }

    /**
     * Updates the `yamlKeyMap` with the given value.
     * @param yamlKeyMap The new `yamlKeyMap` to set.
     */
    private initYamlKeyMap(yamlKeyMap: YamlKeyMap | undefined) {
        if (yamlKeyMap) {
            this.yamlKeyMap = yamlKeyMap;
        }
    }

    /**
     * Gets the metadata of the file if a file is set.
     * @returns The metadata of the file or `null` if no fileor metadata is found.
     */
    private getMetadata(): Record<string, unknown> | null {
        if (!this._file) return null;
        const cachedMetadata = this.metadataCache.getEntry(this._file);

        if (cachedMetadata && cachedMetadata.metadata && cachedMetadata.metadata.frontmatter) {
            return cachedMetadata.metadata.frontmatter as Record<string, unknown>;
        } else {
            this.logger.error(`No Metadata found for ${this._file.path}`);
            return null;
        }
    }

    /**
     * Recursively updates the frontmatter object with the given updates.
     * @param frontmatter The frontmatter object to update. Normally transferred from the `processFrontMatter` function.
     * @see {@link FileManager.processFrontMatter}
     * @param updates A partial object containing the updates.
     * @remarks - `null` clears the value of the key.
     * - `undefined` leaves the value of the key unchanged.
     */
    private updateNestedFrontmatterObjects(frontmatter: Record<string, unknown>, updates: object) {
        Object.entries(updates).forEach(([key, value]) => {
            if (this.yamlKeyMap && this.yamlKeyMap[key]) {
                key = this.yamlKeyMap[key];
            }
            if (typeof value === 'object' && value !== undefined && value !== null && frontmatter[key]) {
                this.updateNestedFrontmatterObjects(frontmatter[key] as Record<string, unknown>, value);
            } else if (value !== undefined) {
                frontmatter[key] = value;
            }
        });
    }
}