// Note: DocumentModel class

import { TFile } from 'obsidian';
import Lng from 'src/classes/Lng';
import Logging from 'src/classes/Logging';
import { Path } from 'src/classes/Path';
import { ILogger } from 'src/interfaces/ILogger';
import FileCache from 'src/libs/FileCache';
import FileManager, { Filename } from 'src/libs/FileManager';
import Tags from 'src/libs/Tags/Tags';
import DocumentData from './Data/DocumentData';
import { FileModel } from './FileModel';
import Global from '../classes/Global';
import IPrjModel from '../interfaces/IPrjModel';
import Helper from '../libs/Helper';

export class DocumentModel
    extends FileModel<DocumentData>
    implements IPrjModel<DocumentData>
{
    protected logger: ILogger;
    private _fileCache: FileCache;
    private _relatedFiles: DocumentModel[] | null | undefined = undefined;

    /**
     * The tags of the document.
     * @deprecated Use the `data.tags` property instead.
     */
    get tags(): string[] {
        return this.data.tags?.toStringArray() ?? [];
    }

    /**
     * The tags of the document.
     * @deprecated Use the `data.tags` property instead.
     */
    set tags(value: string[]) {
        this.data.tags = value as unknown as Tags;
    }

    public get data(): Partial<DocumentData> {
        return this._data;
    }
    public set data(value: Partial<DocumentData>) {
        this._data = value;
    }

    constructor(file: TFile | undefined, logger?: ILogger) {
        super(file, DocumentData, DocumentData.yamlKeyMap);

        this.logger = logger ?? Logging.getLogger('DocumentModel');
        this._fileCache = Global.getInstance().fileCache;
    }

    public get relatedFiles(): DocumentModel[] | null {
        if (this._relatedFiles === undefined) {
            this._relatedFiles = [];
            const relatedFiles = this.data.relatedFiles;

            if (relatedFiles) {
                relatedFiles.map((relatedFile) => {
                    const wikilinkData =
                        Helper.extractDataFromWikilink(relatedFile);

                    const mdFilename = wikilinkData.basename
                        ? `${wikilinkData.basename}.md`
                        : '';

                    const file = this._fileCache.findFileByLinkText(
                        mdFilename,
                        this.file.path,
                    );

                    if (file instanceof TFile && file.path !== this.file.path) {
                        this._relatedFiles?.push(new DocumentModel(file));
                    }

                    return null;
                });
            } else {
                this._relatedFiles = null;
            }
        }

        return this._relatedFiles;
    }

    /**
     * Returns the metadata of the document as a string
     * @deprecated Use `data.toString()` instead.
     */
    public override toString(): string {
        return this.data.toString?.() ?? '';
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

    public getCorospondingSymbol(): string {
        if (this.data.type === 'Metadata') {
            if (this.data.subType === 'Cluster') {
                return this.global.settings.documentSettings.clusterSymbol;
            } else if (this.data.hide) {
                return this.global.settings.documentSettings.hideSymbol;
            } else {
                return this.global.settings.documentSettings.symbol;
            }
        }

        return 'x-circle';
    }

    /**
     * Returns the description of the document
     * @returns String containing the description
     * @deprecated Use `data.description` instead.
     */
    public getDescription(): string {
        return this.data.description ?? '';
    }

    /**
     * Returns `Input` if the document is addressed to the user or `Output` if it comes from the user. Otherwise `null`.
     * @returns State of the document.
     * E.g. `Input` if the document is addressed to the user or `Output` if it comes from the user. Otherwise `null`.
     */
    public getInputOutputState(): null | 'Input' | 'Output' {
        const username = this.global.settings.user.name;
        const shortUsername = this.global.settings.user.shortName;

        if (this.data && (this.data.sender || this.data.recipient)) {
            if (
                this.data.sender === username ||
                this.data.sender === shortUsername
            ) {
                return 'Output';
            } else if (
                this.data.recipient === username ||
                this.data.recipient === shortUsername
            ) {
                return 'Input';
            } else {
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
    public getLinkedFile(): TFile | undefined {
        if (!this.data.file) return undefined;

        const fileLinkData = Helper.extractDataFromWikilink(this.data.file);

        const file = this._fileCache.findFileByLinkText(
            fileLinkData.filename ?? '',
            this.file.path,
        );

        if (file instanceof TFile) {
            return file;
        } else {
            this.logger.warn(`No files found for ${fileLinkData.filename}`);

            return undefined;
        }
    }

    /**
     * Sets the linked file for the document.
     *
     * @param file The TFile object representing the linked file.
     * @param path The optional path to override the file's path.
     * @remarks - This function sets the `file` property of the document to the wikilink of the file.
     * - If no file is provided, the function will return.
     */
    public setLinkedFile(
        file: TFile | undefined,
        path?: string,
    ): string | undefined {
        if (!file || !(file instanceof TFile)) return;

        const linktext = this.global.app.metadataCache.fileToLinktext(
            file,
            path ? path : this.file.path,
        );
        const link = `[[${linktext}]]`;
        this.data.file = link;

        return link;
    }

    /**
     * Returns the tags of the document as an array of strings
     * @returns Array of strings containing the tags
     * @deprecated Use `data.tags` instead.
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

    public getUID(): string {
        if (this.data.uid === undefined || this.data.uid === '') {
            const random = Math.floor(Math.random() * 1000);

            this.data.uid = Helper.generateUID(
                this._data?.toString?.() + random.toString(),
                4,
                'U',
            ).toUpperCase();
        }

        return this.data.uid ?? '';
    }

    /**
     * Static API for the DocumentModel class.
     */
    //#region Static API
    /**
     * Returns all documents
     * @returns {DocumentModel[]} List of all documents
     */
    public static getAllDocuments(): DocumentModel[] {
        const metadataCache = Global.getInstance().metadataCache.cache;

        const documents = metadataCache
            .filter((file) => file.metadata?.frontmatter?.type === 'Metadata')
            .map((file) => new DocumentModel(file.file));

        return documents;
    }

    /**
     * Retrieves all unique sender and recipient names from the metadata cache.
     *
     * @returns An array of strings representing the sender and recipient names.
     */
    public static getAllSenderRecipients(): string[] {
        const metadataCache = Global.getInstance().metadataCache.cache;

        const documents = metadataCache
            .filter((file) => file.metadata?.frontmatter?.type === 'Metadata')
            .flatMap((file) => [
                file.metadata?.frontmatter?.sender,
                file.metadata?.frontmatter?.recipient,
            ])
            .filter((v): v is string => v != null)
            .filter((v, index, self) => self.indexOf(v) === index)
            .sort();

        return documents;
    }

    /**
     * Generates a metadata filename based on the provided DocumentModel.
     * @param model The DocumentModel object.
     * @returns The generated metadata filename without extension.
     */
    public static generateMetadataFilename(model: DocumentModel): string {
        const newFileName: string[] = [];

        if (model.data.date) {
            newFileName.push(
                `${Helper.formatDate(model.data.date, Global.getInstance().settings.dateFormat)}`,
            );
        }

        if (model.data.subType === 'Cluster') {
            newFileName.push(`Cluster`);
        }

        if (model.data.recipient) {
            newFileName.push(`${Lng.gt('To')} ${model.data.recipient}`);
        }

        if (model.data.sender) {
            newFileName.push(`${Lng.gt('From')} ${model.data.sender}`);
        }
        newFileName.push(`${model.data.title}`);

        if (model.getUID() != '') {
            newFileName.push(`${model.getUID()}`);
        }

        return Path.sanitizeFilename(newFileName.join(' - '));
    }

    /**
     * Returns all PDFs without metadata files
     * @returns {TFile[]} List of PDFs without metadata files
     * @remarks - This function searches for all PDFs without a corresponding metadata file.
     * - The function uses the metadataCache and fileCache to find all PDFs without a metadata file.
     */
    public static getAllPDFsWithoutMetadata(): TFile[] {
        const metadataCache = Global.getInstance().metadataCache.cache;
        const fileCache = Global.getInstance().app.vault.getFiles();

        const setOfPDFsWithMetadata = new Set(
            metadataCache
                .filter(
                    (file) =>
                        file.metadata?.frontmatter?.type === 'Metadata' &&
                        file.metadata?.frontmatter?.file,
                )
                .map((file) => new DocumentModel(file.file).getLinkedFile())
                .filter(
                    (file) => file !== undefined && file.extension === 'pdf',
                ),
        );

        const listOfPDFWithoutMetadata = fileCache.filter(
            (file) =>
                file.extension === 'pdf' && !setOfPDFsWithMetadata.has(file),
        );

        return listOfPDFWithoutMetadata;
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

    /**
     * Set the metadata and pfd file to the correct folder and filename
     * @param file The document/metadata file
     */
    public static async syncMetadataToFile(file: TFile): Promise<void> {
        const logger = Logging.getLogger('SyncMetadataToFile');
        const settings = Global.getInstance().settings;

        const document = new DocumentModel(file);

        const desiredFilename = this.generateMetadataFilename(document);
        const defaultDocumentFolder = settings.documentSettings.defaultFolder;

        // Markdown file
        await document.moveFile(defaultDocumentFolder, desiredFilename);

        // PDF file
        const pdfFile = document.getLinkedFile();

        if (!pdfFile) return;

        // Check if file is in ignore folders
        if (
            settings.documentSettings.ignorePdfFolders.some((folder) =>
                pdfFile.path.startsWith(folder),
            )
        ) {
            logger.trace(
                `File '${pdfFile.path}' is in ignore folder, no action necessary`,
            );

            return;
        }

        const documentDate = document.data.date
            ? new Date(document.data.date)
            : undefined;

        const documentYear = documentDate
            ? documentDate.getFullYear().toString()
            : '';

        const documentMonth = documentDate
            ? (documentDate.getMonth() + 1).toString().padStart(2, '0')
            : '';

        // Search for the correct and **first** tag folder
        let tagFolder: string | undefined = undefined;
        let specialTagFolder: string | undefined = undefined;

        const tagArray = document.data.tags?.toStringArray() ?? [];

        // Tag Folder
        // `document.data.tags` is an Array, search for the first tag that matches a custom tag folder
        const foundTag = tagArray.find((tag) =>
            settings.documentSettings.customTagFolders.some(
                (folder) => folder.tag === tag,
            ),
        );

        if (foundTag) {
            tagFolder = settings.documentSettings.customTagFolders.find(
                (folder) => folder.tag === foundTag,
            )?.folder;
        }

        // Special Tag Folder
        // `document.data.tags` is an Array, search for the first tag that matches a special tag folder
        const foundSpecialTag = tagArray.find((tag) =>
            settings.documentSettings.specialPdfFolders.some(
                (folder) => folder.tag === tag,
            ),
        );

        if (foundSpecialTag) {
            specialTagFolder = settings.documentSettings.specialPdfFolders.find(
                (folder) => folder.tag === foundSpecialTag,
            )?.folder;
        }

        let defaultPdfFolder = documentDate
            ? settings.documentSettings.pdfFolder
                  .replace('{YYYY}', documentYear)
                  .replace('{MM}', documentMonth)
            : undefined;

        if (tagFolder) {
            defaultPdfFolder = defaultPdfFolder?.replace(
                '{TAG_FOLDER}',
                tagFolder,
            );
        } else {
            defaultPdfFolder = defaultPdfFolder?.replace('{TAG_FOLDER}/', '');
        }

        if (specialTagFolder) {
            defaultPdfFolder = specialTagFolder;
        }

        let desiredPdfFilePath: string | undefined;

        // Check if file is already in the default folder
        // if not, move it there
        if (
            !document.data.dontChangePdfPath &&
            defaultPdfFolder &&
            !pdfFile.path.contains(defaultPdfFolder)
        ) {
            desiredPdfFilePath = defaultPdfFolder;
        } else {
            // If file in default folder, rename it if necessary
            desiredPdfFilePath = pdfFile.parent?.path ?? undefined;
        }

        if (desiredPdfFilePath) {
            const filename = new Filename(desiredFilename, pdfFile.extension);
            FileManager.moveFile(pdfFile, desiredPdfFilePath, filename);
        }
    }
    //#endregion
}
