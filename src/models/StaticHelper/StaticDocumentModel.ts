/* eslint-disable deprecation/deprecation */
import { TFile } from 'obsidian';
import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import Helper from 'src/libs/Helper';
import { DocumentModel } from '../DocumentModel';
import Logging from 'src/classes/Logging';
import { Path } from 'src/classes/Path';

/**
 * Static API for DocumentModel
 * @deprecated Use DocumentModel directly
 */
export class StaticDocumentModel {
    /**
     * Returns all documents
     * @returns {DocumentModel[]} List of all documents
     * @deprecated Use DocumentModel.getAllDocuments
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
     * @deprecated Use DocumentModel.getAllSenderRecipients
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
     * @deprecated Use DocumentModel.generateMetadataFilename
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

        return Helper.sanitizeFilename(newFileName.join(' - '));
    }

    /**
     * Returns all PDFs without metadata files
     * @returns {TFile[]} List of PDFs without metadata files
     * @remarks - This function searches for all PDFs without a corresponding metadata file.
     * - The function uses the metadataCache and fileCache to find all PDFs without a metadata file.
     * @deprecated Use DocumentModel.getAllPDFsWithoutMetadata
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
     * @deprecated Use DocumentModel.sortDocumentsByDateDesc
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
     * @deprecated Use DocumentModel.sortDocumentsByDateAsc
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
     * @deprecated Use DocumentModel.syncMetadataToFile
     */
    public static async syncMetadataToFile(file: TFile): Promise<void> {
        const logger = Logging.getLogger('SyncMetadataToFile');
        const app = Global.getInstance().app;
        const settings = Global.getInstance().settings;

        const document = new DocumentModel(file);

        const desiredFilename =
            StaticDocumentModel.generateMetadataFilename(document);
        const defaultDocumentFolder = settings.documentSettings.defaultFolder;

        const desiredFilePath = Path.join(
            defaultDocumentFolder,
            `${desiredFilename}.md`,
        );

        // Markdown file
        if (desiredFilePath !== document.file.path) {
            logger.trace(
                `Moving file '${document.file.path}' to '${desiredFilePath}'`,
            );
            // fileManager.renameFile does autorenaming internal links
            await app.fileManager.renameFile(document.file, desiredFilePath);
        } else {
            logger.trace(
                `File '${document.file.path}' is already in the correct folder`,
            );
        }

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

        const defaultPdfFolder = documentDate
            ? settings.documentSettings.pdfFolder
                  .replace('{YYYY}', documentYear)
                  .replace('{MM}', documentMonth)
            : undefined;

        let desiredPdfFilePath: string | undefined;

        // Check if file is already in the default folder
        // if not, move it there
        if (
            !document.data.dontChangePdfPath &&
            defaultPdfFolder &&
            !pdfFile.path.contains(defaultPdfFolder)
        ) {
            desiredPdfFilePath = Path.join(
                defaultPdfFolder,
                `${desiredFilename}.${pdfFile.extension}`,
            );
        } else {
            // If file in default folder, rename it if necessary
            const pdfParentFolder = pdfFile.parent?.path;

            if (pdfParentFolder) {
                desiredPdfFilePath = Path.join(
                    pdfParentFolder,
                    `${desiredFilename}.${pdfFile.extension}`,
                );

                if (desiredPdfFilePath.replace('\\', '/') === pdfFile.path) {
                    logger.trace(
                        `File '${pdfFile.path}' is already in the correct folder`,
                    );
                    desiredPdfFilePath = undefined;
                }
            }
        }

        if (desiredPdfFilePath) {
            logger.trace(
                `Moving file '${pdfFile.path}' to '${desiredPdfFilePath}'`,
            );
            // fileManager.renameFile does autorenaming internal links
            await app.fileManager.renameFile(pdfFile, desiredPdfFilePath);
        }
    }
}
