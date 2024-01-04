import { PrjSettings } from 'src/types/PrjSettings';
import { App } from "obsidian";
import FileCache from "../libs/FileCache";
import MetadataCache from "../libs/MetadataCache";

export default class Global {
    static instance: Global;
    app: App;
    fileCache: FileCache;
    metadataCache: MetadataCache;
    settings: PrjSettings;

    constructor(app: App, settings: PrjSettings) {
        // Obsidian App
        if (Global.instance) {
            return Global.instance;
        }
        this.app = app;
        this.settings = settings;

        // Singleton; before creating the cache instances, because they need the app instance
        Global.instance = this;

        // File cache
        this.fileCache = FileCache.getInstance();

        // Metadata cache
        this.metadataCache = MetadataCache.getInstance();

    }

    public async awaitCacheInitialization() {
        await this.fileCache.waitForCacheReady();
        await this.metadataCache.waitForCacheReady();
    }

    public static deconstructor() {
        FileCache.deconstructor();
        MetadataCache.deconstructor();
    }

    static getInstance(app: App | null = null, settings: PrjSettings | null = null): Global {
        if (!Global.instance) {
            if (!app || !settings) {
                throw new Error("Global instance not initialized and no app provided");
            }
            Global.instance = new Global(app, settings);
        }
        return Global.instance;
    }
}