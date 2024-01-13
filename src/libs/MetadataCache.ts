// Note: MetadataCache class

import Logging from "src/classes/Logging";
import Global from "../classes/Global";
import { App, CachedMetadata, TFile } from "obsidian";

/**
 * FileMetadata interface
 * @description This interface is used to store the file and the cached metadata in the metadata cache.
 * @property {TFile} file The file object
 * @property {CachedMetadata} metadata The cached metadata
 */
export class FileMetadata { file: TFile; metadata: CachedMetadata }

/**
 * Singleton class for caching metadata
 * @description This class is used to cache metadata for all files in the vault. It is used to speed up processing of dataview queries.
 */
export default class MetadataCache {
    private app: App = Global.getInstance().app;
    private logger: Logging = Global.getInstance().logger;
    private metadataCachePromise: Promise<void> | null = null;
    private metadataCache: Map<string, FileMetadata> | null = null;
    private metadataCacheReady = false;
    private eventsRegistered = false;

    static instance: MetadataCache;

    /**
     * Get the metadata cache
     * @returns {FileMetadata[]} Array of FileMetadata objects
     * @description This method returns the metadata cache as an array of FileMetadata objects. The FileMetadata object contains the file and the cached metadata.
     */
    public get Cache(): FileMetadata[] {
        if (this.metadataCacheReady && this.metadataCache) {
            return Array.from(this.metadataCache.values());
        } else {
            this.logger.error("Metadata cache not initialized");
            return [];
        }
    }

    /**
     * Get the singleton instance of the MetadataCache class
     * @returns {MetadataCache} The MetadataCache instance
     */
    static getInstance() {
        if (!MetadataCache.instance) {
            MetadataCache.instance = new MetadataCache();
        }
        return MetadataCache.instance;
    }

    /**
     * Constructor for the MetadataCache class
     * @description This constructor is private because the MetadataCache class is a singleton. Use the getInstance() method to get the singleton instance.
     */
    constructor() {
        this.changedEventHandler = this.changedEventHandler.bind(this);
        this.renameEventHandler = this.renameEventHandler.bind(this);
        this.deleteEventHandler = this.deleteEventHandler.bind(this);

        if (!this.metadataCache) {
            this.buildMetadataCache().then(() => {
                this.logger.debug("Metadata cache built");
                this.registerEvents();
            });
        }
    }

    /**
     * Deconstructor for the MetadataCache class
     * @description This method is used to unregister the event handlers for the metadata cache.
     */
    static deconstructor() {
        if (!MetadataCache.instance) {
            Global.getInstance().logger.error("Metadata cache instance not loaded");
            return;
        }

        const instance = MetadataCache.instance;

        if (instance.eventsRegistered) {
            instance.app.vault.off('rename', instance.renameEventHandler);
            instance.app.metadataCache.off('changed', instance.changedEventHandler);
            instance.app.metadataCache.off('deleted', instance.deleteEventHandler);

            instance.eventsRegistered = false;

            Global.getInstance().logger.debug("Metadata cache events unregistered");
            return;
        }

        Global.getInstance().logger.debug("Metadata cache events not registered");
    }

    /**
     * Check if the metadata cache is ready
     * @returns {boolean} True if the metadata cache is ready, false otherwise
     */
    public isCacheReady() {
        return this.metadataCacheReady;
    }

