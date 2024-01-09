import { TFile } from "obsidian";
import Global from "../classes/Global";
import { TransactionModel } from "./TransactionModel";
import { YamlKeyMap } from "../types/YamlKeyMap";
import Logging from "src/classes/Logging";

export class BaseModel<T extends object> extends TransactionModel<T> {
    protected global = Global.getInstance();
    protected app = Global.getInstance().app;
    protected logger: Logging = Global.getInstance().logger;
    private _file: TFile;
    public get file(): TFile {
        return this._file;
    }
    private ctor: new (data?: Partial<T>) => T;
    private dataProxy: T;
    private yamlKeyMap: YamlKeyMap | undefined;

    /**
     * Creates a new BaseModel instance.
     * @param file The file to create the model for.
     * @param ctor The constructor of the data object.
     * @param yamlKeyMap The yaml key map to use.
     */
    constructor(file: TFile, ctor: new (data?: Partial<T>) => T, yamlKeyMap: YamlKeyMap | undefined) {
        super((update) => {
            this.frontmatter = update as Record<string, unknown>;
        });
        this._file = file;
        this.ctor = ctor;
        this.initYamlKeyMap(yamlKeyMap);
    }

    /**
     * Returns the data object as a proxy.
     * @returns The data object as a proxy.
     */
    protected get _data(): Partial<T> {
        if (this.dataProxy) {
            return this.dataProxy;
        }
        const frontmatter = this.getMetadata();
        if (!frontmatter) {
            this.logger.error('Frontmatter not found');
            const emptyObject = new this.ctor();
            return emptyObject;
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

    public get frontmatter(): Record<string, unknown> {
        return this.getMetadata() ?? {};
    }

    public set frontmatter(value: Record<string, unknown>) {
        (async () => {
            try {
                await this.app.fileManager.processFrontMatter(this._file, (frontmatter) => {
                    this.updateNestedFrontmatterObjects(frontmatter, value);
                    return frontmatter;
                });
                this.logger.debug(`Frontmatter for file ${this._file.path} successfully updated.`);
            } catch (error) {
                this.logger.error(`Error updating the frontmatter for file ${this._file.path}:`, error);
            }
        })();
    }

    /**
     * Creates a proxy for the given object.
     * @param obj The object to create a proxy for.
     * @param path The path of the object. e.g. `data.title`
     * @returns The proxy object.
     */
    private createProxy(obj: Partial<T>, path = ""): unknown {
        return new Proxy(obj, {
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
                Reflect.set(target, property, value, receiver);
                this.updateKeyValue(newPath, value);
                return true;
            },
        });
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
        const cachedMetadata = this.app?.metadataCache?.getCache(this._file.path);

        if (cachedMetadata && cachedMetadata.frontmatter) {
            return cachedMetadata.frontmatter as Record<string, unknown>;
        } else {
            this.logger.warn(`No Metadata found for ${this._file.path}`);
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