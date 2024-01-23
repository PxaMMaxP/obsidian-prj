import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import { DocumentModel } from 'src/models/DocumentModel';
import DocumentData from 'src/types/DocumentData';
import {
    Field,
    FormConfiguration,
    IFormResult,
    IResultData,
} from 'src/types/ModalFormType';
import BaseModalForm from './BaseModalForm';
import Helper from '../Helper';
import PrjTypes, { FileSubType } from 'src/types/PrjTypes';
import API from 'src/classes/API';
import { TFile } from 'obsidian';
import { Path } from 'src/classes/Path';

/**
 * Modal to create a new metadata file
 */
export default class CreateNewMetadataModal extends BaseModalForm {
    private _fileCache = Global.getInstance().fileCache;

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
            id: 'create-new-metadata-file',
            name: `${Lng.gt('Create new metadata')}`,
            callback: async () => {
                const modal = new CreateNewMetadataModal();
                const result = await modal.openForm();

                if (result) {
                    const document = await modal.evaluateForm(result);

                    if (document) await Helper.openFile(document.file);
                }
            },
        });
    }

    /**
     * Opens the modal form
     * @param {Partial<DocumentData>} [preset] Preset values for the form
     * @returns {Promise<IFormResult | undefined>} Result of the form
     */
    public async openForm(
        preset?: Partial<DocumentData>,
    ): Promise<IFormResult | undefined> {
        if (!this.isApiAvailable()) return;
        this.logger.trace("Opening 'CreateNewMetadataModal' form");
        const convertedPreset: IResultData = {};

        if (preset) {
            for (const [key, value] of Object.entries(preset)) {
                convertedPreset[key] = value ?? '';
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

        const result = await this.getApi().openForm(form, {
            values: convertedPreset,
        });

        this.logger.trace(
            `From closes with status '${result.status}' and data:`,
            result.data,
        );

        return result;
    }

    /**
     * Evaluates the form result and creates a new metadata file
     * @param {IFormResult} result Result of the form
     * @returns {Promise<DocumentModel | undefined>} The created metadata file
     * @remarks 1. Creates a new Document model with the give file or no file.
     * 2. Sets the data of the document model to the form result.
     * 3. Creates a new file with the metadata filename or uses the existing file and rename it.
     */
    public async evaluateForm(
        result: IFormResult,
        existingFile?: TFile,
    ): Promise<DocumentModel | undefined> {
        if (!this.isApiAvailable()) return;

        if (result.status !== 'ok' || !result.data) return;

        const document = new DocumentModel(
            existingFile ? existingFile : undefined,
        );

        const folder = existingFile?.parent?.path
            ? existingFile.parent?.path
            : this.settings.documentSettings.defaultFolder;

        (result.data.subType as FileSubType | undefined) =
            PrjTypes.isValidFileSubType(result.data.subType);

        const linkedFile = this._fileCache.findFileByLinkText(
            result.data.file as string,
            '',
        );

        (result.data.file as string | undefined) = result.data.file
            ? document.setLinkedFile(linkedFile, folder)
            : undefined;

        document.data = result.data as Partial<DocumentData>;

        if (!existingFile) {
            // No existing file, create a new one
            let template = '';

            // If a template is set, use it
            const templateFile = this.app.vault.getAbstractFileByPath(
                this.settings.documentSettings.template,
            );

            if (templateFile && templateFile instanceof TFile) {
                try {
                    template = await this.app.vault.read(templateFile);
                } catch (error) {
                    this.logger.error(
                        `Error reading template file '${templateFile.path}'`,
                        error,
                    );
                }
            }

            const newFileName =
                API.documentModel.generateMetadataFilename(document);

            const file = await this.app.vault.create(
                Path.join(folder, `${newFileName}.md`),
                template,
            );
            document.file = file;
        } else {
            // Existing file, rename it properly
            await API.documentModel.syncMetadataToFile(document.file);
        }

        return document;
    }

    /**
     * Constructs the form
     * @returns {FormConfiguration} Form configuration
     */
    protected constructForm(): FormConfiguration {
        const form: FormConfiguration = {
            title: `${Lng.gt('Create new metadata')}`,
            name: 'new metadata file',
            customClassname: '',
            fields: [],
        };

        // Sub type
        const subType: Field = {
            name: 'subType',
            label: Lng.gt('Metadata sub type'),
            description: Lng.gt('Metadata sub type description'),
            isRequired: true,
            input: {
                type: 'select',
                source: 'fixed',
                options: [
                    { value: 'none', label: Lng.gt('None') },
                    { value: 'Cluster', label: Lng.gt('Metadata Cluster') },
                ],
            },
        };
        form.fields.push(subType);

        // Date
        const date: Field = {
            name: 'date',
            label: Lng.gt('Document date'),
            description: Lng.gt('Document date description'),
            isRequired: false,
            input: {
                type: 'date',
            },
        };
        form.fields.push(date);

        // Date of delivery
        const dateOfDelivery: Field = {
            name: 'dateOfDelivery',
            label: Lng.gt('Date of delivery'),
            description: Lng.gt('Date of delivery description'),
            isRequired: false,
            input: {
                type: 'date',
            },
        };
        form.fields.push(dateOfDelivery);

        // Title
        const title: Field = {
            name: 'title',
            label: Lng.gt('Title'),
            description: Lng.gt('Title description'),
            isRequired: true,
            input: {
                type: 'text',
            },
        };
        form.fields.push(title);

        // Description
        const description: Field = {
            name: 'description',
            label: Lng.gt('Document description'),
            description: Lng.gt('Document description description'),
            isRequired: false,
            input: {
                type: 'textarea',
            },
        };
        form.fields.push(description);

        // Sender
        const sender: Field = {
            name: 'sender',
            label: Lng.gt('Sender'),
            description: Lng.gt('Sender description'),
            isRequired: false,
            input: {
                type: 'dataview',
                query: 'app.plugins.plugins.prj.api.documentModel.getAllSenderRecipients()',
            },
        };
        form.fields.push(sender);

        // Recipient
        const recipient: Field = {
            name: 'recipient',
            label: Lng.gt('Recipient'),
            description: Lng.gt('Recipient description'),
            isRequired: false,
            input: {
                type: 'dataview',
                query: 'app.plugins.plugins.prj.api.documentModel.getAllSenderRecipients()',
            },
        };
        form.fields.push(recipient);

        // Hide
        const hide: Field = {
            name: 'hide',
            label: Lng.gt('Hide'),
            description: Lng.gt('Hide description'),
            isRequired: false,
            input: {
                type: 'toggle',
            },
        };
        form.fields.push(hide);

        // Dont change PDF path
        const dontChangePdfPath: Field = {
            name: 'dontChangePdfPath',
            label: Lng.gt('Dont change PDF Path'),
            description: Lng.gt('Dont change PDF Path description'),
            isRequired: false,
            input: {
                type: 'toggle',
            },
        };
        form.fields.push(dontChangePdfPath);

        // Tags
        const tags: Field = {
            name: 'tags',
            label: Lng.gt('Tags'),
            description: Lng.gt('Tags description'),
            isRequired: false,
            input: {
                type: 'tag',
            },
        };
        form.fields.push(tags);

        // File
        const file: Field = {
            name: 'file',
            label: Lng.gt('PDF file'),
            description: Lng.gt('PDF file description'),
            isRequired: false,
            input: {
                type: 'dataview',
                query: 'app.plugins.plugins.prj.api.documentModel.getAllPDFsWithoutMetadata().map(file => file.name)',
            },
        };
        form.fields.push(file);

        return form;
    }
}
