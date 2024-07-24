import { TFile } from 'obsidian';

/**
 * Static interface for {@link IHelperObsidian}.
 * @deprecated Use the instance interface instead => {@link IHelperObsidian}
 */

export interface IHelperObsidian_ {
    /**
     * @deprecated Use {@link IHelperObsidian.openFile} instead.
     */
    openFile(file: TFile): Promise<void>;
    /**
     * @deprecated Use {@link IHelperObsidian.rebuildActiveView} instead.
     */
    rebuildActiveView(): void;
    /**
     * @deprecated Use {@link IHelperObsidian.getActiveFile} instead.
     */
    getActiveFile(): TFile | undefined;
}

/**
 * Interface for Obsidian related helper methods.
 */
export interface IHelperObsidian {
    /**
     * Opens the specified file in the active leaf.
     * @param file The file to open.
     */
    openFile(file: TFile): Promise<void>;
    /**
     * Rebuilds the active view.
     */
    rebuildActiveView(): void;
    /**
     * Gets the active file in the workspace.
     * @returns The active file in the workspace, or undefined if no file is active.
     */
    getActiveFile(): TFile | undefined;
    /**
     * Shows a notice
     * @param message The message to show
     * @param timeout The timeout of the notice
     */
    showNotice(message: string, timeout: number): void;
}
