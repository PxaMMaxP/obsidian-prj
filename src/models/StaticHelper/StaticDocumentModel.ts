import { TFile } from "obsidian";
import Global from "src/classes/Global";
import Lng from "src/classes/Lng";
import Helper from "src/libs/Helper";
import { DocumentModel } from "../DocumentModel";

/**
 * Static API for DocumentModel
 */
export class StaticDocumentModel {

    /**
     * Returns all documents
     * @returns {DocumentModel[]} List of all documents
     */
    public static getAllDocuments(): DocumentModel[] {
        const metadataCache = Global.getInstance().metadataCache.cache;
        const documents = metadataCache.filter(file => file.metadata?.frontmatter?.type === "Metadata").map(file => new DocumentModel(file.file));
        return documents;
    }

    /**
     * Retrieves all unique sender and recipient names from the metadata cache.
     * 
     * @returns An array of strings representing the sender and recipient names.
     */
    public static getAllSenderRecipients(): string[] {
        const metadataCache = Global.getInstance().metadataCache.cache;
        const documents = metadataCache.filter(file => file.metadata?.frontmatter?.type === "Metadata")
            .flatMap(file => [file.metadata?.frontmatter?.sender, file.metadata?.frontmatter?.recipient])
            .filter((v): v is string => v != null)
            .filter((v, index, self) => self.indexOf(v) === index)
            .sort();
        return documents;
    }

    /**
     * Generates a metadata filename based on the provided DocumentModel.
     * @param model The DocumentModel object.
     * @returns The generated metadata filename.
     */
    public static generateMetadataFilename(model: DocumentModel): string {
        const newFileName: string[] = [];
        if (model.data.date) {
            newFileName.push(`${Helper.formatDate(model.data.date, Global.getInstance().settings.dateFormat)}`);
        }
        if (model.data.subType === 'Cluster') {
            newFileName.push(`Cluster`);
        }
        if (model.data.recipient) {
            newFileName.push(`${Lng.gt("To")} ${model.data.recipient}`);
        }
        if (model.data.sender) {
            newFileName.push(`${Lng.gt("From")} ${model.data.sender}`);
        }
        newFileName.push(`${model.data.title}`);


        return newFileName.join(' - ');
    }

    /**
     * Returns all PDFs without metadata files
     * @returns {TFile[]} List of PDFs without metadata files
     * @remarks - This function searches for all PDFs without a corresponding metadata file.
     * - The function uses the metadataCache and fileCache to find all PDFs without a metadata file.
     */
    public static getAllPDFsWithoutMetadata(): TFile[] {
        const metadataCache = Global.getInstance().metadataCache.cache;
        const fileCache = Global.getInstance().fileCache.Cache;
        const setOfPDFsWithMetadata = new Set(metadataCache
            .filter(file => file.metadata?.frontmatter?.type === "Metadata" && file.metadata?.frontmatter?.file)
            .map(file => new DocumentModel(file.file).getFile())
            .filter(file => file !== undefined && file.extension === "pdf"));
        const listOfPDFWithoutMetadata = fileCache.filter(file => file.extension === "pdf" && !setOfPDFsWithMetadata.has(file));
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
}