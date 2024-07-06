import { App, TFile } from 'obsidian';
import Logging from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';
import FileManager, { Filename } from 'src/libs/FileManager';
import Helper from 'src/libs/Helper';
import MetadataCache from 'src/libs/MetadataCache';
import ProxyHandler from 'src/libs/ProxyHandler/ProxyHandler';
import { TransactionModel } from './TransactionModel';
import Global from '../classes/Global';
import { YamlKeyMap } from '../types/YamlKeyMap';

export class FileModel<T extends object> extends TransactionModel<T> {
    protected global: Global;
    protected app: App;
    protected metadataCache: MetadataCache;
    private _proxyHandler: ProxyHandler<T>;
    protected logger: ILogger;

    private _file: TFile | undefined;
    public get file(): TFile {
        if (this._file === undefined) {
            this.logger?.warn('File not set');
        }

        this.logger?.trace('File get:', this._file);

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
            this._file = value;

            this.logger?.trace('File set:', this._file);

            super.setWriteChanges((update, previousPromise) => {
                return this.setFrontmatter(
                    update as Record<string, unknown>,
                    previousPromise,
                );
            });
        } else {
            this.logger?.warn('File already set');
        }
    }
    /**
     * The constructor of the data object.
     * @remarks - This is needed to create a new instance of the data object.
     * - It is set in the constructor of this class.
     * @see {@link FileModel.constructor}
     */
    private _ctor: new (data?: Partial<T>) => T;
    /**
     * The proxy of the data object.
     * @see {@link FileModel._data}
     * @see {@link FileModel.createProxy}
     */
    private _dataProxy: T | undefined = undefined;
    /**
     * The yaml key map to use.
     * @see {@link YamlKeyMap}
     * @see {@link FileModel.initYamlKeyMap}
     */
    private _yamlKeyMap: YamlKeyMap | undefined;

    /**
     * Creates a new BaseModel instance.
     * @param file The file to create the model for.
     * @param ctor The constructor of the data object.
     * @param yamlKeyMap The yaml key map to use.
     */
    constructor(
        file: TFile | undefined,
        ctor: new (data?: Partial<T>) => T,
        yamlKeyMap: YamlKeyMap | undefined,
        logger?: ILogger,
    ) {
        super(undefined, Logging.getLogger('TransactionModel'));

        this.logger = logger ?? Logging.getLogger('FileModel');

        // Initialize the `global`, `app`, and `metadataCache` properties.
        this.global = Global.getInstance();
        this.app = this.global.app;
        this.metadataCache = this.global.metadataCache;

        this._proxyHandler = new ProxyHandler(this.logger, this.updateKeyValue);

        if (file) {
            // Set the file and indirectly the `writeChanges` function.
            this.file = file;
        }
        this._ctor = ctor;
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
        if (this._dataProxy) {
            return this._dataProxy;
        }
        const frontmatter = this.getMetadata();

        if (!frontmatter) {
            this.logger?.trace('Creating empty object');
            const emptyObject = new this._ctor();
            // Save the default values to the changes object in `TransactionModel`
            // this.changes = emptyObject; // Todo: Find a way to really only assign the standard values to `changes`.
            this._dataProxy = this._proxyHandler.createProxy(emptyObject) as T;

            return this._dataProxy;
        }

        if (this._yamlKeyMap) {
            for (const key in this._yamlKeyMap) {
                if (frontmatter[this._yamlKeyMap[key]]) {
                    frontmatter[key] = frontmatter[this._yamlKeyMap[key]];
                    delete frontmatter[this._yamlKeyMap[key]];
                }
            }
        }

        const dataObject: T = new this._ctor(frontmatter as Partial<T>);
        this._dataProxy = this._proxyHandler.createProxy(dataObject) as T;

        return this._dataProxy;
    }

    /**
     * Sets the data object.
     * @param values The values to set.
     * @remarks Overwrites only the given values:
     * - If value is `undefined`, the value is not overwritten.
     * - If value is `null`, the value is cleared.
     */
    protected set _data(values: Partial<T>) {
        const keys = Object.keys(values) as Array<keyof T>;

        for (const key of keys) {
            if (values[key] !== undefined) {
                this._data[key] = values[key];
            }
        }
    }

    /**
     * Returns the frontmatter of the file if available.
     * @see {@link FileModel.getMetadata}
     */
    private get frontmatter(): Record<string, unknown> {
        return this.getMetadata() ?? {};
    }

    /**
     * Sets the frontmatter of the file.
     * @param value The new frontmatter to set.
     * @remarks - Overwrites only the given values.
     * - If the file is not set, the frontmatter is not set.
     * @see {@link FileModel.setFrontmatter}
     */
    private set frontmatter(value: Record<string, unknown>) {
        (async () => {
            await this.setFrontmatter(value);
        })();
    }

    /**
     * Updates the key value pair in the frontmatter.
     * @param value The new value to set.
     * @param previousPromise The previous promise to wait for. Implementing a self obtain Queue.
     * @remarks - Overwrites only the given values.
     * - If the file is not set, the frontmatter is not set.
     */
    private async setFrontmatter(
        value: Record<string, unknown>,
        previousPromise?: Promise<void>,
    ) {
        if (!this._file) return Promise.resolve();

        if (previousPromise) {
            await previousPromise;
        }

        this.logger?.trace(`Updating with:`, value);

        try {
            await this.app.fileManager.processFrontMatter(
                this._file,
                (frontmatter) => {
                    this.updateNestedFrontmatterObjects(frontmatter, value);
                },
            );

            this.logger?.debug(
                `Frontmatter for file ${this._file.path} successfully updated.`,
            );
        } catch (error) {
            this.logger?.error(
                `Error updating the frontmatter for file ${this._file.path}:`,
                error,
            );
        }
    }

    /**
     * Updates the `yamlKeyMap` with the given value.
     * @param yamlKeyMap The new `yamlKeyMap` to set.
     */
    private initYamlKeyMap(yamlKeyMap: YamlKeyMap | undefined) {
        if (yamlKeyMap) {
            this._yamlKeyMap = yamlKeyMap;
        }
    }

    /**
     * Gets the metadata of the file if a file is set.
     * @returns The metadata of the file or `null` if no fileor metadata is found.
     */
    private getMetadata(): Record<string, unknown> | null {
        if (!this._file) return null;
        const cachedMetadata = this.metadataCache.getEntry(this._file);

        if (
            cachedMetadata &&
            cachedMetadata.metadata &&
            cachedMetadata.metadata.frontmatter
        ) {
            // Without the deep clone, the data object in the Obsidian Metadata Cache is changed: Problems with dataview..
            const clone = Helper.deepCloneFrontMatterCache(
                cachedMetadata.metadata.frontmatter,
            );

            return clone as Record<string, unknown>;
        } else {
            this.logger?.error(`No Metadata found for ${this._file.path}`);

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
    private updateNestedFrontmatterObjects(
        frontmatter: Record<string, unknown>,
        updates: object,
    ) {
        Object.entries(updates).forEach(([key, value]) => {
            if (this._yamlKeyMap && this._yamlKeyMap[key]) {
                key = this._yamlKeyMap[key];
            }

            if (
                typeof value === 'object' &&
                value !== undefined &&
                value !== null &&
                frontmatter[key]
            ) {
                this.updateNestedFrontmatterObjects(
                    frontmatter[key] as Record<string, unknown>,
                    value,
                );
            } else if (value !== undefined) {
                frontmatter[key] = value;
            }
        });
    }

    //#region File Management
    /**
     * Renames the file of the model.
     * @param newFilename The new filename to set.
     * @returns A Promise that resolves to `true` if the file was renamed successfully, otherwise `false`.
     */
    public async renameFile(newFilename: string): Promise<boolean> {
        const filename = new Filename(newFilename, 'md');

        return FileManager.renameFile(
            this.file,
            filename,
            this.writeChangesPromise,
        );
    }

    /**
     * Moves the file of the model.
     * @param newPath The new path to move the file to.
     * @param newFilename The new filename to set.
     * @returns A Promise that resolves to `true` if the file was moved successfully, otherwise `false`.
     */
    public async moveFile(
        newPath: string,
        newFilename?: string,
    ): Promise<boolean> {
        const filename = newFilename
            ? new Filename(newFilename, 'md')
            : undefined;

        return FileManager.moveFile(
            this.file,
            newPath,
            filename,
            this.writeChangesPromise,
        );
    }

    /**
     * Creates a new file for the model.
     * @param path The path of the new file.
     * @param filename The filename of the new file.
     * @param content The content of the new file.
     * @returns The new file if successful, otherwise `undefined`.
     */
    public async createFile(
        path: string,
        filename: string,
        content?: string,
    ): Promise<TFile | undefined> {
        const newFilename = new Filename(filename, 'md');

        const file = await FileManager.createFile(path, newFilename, content);

        if (!file) return Promise.resolve(undefined);

        this.file = file;

        if (this.writeChangesPromise) {
            await this.writeChangesPromise;
        }

        return file;
    }
    //#endregion
}
