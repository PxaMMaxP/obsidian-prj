/**
 * Lightweigth Obsidian API as Interfaces.
 */

/**
 * File stats
 */
export interface FileStats {
    /**
     * Time of creation, represented as a unix timestamp, in milliseconds.
     */
    ctime: number;
    /**
     * Time of last modification, represented as a unix timestamp, in milliseconds.
     */
    mtime: number;
    /**
     * Size on disk, as bytes.
     */
    size: number;
}

/**
 * Represents a file in the vault.
 */
export interface TFile extends TAbstractFile {
    /**
     * The file stats.
     */
    stat: FileStats;
    /**
     * The Name of the file without extension.
     */
    basename: string;
    /**
     * The extension of the file.
     */
    extension: string;
}

/**
 * This can be either a `TFile` or a `TFolder`.
 */
export interface TAbstractFile {
    /**
     * The Vault instance.
     * @deprecated This property is not implemented in the current version.
     */
    vault: unknown;
    /**
     * Path to the file.
     */
    path: string;
    /**
     * File name.
     * @remarks If the name ist with or without extension is unknown.
     */
    name: string;
    /**
     * Parent folder.
     */
    parent: TFolder | null;
}

/**
 * @public
 */
export interface TFolder extends TAbstractFile {
    /**
     * Child files and folders.
     */
    children: TAbstractFile[];

    /**
     * Get wether the folder is the root folder.
     */
    isRoot(): boolean;
}
