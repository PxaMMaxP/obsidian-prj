import { TFile } from 'obsidian';
import Global from 'src/classes/Global';
import Logging from 'src/classes/Logging';
import { Path } from 'src/classes/Path';
import Helper from './Helper';

/**
 * A class that handles file operations.
 * Capsulates the Obsidian file operations functions.
 */
export default class FileManager {
    /**
     * Renames a file.
     * @param file The file to rename.
     * @param filename The new filename. If no extension is provided, the extension of the file is used.
     * @returns - true: Whether the renaming was successful or unnecessary (if the filename is already correct).
     * - false: Whether the renaming failed.
     * @remarks - This function will not rename the file if the filename is already correct.
     * - This function use `fileManager.renameFile` to rename the file. Linking will be updated automatically.
     */
    public static async renameFile(
        file: TFile,
        filename: Filename,
    ): Promise<boolean> {
        const logger = Logging.getLogger('FileManager/renameFile');
        const app = Global.getInstance().app;

        if (!file || !file.parent?.path || !filename) {
            filename ?? logger.error('No new filename provided');
            file ?? logger.error('No file provided');
            file.parent?.path ?? logger.error('No parent path provided');

            return false;
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
            Helper.sanitizeFilename(newFilename.filename),
        );

        logger.trace(
            `Renaming file ${file.name} to ${newFilename.filename} in ${file.parent.path}`,
        );

        try {
            await app.fileManager.renameFile(file, movePath);
        } catch (error) {
            logger.error(
                `Renaming file ${file.path} to ${newFilename.filename} failed: `,
                error,
            );

            return false;
        }

        logger.debug(
            `Renamed file file ${file.name} to ${newFilename.filename} in ${file.parent.path}`,
        );

        return true;
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
     * @returns `${this.basename}${this.extension}
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
