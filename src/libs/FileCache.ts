// Note: FileCache class

import Logging from "src/classes/Logging";
import Global from "../classes/Global";
import { App, TAbstractFile, TFile } from "obsidian";

/**
 * FileCache class
 * @description Caches the files in the vault with file name as the key
 */
export default class FileCache {
    private app: App = Global.getInstance().app;
    private logger = Logging.getLogger("FileCache");
    private fileCachePromise: Promise<void> | null = null;
    private fileCache: Map<string, TFile | null> | null = null;
    private duplicateNames: Map<string, Array<TFile>> | null = null;
    private fileCacheReady = false;
    private eventsRegistered = false;

    static instance: FileCache;

    /**
     * Returns the FileCache instance if it exists, otherwise creates a new instance
     * @returns The FileCache instance
     */
    static getInstance() {
        if (!FileCache.instance) {
            FileCache.instance = new FileCache();
        }
        return FileCache.instance;
    }

    /**
     * Creates a new FileCache instance
     * @constructor
     * @remarks Events are disabled: We do not need them for now
     */
    constructor() {
        if (!this.fileCache) {
            this.buildFileCache().then(() => {
                this.logger.debug("File Cache built");
            });
        }
        this.createEventHandler = this.createEventHandler.bind(this);
        this.renameEventHandler = this.renameEventHandler.bind(this);
        this.deleteEventHandler = this.deleteEventHandler.bind(this);
        //this.registerEvents();
    }

    /**
     * Deconstructs the FileCache instance
     * unregisters all events
     */
    static deconstructor() {
        if (!FileCache.instance) {
            Global.getInstance().logger.error("FileCache instance not loaded");
            return;
        }

        const instance = FileCache.instance;

        if (instance.eventsRegistered) {
            instance.app.vault.off('rename', instance.renameEventHandler);
            instance.app.vault.off('delete', instance.deleteEventHandler);
            instance.app.vault.off('create', instance.createEventHandler);

            instance.eventsRegistered = false;

            Global.getInstance().logger.debug("File cache events unregistered");
            return;
        }

        Global.getInstance().logger.debug("File cache events not registered");
    }

    /**
     * @deprecated Use `app.vault.getFiles()` instead
     */
    public get Cache(): TFile[] {
        return this.app.vault.getFiles();
    }

