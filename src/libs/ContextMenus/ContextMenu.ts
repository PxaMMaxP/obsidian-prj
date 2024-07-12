import { App, Menu, TAbstractFile } from 'obsidian';
import { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import Prj from 'src/main';
import { IContextMenu } from './interfaces/IContextMenu';
import { DIContainer } from '../DependencyInjection/DIContainer';
import { IDIContainer } from '../DependencyInjection/interfaces/IDIContainer';

/**
 * Represents a class for creating a context menu.
 */
export class ContextMenu implements IContextMenu {
    protected _dependencies: IDIContainer;
    protected _logger: ILogger | undefined;
    protected _app: App;
    protected _plugin: Prj;
    protected _eventsAndCommandsRegistered = false;
    protected _bindContextMenu = this.onContextMenu.bind(this);

    /**
     * Creates a new instance of the ContextMenu class.
     * @param dependencies The dependencies for the class.
     */
    protected constructor(dependencies?: IDIContainer) {
        this._dependencies = dependencies ?? DIContainer.getInstance();

        this._logger = this._dependencies
            .resolve<ILogger_>('ILogger_', false)
            ?.getLogger('ContextMenu');

        this._app = this._dependencies.resolve<App>('App');
        this._plugin = this._dependencies.resolve<Prj>('Prj');
    }

    /**
     * Run this method to signalize that the class is initialized.
     */
    protected isInitialized(): void {
        this.registerEventsAndCommands();
    }

    /**
     * Deconstructs the 'ContextMenu' events and commands.
     */
    public deconstructor() {
        if (this._eventsAndCommandsRegistered) {
            this.deRegisterEventsAndCommands();
        } else {
            this._logger?.trace(`No events to deconstruct`);
        }
    }

    /**
     * Registers the events and commands for the class.
     * @remarks This method calls the onConstructon method.
     */
    private registerEventsAndCommands() {
        try {
            this.onConstruction();
            this._eventsAndCommandsRegistered = true;
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
    private deRegisterEventsAndCommands() {
        try {
            this.onDeconstruction();
            this._eventsAndCommandsRegistered = false;
        } catch (error) {
            this._logger?.error(`Error deconstructing events`, error);

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
     * @override
     */
    protected onConstruction(): void {
        throw new Error('Method not implemented; Override this method!');
    }

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
     * @override
     */
    protected onDeconstruction(): void {
        throw new Error('Method not implemented; Override this method!');
    }

    /**
     * This method is called when the context menu is invoked.
     * @param menu The context menu to add items to.
     * @param file The file the context menu is invoked on.
     * @override
     */
    protected onContextMenu(menu: Menu, file: TAbstractFile): void {
        throw new Error('Method not implemented; Override this method!');
    }

    /**
     * This method is called when the command menu is invoked.
     * @override
     */
    public invoke(): Promise<void> {
        throw new Error('Method not implemented; Override this method!');
    }
}
