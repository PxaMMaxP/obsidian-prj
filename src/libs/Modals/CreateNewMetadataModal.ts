import { App, TFile } from "obsidian";
import path from "path";
import Global from "src/classes/Global";
import Lng from "src/classes/Lng";
import { DocumentModel } from "src/models/DocumentModel";
import DocumentData from "src/types/DocumentData";
import { Field, FormConfiguration, IFormResult, IModalForm, IResultData } from "src/types/ModalFormType";

/**
 * Modal to create a new metadata file
 */
export default class CreateNewMetadataModal {
    private app: App = Global.getInstance().app;
    private settings = Global.getInstance().settings;
    private logger = Global.getInstance().logger;
    private modalFormApi: IModalForm;

    /**
     * Creates an instance of CreateNewMetadataModal.
     */
    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const modalFormApi = (this.app as any).plugins.plugins.modalforms.api as IModalForm;
        if (!modalFormApi) {
            this.logger.error("ModalForms API not found");
        } else {
            this.logger.trace("ModalForms API found");
            this.modalFormApi = modalFormApi;
        }
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
                    await modal.evaluateForm(result);
                }
            },
        })
    }

    /**
     * Checks if the ModalForms API is available
     * @returns {boolean} True if the API is available
     * @remarks Log an error if the API is not available
     */
    private isApiAvailable(): boolean {
        if (!this.modalFormApi) this.logger.error("ModalForms API not found");
        return !!this.modalFormApi;
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
        const form = this.constructForm();
        const result = await this.modalFormApi.openForm(form, { values: convertedPreset });
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
     * - returns the metadata file.
     */
    public async evaluateForm(result: IFormResult): Promise<DocumentModel | undefined> {
        if (!this.isApiAvailable()) return;
        if (result.status !== "ok" || !result.data) return;

        const folder = this.settings.documentSettings.defaultFolder;

        const document = new DocumentModel(undefined);
        document.data.type = "Metadata";

        if (result.data.file && typeof result.data.file === "string") {
            this.logger.trace(`Searching file '${result.data.file}'`);
            const baseFile = Global.getInstance().fileCache.findFileByName(result.data.file);
            if (!(baseFile && baseFile instanceof TFile)) {
                this.logger.warn(`File '${result.data.file}' not found`);
            } else {
                document.setLinkedFile(baseFile, folder);
            }
        }

        // SubType
        if (result.data.subType &&
            typeof result.data.subType === "string" &&
            result.data.subType === "Cluster") {
            document.data.subType = result.data.subType;
        }
        // Date
        if (result.data.date && typeof result.data.date === "string") {
            document.data.date = result.data.date;
        }
        // Date of delivery
        if (result.data.dateOfDelivery && typeof result.data.dateOfDelivery === "string") {
            document.data.dateOfDelivery = result.data.dateOfDelivery;
        }
        // Title
        if (result.data.title && typeof result.data.title === "string") {
            document.data.title = result.data.title;
        }
        // Description
        if (result.data.description && typeof result.data.description === "string") {
            document.data.description = result.data.description;
        }
        // Sender
        if (result.data.sender && typeof result.data.sender === "string") {
            document.data.sender = result.data.sender;
        }
        // Recipient
        if (result.data.recipient && typeof result.data.recipient === "string") {
            document.data.recipient = result.data.recipient;
        }
        // Hide
        if (result.data.hide && typeof result.data.hide === "boolean") {
            document.data.hide = result.data.hide;
        }
        // Tags
        if (result.data.tags && Array.isArray(result.data.tags) || typeof result.data.tags === "string") {
            document.data.tags = result.data.tags;
        }
        const newFileName = DocumentModel.api.generateMetadataFilename(document);

        const file = await this.app.vault.create(path.join(folder, `${newFileName}.md`), ``);
        document.file = file;

        return document;
    }

    /**
     * Constructs the form
     * @returns {FormConfiguration} Form configuration
     */
    private constructForm(): FormConfiguration {
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
            isRequired: true,
            input: {
                type: "dataview",
                query: "app.plugins.plugins.prj.api.documentModel.getAllPDFsWithoutMetadata().map(file => file.name)"
            }
        };
        form.fields.push(file);

        return form;
    }
}