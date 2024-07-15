import { App } from 'obsidian';
import Prj from 'src/main';
import { PrjSettings } from 'src/types/PrjSettings';
import { Logging, LoggingLevel } from './Logging';
import FileCache from '../libs/FileCache';
import MetadataCache from '../libs/MetadataCache';

/**
 * Represents the global instance for the plugin.
 */
export default class Global {
    static instance: Global;
    plugin: Prj;
    app: App;
    /**
     * @deprecated This property is deprecated and will be removed in a future version.
     */
    fileCache: FileCache;
    metadataCache: MetadataCache;
    settings: PrjSettings;
    private _logger = Logging.getLogger('Global');

    /**
     * Creates a new instance of the Global class.
     * @param prj - The Prj instance.
     * @param app - The Obsidian App instance.
     * @param settings - The plugin settings.
     */
    constructor(prj: Prj, app: App, settings: PrjSettings) {
        if (Global.instance) {
            return Global.instance;
        }
        this.plugin = prj;

        // Obsidian App
        this.app = app;

        // Settings
        this.settings = settings;

        new Logging(this.settings.logLevel as LoggingLevel, 'Prj');

        // Singleton; before creating the cache instances, because they need the app instance
        Global.instance = this;

        // File cache
        this.fileCache = FileCache.getInstance();

        // Metadata cache
        this.metadataCache = MetadataCache.getInstance();
    }

    /**
     * Waits for the cache to be initialized.
     */
    public async awaitCacheInitialization() {
        this._logger.debug('Waiting for cache initialization');
        await this.fileCache.waitForCacheReady();
        await this.metadataCache.waitForCacheReady();
        this._logger.debug('Cache initialized');
    }

    /**
     * Cleans up resources used by the Global instance.
     */
    public static deconstructor() {
        FileCache.deconstructor();
        MetadataCache.deconstructor();
    }

    /**
     * Gets the global instance of the Global class.
     * If the instance doesn't exist, it creates a new one.
     * @param prj - The Prj instance.
     * @param app - The Obsidian App instance.
     * @param settings - The plugin settings.
     * @returns The global instance of the Global class.
     * @throws Error if the global instance is not initialized and no app is provided.
     */
    static getInstance(
        prj: Prj | null = null,
        app: App | null = null,
        settings: PrjSettings | null = null,
    ): Global {
        if (!Global.instance) {
            if (!prj || !app || !settings) {
                throw new Error(
                    'Global instance not initialized and no app provided',
                );
            }
            Global.instance = new Global(prj, app, settings);
        }

        return Global.instance;
    }
}
