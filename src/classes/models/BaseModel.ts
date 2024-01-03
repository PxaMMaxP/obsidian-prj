import { TFile } from "obsidian";
import Global from "../global";
import { TransactionModel } from "./TransactionModel";

export class BaseModel<T extends object> extends TransactionModel<T> {
    private app = Global.getInstance().app;
    private _file: TFile;
    public get file(): TFile {
        return this._file;
    }
    private ctor: new (data?: Partial<T>) => T;
    private dataProxy: T;

    protected get _data(): Partial<T> {
        if (this.dataProxy) {
            return this.dataProxy;
        }
        const frontmatter = this.getMetadata();
        if (!frontmatter) {
            console.error('Frontmatter not found');
            return new this.ctor();
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

    constructor(file: TFile, ctor: new (data?: Partial<T>) => T) {
        super((update) => {
            this.frontmatter = update as Record<string, unknown>;
        });
        this._file = file;
        this.ctor = ctor;
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
            if (typeof value === 'object' && value !== undefined && value !== null && frontmatter[key]) {
                this.updateNestedFrontmatterObjects(frontmatter[key] as Record<string, unknown>, value);
            } else if (value !== undefined) {
                frontmatter[key] = value;
            }
        });
    }
}