import { Setting, TFile } from 'obsidian';
import API from 'src/classes/API';
import type { IApp } from 'src/interfaces/IApp';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { IPrj } from 'src/interfaces/IPrj';
import type { IPrjData_ } from 'src/models/Data/interfaces/IPrjData';
import { IPrjDocument } from 'src/models/Data/interfaces/IPrjDocument';
import { PrjDocumentData } from 'src/models/Data/PrjDocumentData';
import { DocumentModel } from 'src/models/DocumentModel';
import type { IPrjModel_ } from 'src/models/interfaces/IPrjModel';
import type { IPrjSettings } from 'src/types/PrjSettings';
import PrjTypes, { FileSubType } from 'src/types/PrjTypes';
import { Inject, resolve } from 'ts-injex';
import type { ForceConstructor } from 'ts-injex';
import type {
    ICustomModal_,
    ICustomModal,
} from './CustomModal/interfaces/ICustomModal';
import type { IHelperGeneral_ } from '../Helper/General';
import type { IHelperObsidian } from '../Helper/interfaces/IHelperObsidian';
import { GenericSuggest } from '../Settings/components/GenericSuggest';
import type { ISettingRow_ } from '../Settings/interfaces/ISettingRow';
import type { ITags, ITags_ } from '../Tags/interfaces/ITags';
import type ITranslationService from '../TranslationService/interfaces/ITranslationService';

/**
 * Represents a modal to create new metadata
 */
export class CreateNewMetadataModal {
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
    @Inject('ICustomModal_')
    private readonly _ICustomModal_!: ICustomModal_;
    @Inject('ITranslationService')
    private readonly _ITranslationService!: ITranslationService;
    @Inject('Obsidian.Setting_')
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private readonly _Setting_!: ForceConstructor<Setting>;
    @Inject('IPrjDocument_')
    private readonly _IPrjDocument_!: IPrjData_<PrjDocumentData>;
    @Inject('DocumentModel_')
    private readonly _IDocumentModel_!: IPrjModel_<DocumentModel>;
    @Inject('IPrjSettings')
    private readonly _IPrjSettings!: IPrjSettings;
    @Inject('ITags_')
    private readonly _ITags_: ITags_;
    @Inject('ISettingRow_')
    private readonly _ISetting_: ISettingRow_;

    private readonly _customModal: ICustomModal = new this._ICustomModal_();

    private readonly _result: Partial<Record<keyof IPrjDocument, unknown>> = {};
    temp: GenericSuggest<string>;

    /**
     * Creates an instance of the CreateNewMetadataModal class
     */
    constructor() {
        this._customModal
            .setBackgroundDimmed(false)
            .setDraggableEnabled(true)
            .setOnOpen(this.onOpen.bind(this))
            .open();
    }

    /**
     * Saves the result of the modal
     * to a new metadata file
     */
    private async save(): Promise<void> {
        const document = new this._IDocumentModel_(undefined);

        const folder = this._IPrjSettings.documentSettings.defaultFolder;

        (this._result.subType as FileSubType | undefined) =
            PrjTypes.isValidFileSubType(this._result.subType);

        const linkedFile = this._IMetadataCache.getFileByLink(
            this._result.file as string,
            '',
        );

        (this._result.file as string | undefined) = this._result.file
            ? document.setLinkedFile(linkedFile, folder)
            : undefined;

        document.data = this._result as Partial<IPrjDocument>;

        // No existing file, create a new one
        let template = '';

        // If a template is set, use it
        const templateFile = this._IApp.vault.getAbstractFileByPath(
            this._IPrjSettings.documentSettings.template,
        );

        if (templateFile && templateFile instanceof TFile) {
            try {
                template = await this._IApp.vault.read(templateFile);
            } catch (error) {
                this._logger?.error(
                    `Error reading template file '${templateFile.path}'`,
                    error,
                );
            }
        }

        const newFileName =
            API.documentModel.generateMetadataFilename(document);

        await document.createFile(folder, newFileName, template);

        if (document) await this._IHelperObsidian.openFile(document.file);
    }

