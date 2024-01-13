import { TFile } from "obsidian";
import Global from "../classes/Global";
import { TransactionModel } from "./TransactionModel";
import { YamlKeyMap } from "../types/YamlKeyMap";
import Logging from "src/classes/Logging";

export class BaseModel<T extends object> extends TransactionModel<T> {
    protected global = Global.getInstance();
    protected app = Global.getInstance().app;
    protected logger: Logging = Global.getInstance().logger;
    private _file: TFile | undefined;
    public get file(): TFile {
        if (this._file === undefined) {
            this.logger.warn("File not set");
        }
        return this._file as TFile;
    }
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
    private ctor: new (data?: Partial<T>) => T;
    private dataProxy: T;
    /**
     * The proxy map to use.
     * @see {@link BaseModel.createProxy}
     */
    private proxyMap: WeakMap<object, unknown> = new WeakMap();
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

    protected set _data(values: Partial<T>) {
        const dataObject: T = new this.ctor(values);
        for (const key in dataObject) {
            this._data[key] = values[key];
        }
    }

    private get frontmatter(): Record<string, unknown> {
        return this.getMetadata() ?? {};
    }

    private set frontmatter(value: Record<string, unknown>) {
        (async () => {
            await this.setFrontmatter(value);
        })();
    }

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

    /**
     * Creates a proxy for the given object.
     * @param obj The object to create a proxy for.
     * @param path The path of the object. e.g. `data.title`
     * @returns The proxy object.
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

    private getPropertyKey(property: string | symbol): string {
        return typeof property === 'symbol' ? property.toString() : property;
    }

    private getMetadata(): Record<string, unknown> | null {
        if (!this._file) return null;
        const cachedMetadata = this.app?.metadataCache?.getCache(this._file.path);

        if (cachedMetadata && cachedMetadata.frontmatter) {
            return cachedMetadata.frontmatter as Record<string, unknown>;
        } else {
            this.logger.error(`No Metadata found for ${this._file.path}`);
            return null;
        }
    }

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