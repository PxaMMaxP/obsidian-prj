// Note: FileCacheLib class

import { DvAPIInterface } from "obsidian-dataview/lib/typings/api";
import Global from "../global";
import { App, TFile } from "obsidian";

export default class FileCacheLib {
    dv: DvAPIInterface = Global.getInstance().dv;
    app: App = Global.getInstance().app;
    fileCachePromise: Promise<void> | null = null;
    fileCache: Map<string, TFile> | null = null;
    eventsRegistered = false;

    static instance: FileCacheLib;

    /**
     * Returns the FileCacheLib instance
     * @returns The FileCacheLib instance
     */
    static getInstance() {
        if (!FileCacheLib.instance) {
            FileCacheLib.instance = new FileCacheLib();
        }
        return FileCacheLib.instance;
    }

    constructor() {
        if (!this.fileCache) {
            this.buildFileCache().then(() => {
                console.log("File Cache built");
            });
        }

        this.registerEvents();
    }

    /**
     * Deconstructs the FileCacheLib instance
     */
    deconstructor() {
        this.app.vault.off('rename', this.eventHandler);

        this.app.vault.off('delete', this.eventHandler);

        this.app.vault.off('create', this.eventHandler);

        this.eventsRegistered = false;
    }

    private async buildFileCache() {
        const allFiles = this.app.vault.getFiles();
        const fileMap = new Map();

        for (const file of allFiles) {
            fileMap.set(file.name, file);
        }

        this.fileCache = fileMap;
    }

    private invalidateCache() {
        this.fileCache = null;
        this.fileCachePromise = null;
    }

    private eventHandler() {
        this.fileCachePromise = this.buildFileCache();
    }

    private registerEvents() {
        if (!this.eventsRegistered) {
            this.app.vault.on('rename', this.eventHandler);

            this.app.vault.on('delete', this.eventHandler);

            this.app.vault.on('create', this.eventHandler);

            this.eventsRegistered = true;
        }
    }

    private async getFileCache() {
        if (this.fileCachePromise === null) {
            this.fileCachePromise = this.buildFileCache();
        }
        if (!this.fileCache) {
            await this.fileCachePromise;
        }
    }

    async findFileByName(fileName: string) {
        await this.getFileCache();

        return this.fileCache?.get(fileName);
    }

}