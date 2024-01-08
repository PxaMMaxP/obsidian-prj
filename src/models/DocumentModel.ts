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

    public getWikilink(text: string | undefined): string {
        if (text) {
            return `[[${this.file.name}|${text}]]`;
        } else {
            return `[[${this.file.name}]]`;
        }
    }

    public async getFileContents(): Promise<string> {
        return this.app.vault.read(this.file);

    }

    public getDescription(): string {
        /**if (this.data.description || this.data.description === null) {
            return this.data.description ?? "";
        } else {
            const content = await this.getFileContents();
            const summary = this.extractSummary(content);
            if (!summary || summary === "") {
                console.warn("No summary found for File " + this.file.name);
                this.data.description = null;
                console.info("Set empty description for File " + this.file.name);
            } else {
                console.warn("Summary in *File-Data* found for File " + this.file.name);
                console.info(summary);
                // Versuche die Daten aus der Datei zu entfernen:
                const content = await this.app.vault.read(this.file);
                const newContent = content.replace(summary, "");
                const dataWriteOptions = {
                    ctime: this.file.stat.ctime,
                    mtime: this.file.stat.mtime + 1
                };
                await this.app.vault.modify(this.file, newContent, dataWriteOptions);
                await Helper.sleep(500);
                this.data.description = summary;
                console.warn("Copy summary to description field and delete in *File-Data* for File" + this.file.name);
            }
            return summary;
        }**/
        return this.data.description ?? "";
    }

    /**private extractSummary(content: string): string {
        let summary = "";
        let match = content.match(/#\s*\[\[[^\]]+\]\](?:\n|\s)*([\s\S]*?)(\n#|$)/);
        if (!match || match[1].trim() === "") {
            match = content.match(/---\s*([\s\S]*?)\s*---[\s]*([\s\S]*?)(?=#|$)/);
            if (match && match[2]) {
                summary = match[2].trim();
            }
        }
        else {
            summary = match[1].trim();
        }
        return summary.trim();
    }**/

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
}