    /**
     * Wait for the metadata cache to be ready
     * @returns {Promise<void>} Promise that resolves when the metadata cache is ready
     * @description This method returns a promise that resolves when the metadata cache is ready.
     */
    public async waitForCacheReady(): Promise<void> {
        while (!this.metadataCacheReady) {
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    }

    /**
     * Build the metadata cache
     * @returns {Promise<void>} Promise that resolves when the metadata cache is built
     */
    private async buildMetadataCache() {
        const startTime = Date.now();

        this.metadataCache = new Map<string, FileMetadata>();
        const allFiles = this.app.vault.getFiles();

        const addEntryPromises = allFiles.map(file => this.addEntry(file));

        await Promise.all(addEntryPromises);

        this.metadataCacheReady = true;

        const endTime = Date.now();
        this.logger.debug(`Metadata cache for ${allFiles.length} files built in ${endTime - startTime}ms`);
    }

    /**
     * Get the metadata cache entry for a file.
     * @param file The file to get from the metadata cache.
     * @returns {FileMetadata | undefined} The metadata cache entry for the file.
     * @remarks - This method returns undefined if the metadata cache is not ready.
     * - As key the file path is used!
     */
    public getEntry(file: TFile): FileMetadata | undefined {
        if (this.metadataCache) {
            const metadata = this.metadataCache.get(file.path);
            if (metadata) {
                return metadata;
            } else {
                this.logger.warn(`No metadata cache entry found for file ${file.path}`);
                return undefined;
            }
        } else {
            this.logger.error("Metadata cache not initialized");
            return undefined;
        }
    }

    /**
     * Add a file to the metadata cache
     * @param file The file to add to the metadata cache
     */
    private async addEntry(file: TFile) {
        if (this.metadataCache) {
            const metadata = this.app.metadataCache.getFileCache(file);
            if (metadata) {
                this.metadataCache.set(file.path, { file, metadata });
            } else {
                this.logger.warn(`No metadata found for file ${file.path}`);
            }
        } else {
            this.logger.error("Metadata cache not initialized");
        }
    }

    /**
     * Delete a file from the metadata cache
     * @param file The file to delete from the metadata cache
     */
    private deleteEntry(file: TFile) {
        if (this.metadataCache) {
            this.metadataCache.delete(file.path);
        } else {
            this.logger.error("Metadata cache not initialized");
        }
        this.logger.debug(`Metadata cache entry for file ${file.path} deleted`);
    }

    /**
     * Update a file in the metadata cache
     * @param file The file to update in the metadata cache
     */
    private async updateEntry(file: TFile, cache: CachedMetadata) {
        if (this.metadataCache) {
            const entry = this.metadataCache.get(file.path);
            if (entry && cache) {
                entry.metadata = cache;
            } else if (!entry) {
                this.logger.warn(`No metadata cache entry found for file ${file.path}`);
            } else {
                this.logger.warn(`No metadata found for file ${file.path}`);
            }
        } else {
            this.logger.error("Metadata cache not initialized");
        }
        this.logger.debug(`Metadata cache entry for file ${file.path} updated`);
    }

    /**
     * Rename a file in the metadata cache
     * @param newFile The new file object
     * @param oldPath The old path of the file
     */
    private async renameEntry(newFile: TFile, oldPath: string) {
        if (this.metadataCache) {
            const entry = this.metadataCache.get(oldPath);
            if (entry) {
                entry.file = newFile;
            } else {
                this.logger.warn(`No metadata cache entry found for file ${oldPath}`);
            }
        } else {
            this.logger.error("Metadata cache not initialized");
        }
        this.logger.debug(`Metadata cache entry for file ${oldPath} renamed to ${newFile.path}`);
    }

    /**
     * Event handler for the rename event
     * @param file New file object
     * @param oldPath Old path of the file
     */
    private renameEventHandler(file: TFile, oldPath: string) {
        this.logger.debug(`File ${file.path} renamed to ${oldPath}`);
        this.renameEntry(file, oldPath);
    }

    /**
     * Event handler for the delete event
     * @param file Deleted file object
     */
    private deleteEventHandler(file: TFile) {
        this.logger.debug(`File ${file.path} deleted`);
        this.deleteEntry(file);
    }

    /**
     * Event handler for the changed event
     * @param file Changed file object
* @param data Changed complete file content
     * @param cache Cached metadata
     */
    private changedEventHandler(file: TFile, data: string, cache: CachedMetadata) {
        this.logger.trace(`File ${file.path} changed. Data-content:`, { data }, "Cache-metadata:", cache);
        if (this.metadataCache) {
            const existingEntry = this.metadataCache.get(file.path);
            if (existingEntry) {
                this.updateEntry(file, cache);
            } else {
                this.addEntry(file);
            }
        }
    }

    private redrawMarkdownView() {
        this.logger.debug(`Redrawing markdown view`);
        this.app.workspace.updateOptions();
    }

    /**
     * Register event handlers for the metadata cache
     */
    private registerEvents() {
        if (!this.eventsRegistered) {

            this.app.vault.on('rename', this.renameEventHandler);
            this.app.metadataCache.on('changed', this.changedEventHandler);
            this.app.metadataCache.on('deleted', this.deleteEventHandler);

            this.eventsRegistered = true;

            this.logger.debug("Metadata cache events registered");
        }
    }

}