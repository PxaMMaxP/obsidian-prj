import { App, Menu, TAbstractFile } from 'obsidian';
import DependencyRegistry from 'src/classes/DependencyRegistry';
import { ILogger } from 'src/interfaces/ILogger';
import IMetadataCache from 'src/interfaces/IMetadataCache';
import Prj from 'src/main';

/**
 * Represents a interface for the {@link ContextMenu|context menu} dependencies.
 */
export interface IContextMenuDependencies {
    logger?: ILogger;
    app: App;
    plugin: Prj;
    metadataCache: IMetadataCache;
}

/**
 * Represents a interface for the {@link ContextMenu|context menu} constructor.
 */
export interface IContextMenuConstructor {
    new (dependencies: IContextMenuDependencies): ContextMenu;
}

/**
 * Represents a class for creating a context menu.
 */
export default abstract class ContextMenu {
    protected static _instance: ContextMenu;
    protected _logger: ILogger | undefined;
    protected _app: App;
    protected _plugin: Prj;
    protected _metadataCache: IMetadataCache;
    protected _eventsAndCommandsRegistered = false;
    protected _bindContextMenu = this.onContextMenu.bind(this);

    /**
     * Creates a new instance of the ContextMenu class.
     * @param dependencies The dependencies for the class.
     */
    private constructor(dependencies: IContextMenuDependencies) {
        dependencies = DependencyRegistry.isDependencyProvided(
            'IContextMenuDependencies',
            dependencies,
        );

        this._logger = dependencies.logger;
        this._app = dependencies.app;
        this._plugin = dependencies.plugin;
        this._metadataCache = dependencies.metadataCache;

        this.registerEventsAndCommands();
    }

    /**
     * Get the singleton instance of the ContextMenu class.
     * @param dependencies The optional dependencies for the class.
     * @returns The singleton instance.
     */
    public static getInstance(
        dependencies?: IContextMenuDependencies,
    ): ContextMenu {
        if (!ContextMenu._instance) {
            ContextMenu._instance =
                new (this as unknown as IContextMenuConstructor)(
                    dependencies as IContextMenuDependencies,
                );
        }

        return ContextMenu._instance;
    }

    /**
     * Deconstructs the 'ContextMenu' events and commands.
     */
    public static deconstructor() {
        if (this._instance && this._instance._eventsAndCommandsRegistered) {
            ContextMenu.deRegisterEventsAndCommands();
        } else {
            this._instance?._logger?.trace(
                `No '${this._instance?.constructor.name}' events to deconstruct`,
            );
        }
    }

    /**
     * Registers the events and commands for the class.
     * @remarks This method calls the onConstructon method.
     */
    private registerEventsAndCommands() {
        try {
            this.onConstruction();
            this._eventsAndCommandsRegistered = false;
            this._logger?.trace(`Constructed '${this.constructor.name}'`);
        } catch (error) {
            this._logger?.error(
                `Error constructing '${this.constructor.name}'`,
                error,
            );
        }
    }

    /**
     * Deregesters the events and commands for the class.
     * @remarks This method calls the onDeconstructon method.
     */
    private static deRegisterEventsAndCommands() {
        try {
            this._instance.onDeconstruction();
            this._instance._eventsAndCommandsRegistered = false;
        } catch (error) {
            this._instance._logger?.error(
                `Error deconstructing '${this._instance.constructor.name}' events`,
                error,
            );

            throw error;
        }
    }

    /**
     * This method is called when the class is constructed.
     * @remarks - This method should be overridden by the derived class.
     * - You should register events and commands in this method.
     * @example
     * ```typescript
     * this._app.workspace.on('file-menu', this.bindContextMenu);
     * this._plugin.addCommand({
     *       id: 'get-metadata-file',
     *       name: 'Show Metadata File',
     *       callback: () => {
     *           ContextMenu.getInstance().invoke();
     *       },
     *   });
     * ```
     */
    protected abstract onConstruction(): void;

    /**
     * This method is called when the class is deconstructed.
     * @remarks This method should be overridden by the derived class.
     * - You should deregister events and if necessary commands in this method.
     * @example
     * ```typescript
     * this._instance._app.workspace.off(
     *           'file-menu',
     *           this._instance.bindContextMenu,
     *       );
     * ```
     */
    protected abstract onDeconstruction(): void;

    /**
     * This method is called when the context menu is invoked.
     * @param menu The context menu to add items to.
     * @param file The file the context menu is invoked on.
     */
    protected abstract onContextMenu(menu: Menu, file: TAbstractFile): void;

    /**
     * This method is called when the command menu is invoked.
     */
    public abstract invoke(): Promise<void>;
}
