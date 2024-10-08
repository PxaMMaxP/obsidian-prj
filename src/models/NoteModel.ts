// Note: DocumentModel class

import { TFile } from 'obsidian';
import { Path } from 'src/classes/Path';
import { HelperGeneral } from 'src/libs/Helper/General';
import type { IPrjSettings } from 'src/types/PrjSettings';
import { Inject, ITSinjex } from 'ts-injex';
import PrjNoteData from './Data/PrjNoteData';
import { FileModel } from './FileModel';
import IPrjModel from './interfaces/IPrjModel';

/**
 * Represents the model for a note.
 */
export class NoteModel
    extends FileModel<PrjNoteData>
    implements IPrjModel<PrjNoteData>
{
    @Inject('IPrjSettings')
    protected static _IPrjSettings: IPrjSettings;

    /**
     * The data of the note.
     */
    public get data(): Partial<PrjNoteData> {
        return this._data;
    }
    /**
     * The data of the note.
     */
    public set data(value: Partial<PrjNoteData>) {
        this._data = value;
    }

    /**
     * Creates a new instance of the note model.
     * @param file The file to create the model for.
     * @param dependencies The optional dependencies to use.
     */
    constructor(file: TFile | undefined, dependencies?: ITSinjex) {
        super(file, PrjNoteData, undefined, dependencies);
    }

    /**
     * Get a wikilink for the note
     * @param text The text to display in the wikilink
     * @returns The wikilink. E.g. `[[FileName]]` or `[[FileName|Text]]`
     * @deprecated This method is deprecated and will be removed in a future version.
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
     * @deprecated This method is deprecated and will be removed in a future version.
     */
    public async getFileContents(): Promise<string | undefined> {
        try {
            return this._IApp.vault.read(this.file);
        } catch (error) {
            this._logger?.error(error);
        }
    }

    /**
     * Returns the tags of the document as an array of strings
     * @returns Array of strings containing the tags
     * @deprecated This method is deprecated and will be removed in a future version.
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

    //#region Static API
    /**
     * Static API for the NoteModel class.
     */

    /**
     * Generates a filename based on the provided NoteModel.
     * @param model The NoteModel object used to generate the filename.
     * @returns The generated filename as a string.
     */
    public static generateFilename(model: NoteModel): string {
        const newFileName: string[] = [];

        if (model.data.date) {
            newFileName.push(
                `${HelperGeneral.formatDate(model.data.date, this._IPrjSettings.dateFormat)}`,
            );
        }

        if (model.data.tags) {
            const firstTag = model.data.tags.first();

            if (firstTag && firstTag !== undefined) {
                const lastTagElement = firstTag.getElements().last();
                //@todo: check if this is correct
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
