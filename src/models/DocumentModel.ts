// Note: DocumentModel class

import { TFile } from "obsidian";
import { BaseModel } from "./BaseModel";
import IPrjModel from "../interfaces/IPrjModel";
import DocumentData from "../types/DocumentData";
import Global from "../classes/Global";
import Helper from "../libs/Helper";

export class DocumentModel extends BaseModel<DocumentData> implements IPrjModel<DocumentData> {
    private fileCache = Global.getInstance().fileCache;

    private _relatedFiles: DocumentModel[] | null | undefined = undefined;

    constructor(file: TFile) {
        super(file, DocumentData, DocumentData.yamlKeyMap);
    }

    public get data(): Partial<DocumentData> {
        return this._data;
    }
    public set data(value: Partial<DocumentData>) {
        this._data = value;
    }

    public get relatedFiles(): DocumentModel[] | null {
        if (this._relatedFiles === undefined) {
            this._relatedFiles = [];
            const relatedFiles = this.data.relatedFiles;
            if (relatedFiles) {
                relatedFiles.map((relatedFile) => {
                    const wikilinkData = Helper.extractDataFromWikilink(relatedFile);
                    const mdFilename = wikilinkData.basename ? `${wikilinkData.basename}.md` : "";
                    const file = this.fileCache.findFileByName(mdFilename);
                    if (file instanceof TFile && file.path !== this.file.path) {
                        this._relatedFiles?.push(new DocumentModel(file));
                    }
                    return null;
                });
            } else { this._relatedFiles = null; }
        }
        return this._relatedFiles;
    }

    public override toString(): string {
        let allText = this.data.title ?? "";
        allText += this.data.description ?? "";
        allText += this.data.date ?? "";
        allText += this.data.dateOfDelivery ?? "";
        allText += this.data.file ?? "";
        allText += this.data.tags ?? "";
        allText += this.data.sender ?? "";
        allText += this.data.recipient ?? "";
        allText += this.data.relatedFiles ?? "";
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
    public async getFileContents(): Promise<string> {
        return this.app.vault.read(this.file);

    }

    /**
     * Returns the description of the document
     * @returns String containing the description
     */
    public getDescription(): string {
        return this.data.description ?? "";
    }

    /**
     * Returns `Input` if the document is addressed to the user or `Output` if it comes from the user. Otherwise `null`.
     * @returns State of the document.
     * E.g. `Input` if the document is addressed to the user or `Output` if it comes from the user. Otherwise `null`.
     */
    public getInputOutputState(): null | "Input" | "Output" {
        const username = this.global.settings.user.name;
        const shortUsername = this.global.settings.user.shortName;
        if (this.data && (this.data.sender || this.data.recipient)) {
            if (this.data.sender === username || this.data.sender === shortUsername) {
                return "Output";
            } else if (this.data.recipient === username || this.data.recipient === shortUsername) {
                return "Input";
            }
            else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * Returns the linked file of the document
     * @returns TFile of the linked file
     */
    public getFile(): TFile {
        const fileLinkData = Helper.extractDataFromWikilink(this.data.file);
        const file = this.fileCache.findFileByName(fileLinkData.filename ?? "");
        if (file instanceof TFile) {
            return file;
        } else if (Array.isArray(file)) {
            this.logger.warn(`Multiple files found for ${fileLinkData.filename}`);
            return file.first() ?? this.file;
        }
        this.logger.warn(`No files found for ${fileLinkData.filename}`);
        return this.file;
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
        }
        else if (Array.isArray(tags)) {
            formattedTags = [...tags];
        }

        return formattedTags;
    }

    /**
     * Sorts the documents by date descending
     * @param documents Array of DocumentModels to sort
     * @remarks This function sorts the array in place
     */
    public static sortDocumentsByDateDesc(documents: DocumentModel[]): void {
        documents.sort((a, b) => {
            if (a.data.date && b.data.date) {
                const dateA = new Date(a.data.date);
                const dateB = new Date(b.data.date);
                return dateB.getTime() - dateA.getTime();
            } else if (a.data.date) {
                return -1;
            } else if (b.data.date) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    /**
     * Sorts the documents by date ascending
     * @param documents Array of DocumentModels to sort
     * @remarks This function sorts the array in place
     */
    public static sortDocumentsByDateAsc(documents: DocumentModel[]): void {
        documents.sort((a, b) => {
            if (a.data.date && b.data.date) {
                const dateA = new Date(a.data.date);
                const dateB = new Date(b.data.date);
                return dateA.getTime() - dateB.getTime();
            } else if (a.data.date) {
                return 1;
            } else if (b.data.date) {
                return -1;
            } else {
                return 0;
            }
        });
    }
}

