import { App, Notice, TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Singleton } from 'src/classes/decorators/Singleton';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import {
    IHelperObsidian_,
    IHelperObsidian,
} from './interfaces/IHelperObsidian';
import { Inject } from '../DependencyInjection/decorators/Inject';
import { RegisterInstance } from '../DependencyInjection/decorators/RegisterInstance';

/**
 * Represents a class for Obsidian related helper methods.
 * @see {@link Singleton}
 */
// eslint-disable-next-line deprecation/deprecation
@ImplementsStatic<IHelperObsidian_>()
@RegisterInstance('IHelperObsidian')
@Singleton
export class HelperObsidian implements IHelperObsidian {
    @Inject('IApp')
    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected _IApp: App;
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('HelperObsidian'), false)
    protected _logger?: ILogger;

    /**
     * Create a Singleton instance of the HelperObsidian class.
     */
    constructor() {}

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
    public getActiveFile(): TFile | undefined {
        const workspace = this._IApp.workspace;
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
    public async openFile(file: TFile): Promise<void> {
        this._logger?.trace(`Opening file: ${file.path}`);
        const workspace = this._IApp.workspace;
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
    public rebuildActiveView(): void {
        const workspace = this._IApp.workspace;
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

    /**
     * Shows a notice
     * @param message The message to show
     * @param timeout The timeout of the notice
     */
    public showNotice(message: string, timeout: number): void {
        new Notice(message, timeout);
    }
}
