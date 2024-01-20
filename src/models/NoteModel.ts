// Note: DocumentModel class

import { TFile } from 'obsidian';
import { FileModel } from './FileModel';
import IPrjModel from '../interfaces/IPrjModel';
import Global from '../classes/Global';
import NoteData from 'src/types/NoteData';

export class NoteModel
    extends FileModel<NoteData>
    implements IPrjModel<NoteData>
{
    private _fileCache = Global.getInstance().fileCache;

    get tags(): string[] {
        const tags = this.data.tags;
        let formattedTags: string[] = [];

        if (tags && typeof tags === 'string') {
            formattedTags = [tags];
        } else if (Array.isArray(tags)) {
            formattedTags = [...tags];
        }

        return formattedTags;
    }
    set tags(value: string[]) {
        this.data.tags = value;
    }

    public get data(): Partial<NoteData> {
        return this._data;
    }
    public set data(value: Partial<NoteData>) {
        this._data = value;
    }

    constructor(file: TFile | undefined) {
        super(file, NoteData, undefined);
    }

    public override toString(): string {
        let allText = this.data.title ?? '';
        allText += this.data.description ?? '';
        allText += this.data.date ?? '';
        allText += this.data.tags ?? '';

        return allText;
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
}
