// Note: FileCacheLib class

import Global from "../global";
import { App, TAbstractFile, TFile } from "obsidian";

/**
 * FileCacheLib class
 * @description Caches the files in the vault with file name as the key
 */
export default class FileCacheLib {
    private app: App = Global.getInstance().app;
    private fileCachePromise: Promise<void> | null = null;
    private fileCache: Map<string, TFile | null> | null = null;
    private duplicateNames: Map<string, Array<TFile>> | null = null;
    private fileCacheReady = false;
    private eventsRegistered = false;

    static instance: FileCacheLib;

    /**
     * Returns the FileCacheLib instance if it exists, otherwise creates a new instance
     * @returns The FileCacheLib instance
     */
    static getInstance() {
        if (!FileCacheLib.instance) {
            FileCacheLib.instance = new FileCacheLib();
        }
        return FileCacheLib.instance;
    }

    /**
     * Creates a new FileCacheLib instance
     * @constructor
     */
    constructor() {
        if (!this.fileCache) {
            this.buildFileCache().then(() => {
                console.log("File Cache built");
            });
        }
        this.createEventHandler = this.createEventHandler.bind(this);
        this.renameEventHandler = this.renameEventHandler.bind(this);
        this.deleteEventHandler = this.deleteEventHandler.bind(this);
        this.registerEvents();
    }

    /**
     * Deconstructs the FileCacheLib instance
     * unregisters all events
     */
    static deconstructor() {
        if (!FileCacheLib.instance) {
            console.log("FileCacheLib instance not loaded");
            return;
        }

        const instance = FileCacheLib.instance;

        if (instance.eventsRegistered) {
            instance.app.vault.off('rename', instance.renameEventHandler);
            instance.app.vault.off('delete', instance.deleteEventHandler);
            instance.app.vault.off('create', instance.createEventHandler);

            instance.eventsRegistered = false;

            console.log("File cache events unregistered");
            return;
        }

        console.log("File cache events not registered");
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
        console.log(`File cache for ${allFiles.length} files built in ${endTime - startTime}ms`);
    }

    /**
     * Updates the file cache with the new file
     * @param file The file to add to the cache
     * @returns True if the file was added to the cache, false otherwise
     * @private
     */
    private addEntry(file: TFile) {
        if (!this.fileCache) { console.error("File cache not available"); return false; }
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
        if (!fileName) { console.error("File name not available"); return false; }
        if (!this.duplicateNames) { console.error("Duplicate cache not available"); return false; }
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
        if (!this.duplicateNames) { console.error("Duplicate cache not available"); return false; }
        const duplicateEntry = this.duplicateNames.get(file.name);
        if (!duplicateEntry) { console.error("File ${file.name} not found in duplicate cache"); return false; }
        const path = oldPath ?? file.path;
        const index = duplicateEntry.findIndex(f => f.path === path);
        if (index > -1) {
            duplicateEntry.splice(index, 1);
        } else {
            console.error(`File ${file.name} not found in duplicate cache`);
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
        if (!this.fileCache) { console.error("File cache not available"); return false; }
        let state = true;
        const existingFile = this.fileCache.get(file.name);
        if (existingFile) {
            this.fileCache.delete(file.name);
        } else if (existingFile === undefined) {
            console.warn(`File ${file.name} not found in cache`);
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
        if (!this.fileCache) { console.error("File cache not available"); return false; }
        const oldFileName = this.getFileNameFromPath(oldPath);
        if (!oldFileName) { console.error("Old file name not available"); return false; }
        const existingFile = this.fileCache.get(oldFileName);
        let state = true;
        if (existingFile) {
            this.fileCache.delete(oldFileName);
            state &&= this.addEntry(file);
        } else if (existingFile === undefined) {
            console.warn(`File ${oldFileName} not found in cache`);
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
            console.info(`File ${file.name} create in file cache event handler success`);
        } else {
            console.error(`Error creating file ${file.name} in file cache event handler`);
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
            if (!oldFileName) { console.error("Cannot extract old file name from the path"); return; }
            state &&= this.renameEntry(file, oldFileName);
        }
        if (state) {
            console.info(`File ${file.name} renamed in file cache event handler success`);
        } else {
            console.error(`Error renaming file ${file.name} in file cache event handler`);
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
            console.info(`File ${file.name} delete in file cache event handler success`);
        } else {
            console.error(`Error deleting file ${file.name} in file cache event handler`);
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

            console.log("File cache events registered");
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
        if (!oldFileName) { console.error("Cannot extract old file name from the path"); return; }
        return oldFileName;
    }

    /**
     * Returns the file cache
     * @returns The file cache
     * @private
     */
    private async getFileCache() {
        if (this.fileCacheReady) {
            return;
        }
        if (this.fileCachePromise === null) {
            this.fileCachePromise = this.buildFileCache();
        }
        await this.fileCachePromise;
    }

    /**
     * Returns the file from the file cache
     * @param fileName The name of the file to find
     * @returns The file/s if found, undefined otherwise
     */
    public async findFileByName(fileName: string): Promise<TFile | Array<TFile> | undefined> {
        await this.getFileCache();
        const foundFile = this.fileCache?.get(fileName);
        if (foundFile) {
            return foundFile;
        } else if (foundFile === null) {
            const duplicateEntry = this.duplicateNames?.get(fileName);
            if (!duplicateEntry) { console.error(`File ${fileName} not found in duplicate cache`); return undefined; }
            return duplicateEntry;
        } else {
            return undefined;
        }
    }

    /**
     * Returns the file from the file cache
     * @param filePath The path of the file to find
     * @returns The file/s if found, undefined otherwise
     */
    public async findFileByPath(filePath: string): Promise<TFile | Array<TFile> | undefined> {
        await this.getFileCache();
        const oldFileName = this.getFileNameFromPath(filePath);
        if (!oldFileName) { console.error("Old file name not available"); return; }
        return this.findFileByName(oldFileName);
    }

}