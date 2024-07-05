// Note: DocumentModel class

import { TFile } from 'obsidian';
import Logging from 'src/classes/Logging';
import { Path } from 'src/classes/Path';
import { ILogger } from 'src/interfaces/ILogger';
import Helper from 'src/libs/Helper';
import NoteData from './Data/NoteData';
import { FileModel } from './FileModel';
import Global from '../classes/Global';
import IPrjModel from '../interfaces/IPrjModel';

export class NoteModel
    extends FileModel<NoteData>
    implements IPrjModel<NoteData>
{
    protected logger: ILogger = Logging.getLogger('NoteModel');

    public get data(): Partial<NoteData> {
        return this._data;
    }
    public set data(value: Partial<NoteData>) {
        this._data = value;
    }

    constructor(file: TFile | undefined) {
        super(file, NoteData, undefined);
    }

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
            return this.app.vault.read(this.file);
        } catch (error) {
            this.logger.error(error);
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
     *
     * @param model The NoteModel object used to generate the filename.
     * @returns The generated filename as a string.
     */
    public static generateFilename(model: NoteModel): string {
        const newFileName: string[] = [];

        if (model.data.date) {
            newFileName.push(
                `${Helper.formatDate(model.data.date, Global.getInstance().settings.dateFormat)}`,
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
