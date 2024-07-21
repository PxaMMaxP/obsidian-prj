import { TFile } from 'obsidian';
import { Logging } from 'src/classes/Logging';
import { Path } from 'src/classes/Path';
import { IApp } from 'src/interfaces/IApp';
import { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { Resolve } from './DependencyInjection/functions/Resolve';

/**
 * A class that handles file operations.
 * Capsulates the Obsidian file operations functions.
 */
export default class FileManager {
    /**
     * Renames a file.
     * @param file The file to rename.
     * @param filename The new filename. If no extension is provided, the extension of the file is used.
     * @param awaitPromise A promise that resolves when the previous changes are written to the file.
     * @returns - true: Whether the renaming was successful or unnecessary (if the filename is already correct).
     * - false: Whether the renaming failed.
     * @remarks - This function will not rename the file if the filename is already correct.
     * - This function use `fileManager.renameFile` to rename the file. Linking will be updated automatically.
     */
    public static async renameFile(
        file: TFile,
        filename: Filename,
        awaitPromise?: Promise<void>,
    ): Promise<boolean> {
        const logger = Logging.getLogger('FileManager/renameFile');

        if (!file?.parent?.path || !filename) {
            filename ?? logger.error('No new filename provided');
            file ?? logger.error('No file provided');
            file.parent?.path ?? logger.error('No parent path provided');

            return false;
        }

        if (awaitPromise) {
            logger.trace('Waiting for previous promise to resolve');
            await awaitPromise;
        }

        const newFilename = new Filename(
            filename.basename,
            filename.extension ?? file.extension,
        );

        if (
            file.basename === filename.basename &&
            file.extension === filename.extension
        ) {
            logger.debug('Filename is already correct');

            return true;
        }

        const movePath = Path.join(
            file.parent.path,
            Path.sanitizeFilename(newFilename.filename),
        );

        return await this.moveRenameFile(file, movePath, newFilename, logger);
    }

    /**
     * Moves a file.
     * @param file The file to move.
     * @param path The new path of the file.
     * @param filename The new filename.
     * @param awaitPromise A promise that resolves when the previous changes are written to the file.
     * @returns - true: Whether the moving was successful.
     * - false: Whether the moving failed.
     */
    public static async moveFile(
        file: TFile,
        path: string,
        filename?: Filename,
        awaitPromise?: Promise<void>,
    ): Promise<boolean> {
        const logger = Logging.getLogger('FileManager/moveFile');

        if (!file) {
            file ?? logger.error('No file provided');

            return false;
        }

        if (awaitPromise) {
            logger.trace('Waiting for previous promise to resolve');
            await awaitPromise;
        }

        const newFilename = new Filename(
            filename?.basename ?? file.basename,
            filename?.extension ?? file.extension,
        );

        const movePath = Path.join(
            path,
            Path.sanitizeFilename(newFilename.filename),
        );

        return await this.moveRenameFile(file, movePath, newFilename, logger);
    }

    /**
     * Moves and renames a file.
     * @param file The file to move and rename.
     * @param path The new path of the file.
     * @param filename The new filename.
     * @param logger A logger to log the process.
     * @returns - true: Whether the moving and renaming was successful.
     * - false: Whether the moving and renaming failed.
     */
    private static async moveRenameFile(
        file: TFile,
        path: string,
        filename: Filename,
        logger?: ILogger,
    ): Promise<boolean> {
        if (path === file.path) {
            logger?.debug(
                `Moving/renaming file ${file.name} to ${path} is unnecessary`,
            );

            return true;
        }

        logger?.trace(`Moving/renaming file ${file.name} to ${path}`);

        try {
            await Resolve<IApp>('IApp').fileManager.renameFile(file, path);
        } catch (error) {
            logger?.error(
                `Moving/renaming file ${file.name} to ${path} failed: `,
                error,
            );

            return false;
        }

        logger?.debug(`Moved/renamed file ${file.name} to ${path} in ${path}`);

        return true;
    }

    /**
     * Creates a new file.
     * @param path The path of the new file.
     * @param filename The filename of the new file.
     * @param content The content of the new file.
     * @returns - The new file if successful.
     * - undefined if the creation failed.
     */
    public static async createFile(
        path: string,
        filename: Filename,
        content?: string,
    ): Promise<TFile | undefined> {
        const logger = Resolve<ILogger_>('ILogger_').getLogger(
            'FileManager/createFile',
        );

        const newFilename = new Filename(
            filename.basename,
            filename.extension ?? 'md',
        );

        const filePath = Path.join(
            path,
            Path.sanitizeFilename(newFilename.filename),
        );

        try {
            const file = await Resolve<IApp>('IApp').vault.create(
                filePath,
                content ?? '',
            );

            logger.debug(`Created file ${file.name} in ${path}`);

            return file;
        } catch (error) {
            logger.error(`Creating file ${filePath} failed: `, error);

            return undefined;
        }
    }
}

/**
 * A filename with basename and extension.
 */
export class Filename {
    /**
     * The basename of the filename.
     */
    public basename: string;
    /**
     * The extension of the filename.
     */
    public extension: string | undefined;

    /**
     * The full filename.
     */
    get filename(): string {
        return `${this.basename}${this.extension ? `.${this.extension}` : ''}`;
    }

    /**
     * Creates a new filename.
     * @param basename The basename of the filename.
     * @param extension The extension of the filename.
     */
    constructor(basename: string, extension?: string) {
        this.basename = basename;
        this.extension = extension;
    }
}
