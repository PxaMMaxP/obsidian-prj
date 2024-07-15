// Note: DocumentModel class

import { TFile } from 'obsidian';
import { Logging } from 'src/classes/Logging';
import { Path } from 'src/classes/Path';
import { ILogger } from 'src/interfaces/ILogger';
import { HelperGeneral } from 'src/libs/Helper/General';
import NoteData from './Data/NoteData';
import { FileModel } from './FileModel';
import Global from '../classes/Global';
import IPrjModel from '../interfaces/IPrjModel';

/**
 * Represents the model for a note.
 */
export class NoteModel
    extends FileModel<NoteData>
    implements IPrjModel<NoteData>
{
    protected _logger: ILogger = Logging.getLogger('NoteModel');

    /**
     * The data of the note.
     */
    public get data(): Partial<NoteData> {
        return this._data;
    }
    /**
     * The data of the note.
     */
    public set data(value: Partial<NoteData>) {
        this._data = value;
    }

    /**
     * Creates a new instance of the note model.
     * @param file The file to create the model for.
     */
    constructor(file: TFile | undefined) {
        super(file, NoteData, undefined);
    }

    /**
     * Get a wikilink for the note
     * @param text The text to display in the wikilink
     * @returns The wikilink. E.g. `[[FileName]]` or `[[FileName|Text]]`
     */
    public getWikilink(text: string | undefined): string {
        if (text) {
            return `[[${this.file.name}|${text}]]`;
        } else {
            return `[[${this.file.name}]]`;
        }
    }

    /**
     * Returns the file contents of the document
     * @returns String containing the file contents
     */
    public async getFileContents(): Promise<string | undefined> {
        try {
            return this._app.vault.read(this.file);
        } catch (error) {
            this._logger.error(error);
        }
    }

    /**
     * Returns the tags of the document as an array of strings
     * @returns Array of strings containing the tags
     */
    public getTags(): string[] {
        const tags = this.data.tags;
        let formattedTags: string[] = [];

        if (tags && typeof tags === 'string') {
            formattedTags = [tags];
        } else if (Array.isArray(tags)) {
            formattedTags = [...tags];
        }

        return formattedTags;
    }

    /**
     * Static API for the NoteModel class.
     */
    //#region Static API
    /**
     * Generates a filename based on the provided NoteModel.
     * @param model The NoteModel object used to generate the filename.
     * @returns The generated filename as a string.
     */
    public static generateFilename(model: NoteModel): string {
        const newFileName: string[] = [];

        if (model.data.date) {
            newFileName.push(
                `${HelperGeneral.formatDate(model.data.date, Global.getInstance().settings.dateFormat)}`,
            );
        }

        if (model.data.tags) {
            const firstTag = model.data.tags.first();

            if (firstTag && firstTag !== undefined) {
                const lastTagElement = firstTag.getElements().last();
                lastTagElement && newFileName.push(lastTagElement);
            }
        }

        if (model.data.title) {
            newFileName.push(model.data.title);
        }

        return Path.sanitizeFilename(newFileName.join(' - '));
    }
    //#endregion
}
