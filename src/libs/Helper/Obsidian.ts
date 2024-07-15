import { App, TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Singleton } from 'src/classes/decorators/Singleton';
import { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { DIContainer } from '../DependencyInjection/DIContainer';
import type { IDIContainer } from '../DependencyInjection/interfaces/IDIContainer';
import { Lifecycle } from '../LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from '../LifecycleManager/interfaces/ILifecycleManager';

export interface IHelperObsidian_ {
    openFile(file: TFile): Promise<void>;
    rebuildActiveView(): void;
    getActiveFile(): TFile | undefined;
}

/**
 * Represents a class for Obsidian related helper methods.
 * @see {@link Singleton}
 * @see {@link Lifecycle}
 */
@Lifecycle
@ImplementsStatic<ILifecycleObject>()
@ImplementsStatic<IHelperObsidian_>()
@Singleton
export class HelperObsidian {
    protected _dependencies: IDIContainer;
    protected _app: App;
    protected _logger: ILogger | undefined;

    /**
     * Create a Singleton instance of the HelperObsidian class.
     * @param dependencies The dependencies for the class.
     */
    constructor(dependencies?: IDIContainer) {
        this._dependencies = dependencies ?? DIContainer.getInstance();

        this._logger = this._dependencies
            .resolve<ILogger_>('ILogger_', false)
            ?.getLogger('HelperObsidian');

        this._app = this._dependencies.resolve<App>('App');
    }

    /**
     * This method is called when the application is unloaded.
     */
    public static beforeLoad(): void {
        DIContainer.getInstance().register('IHelperObsidian_', HelperObsidian);
    }

    /**
     * Gets the active file in the workspace.
     * @returns The active file in the workspace, or undefined if no file is active.
     */
    public static getActiveFile(): TFile | undefined {
        return new HelperObsidian().getActiveFile();
    }

    /**
     * Gets the active file in the workspace.
     * @returns The active file in the workspace, or undefined if no file is active.
     */
    private getActiveFile(): TFile | undefined {
        const workspace = this._app.workspace;
        const activeFile = workspace.getActiveFile();

        if (!activeFile) {
            this._logger?.warn('No active file found');

            return undefined;
        }

        return activeFile;
    }

    /**
     * Opens the specified file in the active leaf.
     * @param file The file to open.
     * @returns A promise that resolves when the file is opened.
     */
    public static async openFile(file: TFile): Promise<void> {
        return new HelperObsidian().openFile(file);
    }

    /**
     * Opens the specified file in the active leaf.
     * @param file The file to open.
     */
    private async openFile(file: TFile): Promise<void> {
        this._logger?.trace(`Opening file: ${file.path}`);
        const workspace = this._app.workspace;
        const newLeaf = workspace.getLeaf(true);
        await newLeaf.openFile(file);
        const view = newLeaf.getViewState();
        view.state.mode = 'preview';
        newLeaf.setViewState(view);
    }

    /**
     * Rebuilds the active view.
     */
    public static rebuildActiveView(): void {
        new HelperObsidian().rebuildActiveView();
    }

    /**
     * Rebuilds the active view.
     */
    private rebuildActiveView(): void {
        const workspace = this._app.workspace;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, deprecation/deprecation
        const activeLeaf = workspace.activeLeaf as any;

        if (activeLeaf) {
            try {
                activeLeaf.rebuildView();
            } catch (error) {
                this._logger?.error('Error rebuilding active view', error);
            }
        }
    }
}
