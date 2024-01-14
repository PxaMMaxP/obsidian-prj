import path from "path";
import Global from "src/classes/Global";
import Lng from "src/classes/Lng";
import { DocumentModel } from "src/models/DocumentModel";
import DocumentData from "src/types/DocumentData";
import { Field, FormConfiguration, IFormResult, IResultData } from "src/types/ModalFormType";
import BaseModalForm from "./BaseModalForm";
import Helper from "../Helper";
import PrjTypes from "src/types/PrjTypes";

/**
 * Modal to create a new metadata file
 */
export default class CreateNewMetadataModal extends BaseModalForm {
    private fileCache = Global.getInstance().fileCache;

    /**
     * Creates an instance of CreateNewMetadataModal.
     */
    constructor() {
        super();
    }

    /**
     * Registers the command to open the modal
     * @remarks No cleanup needed
     */
    public static registerCommand(): void {
        const global = Global.getInstance();
        global.logger.trace("Registering 'CreateNewMetadataModal' commands");
        global.plugin.addCommand({
            id: "create-new-metadata-file",
            name: `${Lng.gt("New")} ${Lng.gt("MetadataFile")}`,
            callback: async () => {
                const modal = new CreateNewMetadataModal();
                const result = await modal.openForm();
                if (result) {
                    const document = await modal.evaluateForm(result);
                    if (document)
                        await Helper.openFile(document.file);
                }
            },
        })
    }

    /**
     * Opens the modal form
     * @param {Partial<DocumentData>} [preset] Preset values for the form
     * @returns {Promise<IFormResult | undefined>} Result of the form
     */
    public async openForm(preset?: Partial<DocumentData>): Promise<IFormResult | undefined> {
        if (!this.isApiAvailable()) return;
        this.logger.trace("Opening 'CreateNewMetadataModal' form");
        const convertedPreset: IResultData = {};
        if (preset) {
            for (const [key, value] of Object.entries(preset)) {
                convertedPreset[key] = value ?? "";
            }
        }
        const activeFile = Helper.getActiveFile();
        const tags: string[] = BaseModalForm.getTags(activeFile);
        if (convertedPreset) {
            if (convertedPreset.tags && Array.isArray(convertedPreset.tags)) {
                convertedPreset.tags = [...convertedPreset.tags, ...tags];
            } else {
                convertedPreset.tags = [...tags];
            }
        }

        const form = this.constructForm();
        const result = await this.getApi().openForm(form, { values: convertedPreset });
        this.logger.trace(`From closes with status '${result.status}' and data:`, result.data);
        return result;
    }

    /**
     * Evaluates the form result and creates a new metadata file
     * @param {IFormResult} result Result of the form
     * @returns {Promise<DocumentModel | undefined>} The created metadata file
     * @remarks - This function checks if the API is available.
     * - This function checks if the form result is valid,
     * - checks if the file exists and is a PDF file,
     * - fills the metadata file with the form data,
     * - creates the metadata file and
     * - returns the metadata file if created successfully else undefined.
     */
    public async evaluateForm(result: IFormResult): Promise<DocumentModel | undefined> {
        if (!this.isApiAvailable()) return;
        if (result.status !== "ok" || !result.data) return;

        const folder = this.settings.documentSettings.defaultFolder;

        const document = new DocumentModel(undefined);
        document.data.type = "Metadata";

        document.data.subType = PrjTypes.isValidFileSubType(result.data.subType);

        if (!document.data.subType && result.data.file) {
            const linkedFile = this.fileCache.findFirstFileByName(result.data.file as string);
            document.setLinkedFile(linkedFile, folder);
        }

        document.data.date = (result.data.date as string) ?? undefined;
        document.data.dateOfDelivery = (result.data.dateOfDelivery as string) ?? undefined;
        document.data.title = result.data.title as string ?? undefined;
        document.data.description = result.data.description as string ?? undefined;
        document.data.sender = result.data.sender as string ?? undefined;
        document.data.recipient = result.data.recipient as string ?? undefined;
        document.data.hide = result.data.hide as boolean ?? undefined;
        document.data.tags = result.data.tags as string[] ?? undefined;

        const newFileName = DocumentModel.api.generateMetadataFilename(document);

        const file = await this.app.vault.create(path.join(folder, `${newFileName}.md`), ``);
        document.file = file;

        return document;
    }

    /**
     * Constructs the form
     * @returns {FormConfiguration} Form configuration
     */
    protected constructForm(): FormConfiguration {
        const form: FormConfiguration = {
            title: `${Lng.gt("New")} ${Lng.gt("MetadataFile")}`,
            name: "new metadata file",
            customClassname: "",
            fields: []
        };

        // Sub type
        const subType: Field = {
            name: "subType",
            label: Lng.gt("SubType"),
            description: Lng.gt("SubTypeDescription"),
            isRequired: true,
            input: {
                type: "select",
                source: "fixed",
                options: [
                    { value: "none", label: Lng.gt("None") },
                    { value: "Cluster", label: Lng.gt("Cluster") }
                ]
            }
        };
        form.fields.push(subType);

        // Date
        const date: Field = {
            name: "date",
            label: Lng.gt("Date"),
            description: Lng.gt("DocDateDescription"),
            isRequired: false,
            input: {
                type: "date"
            }
        };
        form.fields.push(date);

        // Date of delivery
        const dateOfDelivery: Field = {
            name: "dateOfDelivery",
            label: Lng.gt("DateOfDelivery"),
            description: Lng.gt("DateOfDeliveryDescription"),
            isRequired: false,
            input: {
                type: "date"
            }
        };
        form.fields.push(dateOfDelivery);

        // Title
        const title: Field = {
            name: "title",
            label: Lng.gt("Title"),
            description: Lng.gt("TitleDescription"),
            isRequired: true,
            input: {
                type: "text"
            }
        };
        form.fields.push(title);

        // Description
        const description: Field = {
            name: "description",
            label: Lng.gt("Description"),
            description: Lng.gt("DescriptionDescription"),
            isRequired: false,
            input: {
                type: "textarea"
            }
        };
        form.fields.push(description);

        // Sender
        const sender: Field = {
            name: "sender",
            label: Lng.gt("Sender"),
            description: Lng.gt("SenderDescription"),
            isRequired: false,
            input: {
                type: "dataview",
                query: "app.plugins.plugins.prj.api.documentModel.getAllSenderRecipients()"
            }
        };
        form.fields.push(sender);

        // Recipient
        const recipient: Field = {
            name: "recipient",
            label: Lng.gt("Recipient"),
            description: Lng.gt("RecipientDescription"),
            isRequired: false,
            input: {
                type: "dataview",
                query: "app.plugins.plugins.prj.api.documentModel.getAllSenderRecipients()"
            }
        };
        form.fields.push(recipient);

        // Hide
        const hide: Field = {
            name: "hide",
            label: Lng.gt("Hide"),
            description: Lng.gt("HideDescription"),
            isRequired: false,
            input: {
                type: "toggle"
            }
        };
        form.fields.push(hide);

        // Tags
        const tags: Field = {
            name: "tags",
            label: Lng.gt("Tags"),
            description: Lng.gt("TagsDescription"),
            isRequired: false,
            input: {
                type: "tag"
            }
        };
        form.fields.push(tags);

        // File
        const file: Field = {
            name: "file",
            label: Lng.gt("File"),
            description: Lng.gt("FileDescription"),
            isRequired: false,
            input: {
                type: "dataview",
                query: "app.plugins.plugins.prj.api.documentModel.getAllPDFsWithoutMetadata().map(file => file.name)"
            }
        };
        form.fields.push(file);

        return form;
    }
}