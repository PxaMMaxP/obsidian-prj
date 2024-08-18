import { Setting, TFile } from 'obsidian';
import type { IApp } from 'src/interfaces/IApp';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { IPrj } from 'src/interfaces/IPrj';
import { Inject } from 'ts-injex';
import { resolve } from 'ts-injex';
import type { ForceConstructor } from 'ts-injex';
import type {
    IModal_,
    IModal,
} from './CustomModal/interfaces/IModal';
import { FileType } from '../FileType/FileType';
import type { IHelperGeneral_ } from '../Helper/General';
import type { IHelperObsidian } from '../Helper/interfaces/IHelperObsidian';
import type ITranslationService from '../TranslationService/interfaces/ITranslationService';

/**
 * Modal to create a new annotation
 */
export default class AddAnnotationModal {
    @Inject(
        'ILogger_',
        (x: ILogger_) => x.getLogger('AddAnnotationModal'),
        false,
    )
    protected readonly _logger?: ILogger;
    @Inject('IApp')
    protected readonly _IApp!: IApp;
    @Inject('IMetadataCache')
    private readonly _IMetadataCache!: IMetadataCache;
    @Inject('IHelperGeneral_')
    private readonly _IHelperGeneral!: IHelperGeneral_;
    @Inject('IHelperObsidian')
    private readonly _IHelperObsidian!: IHelperObsidian;
    @Inject('IModal_')
    private readonly _ICustomModal_!: IModal_;
    @Inject('ITranslationService')
    private readonly _ITranslationService!: ITranslationService;
    @Inject('Obsidian.Setting_')
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private readonly _Setting_!: ForceConstructor<Setting>;

    private readonly _customModal: IModal = new this._ICustomModal_();

    private _activeFile?: TFile;
    protected _annotation: Annotation = {
        prefix: '',
        citation: '',
        postfix: '',
        place: '',
        comment: '',
        toString: () => {
            const text = this._annotation;

            return `${text.prefix} ${text.citation} ${text.postfix} ${text.place} ${text.comment}`;
        },
    };

    /**
     * Creates and opens a Add Annotation modal.
     */
    constructor() {
        this._customModal
            .setBackgroundDimmed(false)
            .setDraggableEnabled(true)
            .setShouldOpen(this.shouldOpen.bind(this))
            .setOnOpen(this.onOpen.bind(this))
            .open();
    }

    /**
     * Checks if the active file is a metadata file
     * @returns True if the active file is a metadata file
     */
    private shouldOpen(): boolean {
        const activeFile = this._IHelperObsidian.getActiveFile();

        if (!activeFile) {
            this._IHelperObsidian.showNotice('No active file found', 2500);

            return false;
        }
        const activeFileMetadata = this._IMetadataCache.getEntry(activeFile);
        const type = activeFileMetadata?.metadata.frontmatter?.type;

        if (!FileType.isValidOf(type, ['Metadata'])) {
            this._IHelperObsidian.showNotice(
                'The active file is not a metadata file',
                2500,
            );

            return false;
        }

        this._activeFile = activeFile;

        return true;
    }

    /**
     * Saves the annotation to the active file
     */
    private save(): void {
        const id = this._IHelperGeneral.generateUID(
            this._annotation.toString(),
            11,
        );

        const template = this.generateAnnotationTemplate(id);

        if (!this._activeFile) return;
        this._IApp.vault.append(this._activeFile, template);
    }

