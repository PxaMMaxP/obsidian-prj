import { Setting, TFile } from 'obsidian';
import Lng from 'src/classes/Lng';
import type { IApp } from 'src/interfaces/IApp';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { IPrj } from 'src/interfaces/IPrj';
import type {
    ICustomModal_,
    ICustomModal,
} from './CustomModal/interfaces/ICustomModal';
import { Inject } from '../DependencyInjection/decorators/Inject';
import { Resolve } from '../DependencyInjection/functions/Resolve';
import { FileType } from '../FileType/FileType';
import type { IHelperGeneral_ } from '../Helper/General';

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
    @Inject('ICustomModal_')
    private readonly _ICustomModal_!: ICustomModal_;

    private readonly _customModal: ICustomModal = new this._ICustomModal_();

    private _activeFile?: TFile;
    protected _annotation: {
        prefix: string;
        citation: string;
        postfix: string;
        place: string;
        comment: string;
        readonly toString: () => string;
    } = {
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
        const workspace = this._IApp.workspace;
        const activeFile = workspace.getActiveFile();

        if (!activeFile) {
            return false;
        }
        const activeFileMetadata = this._IMetadataCache.getEntry(activeFile);
        const type = activeFileMetadata?.metadata.frontmatter?.type;

        if (!FileType.isValidOf(type, ['Metadata'])) {
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

        const template = `
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

        if (!this._activeFile) return;
        this._IApp.vault.append(this._activeFile, template);
    }

    /**
     * Builds the content of the modal
     */
    private onOpen(): void {
        this._customModal.content.addClass('custom-form');
        this._customModal.setTitle(Lng.gt('Add annotation'));

        new Setting(this._customModal.content)
            .setName(Lng.gt('Prefix'))
            .setDesc(Lng.gt('Prefix description'))
            .setClass('custom-form-textarea')
            .setClass('smalerHeight')
            .addTextArea((text) => {
                text.setPlaceholder(Lng.gt('Prefix'))
                    .setValue('')
                    .onChange((value) => {
                        this._annotation.prefix = value;
                    });
            });

        new Setting(this._customModal.content)
            .setName(Lng.gt('Citation'))
            .setDesc(Lng.gt('Citation description'))
            .setClass('custom-form-textarea')
            .addTextArea((text) => {
                text.setPlaceholder(Lng.gt('Citation'))
                    .setValue('')
                    .onChange((value) => {
                        this._annotation.citation = value;
                    });
            });

        new Setting(this._customModal.content)
            .setName(Lng.gt('Postfix'))
            .setDesc(Lng.gt('Postfix description'))
            .setClass('custom-form-textarea')
            .setClass('smalerHeight')
            .addTextArea((text) => {
                text.setPlaceholder(Lng.gt('Postfix'))
                    .setValue('')
                    .onChange((value) => {
                        this._annotation.postfix = value;
                    });
            });

        new Setting(this._customModal.content)
            .setName(Lng.gt('Place'))
            .setDesc(Lng.gt('Place description'))
            .addText((text) => {
                text.setPlaceholder(Lng.gt('Place'))
                    .setValue('')
                    .onChange((value) => {
                        this._annotation.place = value;
                    });
            });

        new Setting(this._customModal.content)
            .setName(Lng.gt('Comment'))
            .setDesc(Lng.gt('Comment description'))
            .setClass('custom-form-textarea')
            .addTextArea((text) => {
                text.setPlaceholder(Lng.gt('Comment'))
                    .setValue('')
                    .onChange((value) => {
                        this._annotation.comment = value;
                    });
            });

        new Setting(this._customModal.content)
            .addButton((btn) =>
                btn
                    .setButtonText(Lng.gt('Save'))
                    .setCta()
                    .onClick(() => {
                        this.save();
                        this._customModal.close();
                    }),
            )
            .addButton((btn) =>
                btn
                    .setButtonText(Lng.gt('Cancel'))
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
        const plugin = Resolve<IPrj>('IPrj');

        const logger =
            Resolve<ILogger_>('ILogger_').getLogger('AddAnnotationModal');

        try {
            plugin.addCommand({
                id: 'add-annotation-modal',
                name: `${Lng.gt('Add annotation')}`,
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
