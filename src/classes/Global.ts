import { App } from 'obsidian';
import Prj from 'src/main';
import { IPrjSettings } from 'src/types/PrjSettings';
import { Logging, LoggingLevel } from './Logging';
import MetadataCache from '../libs/MetadataCache';

/**
 * Represents the global instance for the plugin.
 */
export default class Global {
    static instance: Global;
    plugin: Prj;
    app: App;
    metadataCache: MetadataCache;
    settings: IPrjSettings;
    private _logger = Logging.getLogger('Global');

    /**
     * Creates a new instance of the Global class.
     * @param prj - The Prj instance.
     * @param app - The Obsidian App instance.
     * @param settings - The plugin settings.
     */
    constructor(prj: Prj, app: App, settings: IPrjSettings) {
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

        // Metadata cache
        this.metadataCache = MetadataCache.getInstance();
    }

    /**
     * Waits for the cache to be initialized.
     */
    public async awaitCacheInitialization() {
        this._logger.debug('Waiting for cache initialization');
        await this.metadataCache.waitForCacheReady();
        this._logger.debug('Cache initialized');
    }

    /**
     * Cleans up resources used by the Global instance.
     */
    public static deconstructor() {
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
        settings: IPrjSettings | null = null,
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