    /**
     * Generates the annotation template
     * @param id The unique id of the annotation
     * @returns The annotation template
     */
    private generateAnnotationTemplate(id: string): string {
        return `
>_${this._annotation.prefix ?? ' '}_
>==${this._annotation.citation ?? ' '}== 
>_${this._annotation.postfix ?? ' '}_
>
>Link: [[#^${id}|Zeige Zitat]]
><!-- [[${this._activeFile?.basename}#^${id}|ZitierterText]] -->
>Kommentar: 
>**${this._annotation.comment ?? ' '}**
>
>Stelle:
>${this._annotation.place ? `##${this._annotation.place}` : ''}
^${id}
`;
    }

    /**
     * Builds the content of the modal
     */
    private onOpen(): void {
        this._customModal.content.addClass('custom-form');

        this._customModal.setTitle(
            this._ITranslationService.get('Add annotation'),
        );

        new this._Setting_(this._customModal.content)
            .setName(this._ITranslationService.get('Prefix'))
            .setDesc(this._ITranslationService.get('Prefix description'))
            .setClass('custom-form-textarea')
            .setClass('smalerHeight')
            .addTextArea((text) => {
                text.setPlaceholder(this._ITranslationService.get('Prefix'))
                    .setValue('')
                    .onChange((value) => {
                        this._annotation.prefix = value;
                    });
            });

        new this._Setting_(this._customModal.content)
            .setName(this._ITranslationService.get('Citation'))
            .setDesc(this._ITranslationService.get('Citation description'))
            .setClass('custom-form-textarea')
            .addTextArea((text) => {
                text.setPlaceholder(this._ITranslationService.get('Citation'))
                    .setValue('')
                    .onChange((value) => {
                        this._annotation.citation = value;
                    });
            });

        new this._Setting_(this._customModal.content)
            .setName(this._ITranslationService.get('Postfix'))
            .setDesc(this._ITranslationService.get('Postfix description'))
            .setClass('custom-form-textarea')
            .setClass('smalerHeight')
            .addTextArea((text) => {
                text.setPlaceholder(this._ITranslationService.get('Postfix'))
                    .setValue('')
                    .onChange((value) => {
                        this._annotation.postfix = value;
                    });
            });

        new this._Setting_(this._customModal.content)
            .setName(this._ITranslationService.get('Place'))
            .setDesc(this._ITranslationService.get('Place description'))
            .addText((text) => {
                text.setPlaceholder(this._ITranslationService.get('Place'))
                    .setValue('')
                    .onChange((value) => {
                        this._annotation.place = value;
                    });
            });

        new this._Setting_(this._customModal.content)
            .setName(this._ITranslationService.get('Comment'))
            .setDesc(this._ITranslationService.get('Comment description'))
            .setClass('custom-form-textarea')
            .addTextArea((text) => {
                text.setPlaceholder(this._ITranslationService.get('Comment'))
                    .setValue('')
                    .onChange((value) => {
                        this._annotation.comment = value;
                    });
            });

        new this._Setting_(this._customModal.content)
            .addButton((btn) =>
                btn
                    .setButtonText(this._ITranslationService.get('Save'))
                    .setCta()
                    .onClick(() => {
                        this.save();
                        this._customModal.close();
                    }),
            )
            .addButton((btn) =>
                btn
                    .setButtonText(this._ITranslationService.get('Cancel'))
                    .setCta()
                    .onClick(() => {
                        this._customModal.close();
                    }),
            );
    }

    /**
     * Registers the command to open the modal
     */
    public static registerCommand(): void {
        const plugin = resolve<IPrj>('IPrj');

        const iTranslationService = resolve<ITranslationService>(
            'ITranslationService',
        );

        const logger =
            resolve<ILogger_>('ILogger_').getLogger('AddAnnotationModal');

        try {
            plugin.addCommand({
                id: 'add-annotation-modal',
                name: `${iTranslationService.get('Add annotation')}`,
                /**
                 * Callback function for the command
                 */
                callback: async () => {
                    new AddAnnotationModal();
                },
            });

            logger?.trace(
                "Registered 'Add Annotation Modal' command successfully",
            );
        } catch (error) {
            logger?.error(
                "Failed to register 'Add Annotation Modal' command",
                error,
            );
        }
    }
}

/**
 * The annotation object
 */
interface Annotation {
    prefix: string;
    citation: string;
    postfix: string;
    place: string;
    comment: string;
    /**
     * Converts the annotation to a string
     * @returns The annotation as a concatenated string
     */
    toString: () => string;
}