    /**
     * Builds the content of the modal
     */
    private onOpen(): void {
        this._customModal.content.addClass('custom-form');

        this._customModal.setTitle(
            this._ITranslationService.get('Create new metadata'),
        );

        // Sub type
        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('Metadata sub type'))
                .setDescription(
                    this._ITranslationService.get(
                        'Metadata sub type description',
                    ),
                )
                .add('dropdown', (dropdown) => {
                    dropdown
                        .onChange((item) => {
                            this._result.subType = item.key;
                        })
                        .setOptions([
                            {
                                key: 'none',
                                value: this._ITranslationService.get('None'),
                            },
                            {
                                key: 'Cluster',
                                value: this._ITranslationService.get(
                                    'Metadata Cluster',
                                ),
                            },
                        ]);
                });
        });

        // Date
        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('Document date'))
                .setDescription(
                    this._ITranslationService.get('Document date description'),
                )
                .add('input', (input) => {
                    input
                        .setPlaceholder('YYYY.MM.DD')
                        .onChange((value) => {
                            this._result.date = value;
                        })
                        .setType('date');
                });
        });

        // Date of delivery
        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('Date of delivery'))
                .setDescription(
                    this._ITranslationService.get(
                        'Date of delivery description',
                    ),
                )
                .add('input', (input) => {
                    input
                        .setPlaceholder('YYYY.MM.DD')
                        .onChange((value) => {
                            this._result.dateOfDelivery = value;
                        })
                        .setType('date');
                });
        });

        // Title
        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('Title'))
                .setDescription(
                    this._ITranslationService.get('Title description'),
                )
                .add('input', (input) => {
                    input
                        .setPlaceholder(this._ITranslationService.get('Title'))
                        .onChange((value) => {
                            this._result.title = value;
                        });
                });
        });

        // Description
        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('Description'))
                .setDescription(
                    this._ITranslationService.get('Description description'),
                )
                .setClass('custom-form-textarea')
                .add('input', (input) => {
                    input
                        .setInputElType('HTMLTextAreaElement')
                        .setPlaceholder(
                            this._ITranslationService.get('Description'),
                        )
                        .onChange((value) => {
                            this._result.description = value;
                        });
                });
        });

        // Sender
        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('Sender'))
                .setDescription(
                    this._ITranslationService.get('Sender description'),
                )
                .add('input', (input) => {
                    input
                        .setPlaceholder(this._ITranslationService.get('Sender'))
                        .onChange((value) => {
                            this._result.sender = value;
                        })
                        .addSuggestion((_input) =>
                            (
                                this._IDocumentModel_ as unknown as {
                                    getAllSenderRecipients(): string[];
                                }
                            ).getAllSenderRecipients(),
                        );
                });
        });

        // Recipient
        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('Recipient'))
                .setDescription(
                    this._ITranslationService.get('Recipient description'),
                )
                .add('input', (input) => {
                    input
                        .setPlaceholder(
                            this._ITranslationService.get('Recipient'),
                        )
                        .onChange((value) => {
                            this._result.recipient = value;
                        })
                        .addSuggestion((_input) =>
                            (
                                this._IDocumentModel_ as unknown as {
                                    getAllSenderRecipients(): string[];
                                }
                            ).getAllSenderRecipients(),
                        );
                });
        });

        // Hide (Toggle)
        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('Hide'))
                .setDescription(
                    this._ITranslationService.get('Hide description'),
                )
                .add('toggle', (input) => {
                    input.onChange((value) => {
                        this._result.hide = value;
                    });
                });
        });

        // Dont change PDF path (Toggle)
        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('Dont change PDF path'))
                .setDescription(
                    this._ITranslationService.get(
                        'Dont change PDF path description',
                    ),
                )
                .add('toggle', (input) => {
                    input.onChange((value) => {
                        this._result.dontChangePdfPath = value;
                    });
                });
        });

        // Tags test..
        this._result.tags = new this._ITags_(undefined);

        const tags = this._IMetadataCache.cache
            .map((tag) => tag?.metadata?.frontmatter?.tags)
            .filter((tag) => tag !== undefined) as string[][];

        const tagsFlat = tags.flat();
        const tagsSet = new Set(tagsFlat);

        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('Tags'))
                .setDescription(
                    this._ITranslationService.get('Tags description'),
                )
                .add('tagsearch', (tagSearch) => {
                    tagSearch
                        .setDefaultEntries(() => {
                            const activeFile =
                                this._IHelperObsidian.getActiveFile();
                            const activeFileTags = new this._ITags_(undefined);
                            activeFileTags.loadTagsFromFile(activeFile);

                            return activeFileTags.value || [];
                        })
                        .setList(this._result.tags as ITags)
                        .setPlaceholder(this._ITranslationService.get('Tags'))
                        .addSuggestion(() => {
                            return Array.from(tagsSet);
                        });
                });
        });

        // File (Text)
        new this._ISetting_(this._customModal, (setting) => {
            setting
                .setName(this._ITranslationService.get('File'))
                .setDescription(
                    this._ITranslationService.get('File description'),
                )
                .add('input', (input) => {
                    input
                        .setPlaceholder(this._ITranslationService.get('File'))
                        .onChange((value) => {
                            this._result.file = value;
                        })
                        .addSuggestion((_input) =>
                            (
                                this._IDocumentModel_ as unknown as {
                                    getAllPDFsWithoutMetadata(): TFile[];
                                }
                            )
                                .getAllPDFsWithoutMetadata()
                                .map((file) => file.name),
                        );
                });
        });

        new this._ISetting_(this._customModal, (setting) => {
            setting
                .add('button', (btn) =>
                    btn
                        .setButtonText(this._ITranslationService.get('Save'))
                        .setCta(true)
                        .onClick(() => {
                            this.save();
                            this._customModal.close();
                        }),
                )
                .add('button', (btn) =>
                    btn
                        .setButtonText(this._ITranslationService.get('Cancel'))
                        .setCta(true)
                        .onClick(() => {
                            this._customModal.close();
                        }),
                );
        });
    }

    /**
     * Registers the command to open the modal
     */
    public static registerCommand(): void {
        const plugin = resolve<IPrj>('IPrj');

        const iTranslationService = resolve<ITranslationService>(
            'ITranslationService',
        );

        const logger = resolve<ILogger_>('ILogger_').getLogger(
            'CreateNewMetadataModal',
        );

        try {
            plugin.addCommand({
                id: 'create-new-metadata-file',
                name: `${iTranslationService.get('Create new metadata')}`,
                /**
                 * Callback function for the command
                 */
                callback: async () => {
                    new this();
                },
            });

            logger?.trace(
                "Registered 'Create New Metadata Modal' command successfully",
            );
        } catch (error) {
            logger?.error(
                "Failed to register 'Create New Metadata Modal' command",
                error,
            );
        }
    }
}