    /**
     * Wait for the file cache to be ready
     * @returns {Promise<void>} Promise that resolves when the file cache is ready
     * @description This method returns a promise that resolves when the file cache is ready.
     */
    public async waitForCacheReady(): Promise<void> {
        while (!this.fileCacheReady) {
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    }

    /**
     * Builds the file cache
     * @returns Promise that resolves when the file cache is built
     * @private
     */
    private async buildFileCache() {
        const startTime = Date.now();
        const allFiles = this.app.vault.getFiles();
        this.fileCache = new Map<string, TFile | null>();
        this.duplicateNames = new Map<string, Array<TFile>>();

        for (const file of allFiles) {
            this.addEntry(file);
        }

        this.fileCacheReady = true;

        const endTime = Date.now();
        this.logger.debug(`File cache for ${allFiles.length} files built in ${endTime - startTime}ms`);
    }

    /**
     * Updates the file cache with the new file
     * @param file The file to add to the cache
     * @returns True if the file was added to the cache, false otherwise
     * @private
     */
    private addEntry(file: TFile) {
        if (!this.fileCache) { this.logger.error("File cache not available"); return false; }
        let state = true;
        const existingFile = this.fileCache.get(file.name);
        if (existingFile === undefined) {
            this.fileCache.set(file.name, file);
        } else if (existingFile === null) {
            state &&= this.addDuplicateEntry([file]);
        } else {
            state &&= this.addDuplicateEntry([existingFile, file]);
            this.fileCache.set(file.name, null);
        }

        return state;
    }

    /**
     * Updates the duplicate cache with the new file
     * @param file The files to add to the cache
     * @returns True if the file was added to the cache, false otherwise
     * @private
     */
    private addDuplicateEntry(file: Array<TFile>) {
        const fileName = file.first()?.name;
        if (!fileName) { this.logger.error("File name not available"); return false; }
        if (!this.duplicateNames) { this.logger.error("Duplicate cache not available"); return false; }
        const duplicateEntry = this.duplicateNames.get(fileName);
        if (duplicateEntry) {
            file.forEach(f => duplicateEntry.push(f));
        } else {
            this.duplicateNames.set(fileName, file);
        }
        return true;
    }

    /**
     * Removes the file from the duplicate cache
     * @param file The file to remove from the cache
     * @param oldPath The old path of the file
     * @returns True if the file was removed from the cache, false otherwise
     * @private
     */
    private removeDuplicateEntry(file: TFile, oldPath: string | null = null) {
        if (!this.duplicateNames) { this.logger.error("Duplicate cache not available"); return false; }
        const duplicateEntry = this.duplicateNames.get(file.name);
        if (!duplicateEntry) { this.logger.error("File ${file.name} not found in duplicate cache"); return false; }
        const path = oldPath ?? file.path;
        const index = duplicateEntry.findIndex(f => f.path === path);
        if (index > -1) {
            duplicateEntry.splice(index, 1);
        } else {
            this.logger.error(`File ${file.name} not found in duplicate cache`);
            return false;
        }
        return true;
    }

    /**
     * Removes the file from the file cache
     * @param file The file to remove from the cache
     * @returns True if the file was removed from the cache, false otherwise
     * @private
     */
    private removeEntry(file: TFile) {
        if (!this.fileCache) { this.logger.error("File cache not available"); return false; }
        let state = true;
        const existingFile = this.fileCache.get(file.name);
        if (existingFile) {
            this.fileCache.delete(file.name);
        } else if (existingFile === undefined) {
            this.logger.warn(`File ${file.name} not found in cache`);
            return false;
        } else if (existingFile === null) {
            state &&= this.removeDuplicateEntry(file);
        }
        return state;
    }

    /**
     * Renames the file in the file cache
     * @param file The file to rename
     * @param oldPath The old path of the file
     * @returns True if the file was renamed in the cache, false otherwise
     * @private
     */
    private renameEntry(file: TFile, oldPath: string) {
        if (!this.fileCache) { this.logger.error("File cache not available"); return false; }
        const oldFileName = this.getFileNameFromPath(oldPath);
        if (!oldFileName) { this.logger.error("Old file name not available"); return false; }
        const existingFile = this.fileCache.get(oldFileName);
        let state = true;
        if (existingFile) {
            this.fileCache.delete(oldFileName);
            state &&= this.addEntry(file);
        } else if (existingFile === undefined) {
            this.logger.warn(`File ${oldFileName} not found in cache`);
            state &&= this.addEntry(file);
        } else if (existingFile === null) {
            state &&= this.removeDuplicateEntry(file, oldPath);
            state &&= this.addDuplicateEntry([file]);
        }
        return state;
    }

    /**
     * Event handler for the create event
     * @param file The file to create in the file cache
     * @private
     */
    private createEventHandler(file: TAbstractFile) {
        let state = true;
        if (file instanceof TFile) {
            state &&= this.addEntry(file);
        }
        if (state) {
            this.logger.debug(`File ${file.name} create in file cache event handler success`);
        } else {
            this.logger.error(`Error creating file ${file.name} in file cache event handler`);
        }
    }

    /**
     * Event handler for the rename event
     * @param file The file to rename in the file cache
     * @param oldPath The old path of the file
     * @private
     */
    private renameEventHandler(file: TAbstractFile, oldPath: string) {
        let state = true;
        if (file instanceof TFile) {
            const oldFileName = oldPath.split('/').last();
            if (!oldFileName) { this.logger.error("Cannot extract old file name from the path"); return; }
            state &&= this.renameEntry(file, oldFileName);
        }
        if (state) {
            this.logger.debug(`File ${file.name} renamed in file cache event handler success`);
        } else {
            this.logger.error(`Error renaming file ${file.name} in file cache event handler`);
        }
    }

    /**
     * Event handler for the delete event
     * @param file The file to delete in the file cache
     * @private
     */
    private deleteEventHandler(file: TAbstractFile) {
        let state = true;
        if (file instanceof TFile) {
            state &&= this.removeEntry(file);
        }
        if (state) {
            this.logger.debug(`File ${file.name} delete in file cache event handler success`);
        } else {
            this.logger.error(`Error deleting file ${file.name} in file cache event handler`);
        }
    }

    /**
     * Registers the events for the file cache
     * @private
     */
    private registerEvents() {
        if (!this.eventsRegistered) {
            this.app.vault.on('rename', this.renameEventHandler);

            this.app.vault.on('delete', this.deleteEventHandler);

            this.app.vault.on('create', this.createEventHandler);

            this.eventsRegistered = true;

            this.logger.debug("File cache events registered");
        }
    }

    /**
     * Returns the file name from the file path
     * @param filePath The file path to extract the file name from
     * @returns The file name
     * @private
     */
    private getFileNameFromPath(filePath: string) {
        const oldFileName = filePath.split('/').last();
        if (!oldFileName) { this.logger.error("Cannot extract old file name from the path"); return; }
        return oldFileName;
    }

    /**
     * Returns the file from the file cache
     * @param fileName The name of the file to find
     * @returns The file/s if found, undefined otherwise
     * @deprecated Use `findFileByLinkText` instead
     * @see {@link findFileByLinkText}
     */
    public findFileByName(fileName: string): TFile | Array<TFile> | undefined {
        const foundFile = this.fileCache?.get(fileName);
        if (foundFile) {
            return foundFile;
        } else if (foundFile === null) {
            const duplicateEntry = this.duplicateNames?.get(fileName);
            if (!duplicateEntry) { this.logger.error(`File ${fileName} not found in duplicate cache`); return undefined; }
            return duplicateEntry;
        } else {
            return undefined;
        }
    }

    /**
     * Returns the first file from the file cache or if no file found returns undefined
     * @param fileName The name of the file to find
     * @returns The file as `TFile` if found, `undefined` otherwise
     * @deprecated Use `findFileByLinkText` instead
     * @see {@link findFileByLinkText}
     */
    public findFirstFileByName(fileName: string): TFile | undefined {
        // eslint-disable-next-line deprecation/deprecation
        const foundFile = this.findFileByName(fileName);
        if (foundFile instanceof Array) {
            return foundFile.first();
        } else {
            return foundFile;
        }
    }

    /**
     * Returns the file from the file cache
     * @param filePath The path of the file to find
     * @returns The file/s if found, undefined otherwise
     * @deprecated Use `findFileByLinkText` instead
     * @see {@link findFileByLinkText}
     */
    public findFileByPath(filePath: string): TFile | Array<TFile> | undefined {
        const fileName = this.getFileNameFromPath(filePath);
        if (!fileName) { this.logger.error("File name not available"); return undefined; }
        // eslint-disable-next-line deprecation/deprecation
        return this.findFileByName(fileName);
    }

    /**
     * Returns the first file from the file cache or if no file found returns undefined.
     * @param linkText The link text of the file to find.
     * @param sourcePath The original path of the file from which the link originates.
     * @returns The file as `TFile` if found, `undefined` otherwise.
     */
    public findFileByLinkText(linkText: string, sourcePath = ""): TFile | undefined {
        return this.app.metadataCache.getFirstLinkpathDest(linkText, sourcePath) ?? undefined;
    }

}