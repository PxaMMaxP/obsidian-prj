import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import { Field, FormConfiguration, IFormResult } from 'src/types/ModalFormType';
import BaseModalForm from './BaseModalForm';
import Helper from '../Helper';
import Logging from 'src/classes/Logging';

/**
 * Modal to create a new metadata file
 */
export default class AddAnnotationModal extends BaseModalForm {
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
        const logger = Logging.getLogger('AddAnnotationModal');
        logger.trace("Registering 'AddAnnotationModal' commands");

        global.plugin.addCommand({
            id: 'add-annotation-modal',
            name: `${Lng.gt('Add annotation')}`,
            callback: async () => {
                const modal = new AddAnnotationModal();
                const result = await modal.openForm();

                if (result) {
                    await modal.evaluateForm(result);
                }
            },
        });
    }

    /**
     * Opens the modal form
     * @returns {Promise<IFormResult | undefined>} Result of the form
     */
    public async openForm(
        preset?: Partial<unknown>,
    ): Promise<IFormResult | undefined> {
        if (!this.isApiAvailable()) return;
        this.logger.trace("Opening 'CreateNewMetadataModal' form");

        const form = this.constructForm();
        const result = await this.getApi().openForm(form);

        this.logger.trace(
            `From closes with status '${result.status}' and data:`,
            result.data,
        );

        return result;
    }

    public async evaluateForm(
        result: IFormResult,
    ): Promise<string | undefined> {
        if (!this.isApiAvailable()) return;

        if (result.status !== 'ok' || !result.data) return;

        let uidBase = '';

        for (const [key, value] of Object.entries(result.data)) {
            if (value !== '') {
                uidBase += result.data[key] as string;
            }
        }

        const id = Helper.generateUID(uidBase, 11);
        const activeFile = Helper.getActiveFile();

        const template = `
>_${result.data.prefix ?? ' '}_
>==${result.data.citation ?? ' '}== 
>_${result.data.postfix ?? ' '}_
>
>Link: [[#^${id}|Zeige Zitat]]
><!-- [[${activeFile?.basename}#^${id}|ZitierterText]] -->
>Kommentar: 
>**${result.data.comment ?? ' '}**
>
>Stelle:
>${result.data.place ? `##${result.data.place}` : ''}
^${id}
`;

        if (!activeFile) return;
        this.global.app.vault.append(activeFile, template);
    }

    /**
     * Constructs the form
     * @returns {FormConfiguration} Form configuration
     */
    protected constructForm(): FormConfiguration {
        const form: FormConfiguration = {
            title: `${Lng.gt('Add annotation')}`,
            name: 'new metadata file',
            customClassname: 'annotation-form',
            fields: [],
        };

        // Prefix
        const prefix: Field = {
            name: 'prefix',
            label: Lng.gt('Prefix'),
            description: Lng.gt('Prefix description'),
            isRequired: false,
            input: {
                type: 'textarea',
            },
        };
        form.fields.push(prefix);

        // Citation
        const citation: Field = {
            name: 'citation',
            label: Lng.gt('Citation'),
            description: Lng.gt('Citation description'),
            isRequired: false,
            input: {
                type: 'textarea',
            },
        };
        form.fields.push(citation);

        // Postfix
        const postfix: Field = {
            name: 'postfix',
            label: Lng.gt('Postfix'),
            description: Lng.gt('Postfix description'),
            isRequired: false,
            input: {
                type: 'textarea',
            },
        };
        form.fields.push(postfix);

        // Place
        const place: Field = {
            name: 'place',
            label: Lng.gt('Place'),
            description: Lng.gt('Place description'),
            isRequired: false,
            input: {
                type: 'text',
            },
        };
        form.fields.push(place);

        // Comment
        const comment: Field = {
            name: 'comment',
            label: Lng.gt('Comment'),
            description: Lng.gt('Comment description'),
            isRequired: false,
            input: {
                type: 'textarea',
            },
        };
        form.fields.push(comment);

        return form;
    }
}
