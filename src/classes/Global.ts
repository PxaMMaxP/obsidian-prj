import { App } from 'obsidian';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import { DIContainer } from 'src/libs/DependencyInjection/DIContainer';
import Prj from 'src/main';
import type { IPrjSettings } from 'src/types/PrjSettings';
import MetadataCache from '../libs/MetadataCache';

/**
 * Represents the global instance for the plugin.
 * @todo Mark as deprecated.
 */
@Register('Global', true)
export default class Global {
    static instance: Global;

    @Inject('Prj')
    plugin: Prj;

    @Inject('App')
    app: App;

    @Inject('IMetadataCache')
    metadataCache: IMetadataCache;

    @Inject('IPrjSettings')
    settings: IPrjSettings;

    @Inject(
        'ILogger_',
        (x: ILogger_) =>
            new x(
                DIContainer.getInstance().resolve<IPrjSettings>(
                    'IPrjSettings',
                    false,
                )?.logLevel,
                'Prj',
            ),
        false,
    )
    private readonly _logger?: ILogger;

    /**
     * Creates a singleton instance of the Global class.
     */
    constructor() {
        if (Global.instance) {
            return Global.instance;
        }
        // Singleton; before creating the cache instances, because they need the app instance
        Global.instance = this;
    }

    /**
     * Waits for the cache to be initialized.
     */
    public async awaitCacheInitialization(): Promise<void> {
        this._logger?.debug('Waiting for cache initialization');
        await this.metadataCache.waitForCacheReady();
        this._logger?.debug('Cache initialized');
    }

    /**
     * Cleans up resources used by the Global instance.
     */
    public static deconstructor(): void {
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
        prj?: Prj | null,
        app?: App | null,
        settings?: IPrjSettings | null,
    ): Global {
        if (!Global.instance) {
            Global.instance = new Global();
        }

        return Global.instance;
    }
}
