import { TFile } from "obsidian";
import Global from "../classes/global";
import { TransactionModel } from "./TransactionModel";
import { YamlKeyMap } from "../types/YamlKeyMap";

export class BaseModel<T extends object> extends TransactionModel<T> {
    protected app = Global.getInstance().app;
    private _file: TFile;
    public get file(): TFile {
        return this._file;
    }
    private ctor: new (data?: Partial<T>) => T;
    private dataProxy: T;
    private yamlKeyMap: YamlKeyMap | undefined;

    protected get _data(): Partial<T> {
        if (this.dataProxy) {
            return this.dataProxy;
        }
        const frontmatter = this.getMetadata();
        if (!frontmatter) {
            console.error('Frontmatter not found');
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

        this.initProxy(frontmatter as Partial<T>);

        return this.dataProxy;
    }

    protected set _data(values: Partial<T>) {
        const dataObject: T = new this.ctor(values);
        for (const key in dataObject) {
            this._data[key] = values[key];
        }
    }

    private initYamlKeyMap(yamlKeyMap: YamlKeyMap | undefined) {
        if (yamlKeyMap) {
            this.yamlKeyMap = yamlKeyMap;
        }
    }

    private initProxy(values?: Partial<T>) {
        const dataObject: T = new this.ctor(values);
        this.dataProxy = new Proxy(dataObject, {
            get: (target, property) => {
                return target[property as keyof T];
            },
            set: (target, property, value) => {
                target[property as keyof T] = value;
                this.updateKeyValue(property as string, value)
                return true;
            },
            deleteProperty: (target, property) => {
                delete target[property as keyof T];
                this.updateKeyValue(property as string, null)
                return true;
            }
        });
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
                console.info(`Frontmatter for file ${this._file.path} successfully updated.`);
            } catch (error) {
                console.error(`Error updating the frontmatter for file ${this._file.path}:`, error);
            }
        })();
    }

    constructor(file: TFile, ctor: new (data?: Partial<T>) => T, yamlKeyMap: YamlKeyMap | undefined) {
        super((update) => {
            this.frontmatter = update as Record<string, unknown>;
        });
        this._file = file;
        this.ctor = ctor;
        this.initYamlKeyMap(yamlKeyMap);
    }

    private getMetadata(): Record<string, unknown> | null {
        const cachedMetadata = this.app?.metadataCache?.getCache(this._file.path);

        if (cachedMetadata && cachedMetadata.frontmatter) {
            return cachedMetadata.frontmatter as Record<string, unknown>;
        } else {
            console.warn(`No Metadata found for ${this._file.path}`);
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