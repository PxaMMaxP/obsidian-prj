import { Notice, TFile } from 'obsidian';
import API from 'src/classes/API';
import type { IApp } from 'src/interfaces/IApp';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { IPrj } from 'src/interfaces/IPrj';
import { IPrjDocument } from 'src/models/Data/interfaces/IPrjDocument';
import { DocumentModel } from 'src/models/DocumentModel';
import type { IPrjModel_ } from 'src/models/interfaces/IPrjModel';
import type { IPrjSettings } from 'src/types/PrjSettings';
import PrjTypes, { FileSubType } from 'src/types/PrjTypes';
import { Inject, resolve } from 'ts-injex';
import type {
    IModal_,
    IModal,
    IModalFluentApi,
} from './Modal/interfaces/IModal';
import { IOpenCallback } from './Modal/types/IModalCallbacks';
import type { IHelperObsidian } from '../Helper/interfaces/IHelperObsidian';
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
    protected readonly __IApp!: IApp;
    @Inject('IMetadataCache')
    private readonly __IMetadataCache!: IMetadataCache;
    @Inject('IHelperObsidian')
    private readonly __IHelperObsidian!: IHelperObsidian;
    @Inject('ITranslationService')
    private readonly __ITranslationService!: ITranslationService;
    @Inject('DocumentModel_')
    private readonly __IDocumentModel!: IPrjModel_<DocumentModel>;
    @Inject('IPrjSettings')
    private readonly __PrjSettings!: IPrjSettings;
    @Inject('ITags_')
    private readonly __ITags: ITags_;
    @Inject('Obsidian.Notice_')
    private readonly __Notice: Notice & {
        new (message: string | DocumentFragment, duration?: number): Notice;
    };

    @Inject('IModal_', (modal: IModal_) => new modal())
    private readonly _modal!: IModal;

    private readonly _result: Partial<Record<keyof IPrjDocument, unknown>> = {};

    /**
     * Creates an instance of the CreateNewMetadataModal class
     */
    constructor() {
        this._modal
            .setBackgroundDimmed(false)
            .setDraggableEnabled(true)
            .setTitle(this.__ITranslationService.get('Create new metadata'))
            .setOnOpen(this.onOpen)
            .open();
    }

    /**
     * Saves the result of the modal
     * to a new metadata file
     */
    private async save(): Promise<void> {
        const result = this._modal.result;

        const document = new this.__IDocumentModel(undefined);

        const folder = this.__PrjSettings.documentSettings.defaultFolder;

        (result.subType as FileSubType | undefined) =
            PrjTypes.isValidFileSubType(result.subType);

        const linkedFile = this.__IMetadataCache.getFileByLink(
            result.file as string,
            '',
        );

        (result.file as string | undefined) = result.file
            ? document.setLinkedFile(linkedFile, folder)
            : undefined;

        document.data = result as Partial<IPrjDocument>;

        // No existing file, create a new one
        let template = '';

        // If a template is set, use it
        const templateFile = this.__IApp.vault.getAbstractFileByPath(
            this.__PrjSettings.documentSettings.template,
        );

        if (templateFile && templateFile instanceof TFile) {
            try {
                template = await this.__IApp.vault.read(templateFile);
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

        if (document) await this.__IHelperObsidian.openFile(document.file);
    }

    /**
     * Creates the modal content
     * @param modal The modal to add the content to.
     */
    private readonly onOpen: IOpenCallback = (
        modal: IModal & IModalFluentApi,
    ) => {
        modal
            .then((modal) => modal.content.addClass('custom-form'))

            .addSettingRow((subtypeRow) => {
                subtypeRow
                    .setName(
                        this.__ITranslationService.get('Metadata sub type'),
                    )
                    .setDescription(
                        this.__ITranslationService.get(
                            'Metadata sub type description',
                        ),
                    )
                    .add('dropdown', (subtype) => {
                        subtype
                            .onChange((item) => {
                                this._result.subType = item.key;
                            })
                            .setOptions([
                                {
                                    key: 'none',
                                    value: this.__ITranslationService.get(
                                        'None',
                                    ),
                                },
                                {
                                    key: 'Cluster',
                                    value: this.__ITranslationService.get(
                                        'Metadata Cluster',
                                    ),
                                },
                            ]);
                    });
            })

            .addSettingRow((dateRow) => {
                dateRow
                    .setName(this.__ITranslationService.get('Document date'))
                    .setDescription(
                        this.__ITranslationService.get(
                            'Document date description',
                        ),
                    )
                    .add('input', (date) => {
                        date.setResultKey('date')
                            .setPlaceholder('YYYY.MM.DD')
                            .setType('date');
                    });
            })

            .addSettingRow((dateOfDeliveryRow) => {
                dateOfDeliveryRow
                    .setName(this.__ITranslationService.get('Date of delivery'))
                    .setDescription(
                        this.__ITranslationService.get(
                            'Date of delivery description',
                        ),
                    )
                    .add('input', (dateOfDelivery) => {
                        dateOfDelivery
                            .setResultKey('dateOfDelivery')
                            .setPlaceholder('YYYY.MM.DD')
                            .setType('date');
                    });
            })

            .addSettingRow((titleRow) => {
                titleRow
                    .setName(this.__ITranslationService.get('Title'))
                    .setDescription(
                        this.__ITranslationService.get('Title description'),
                    )
                    .add('input', (title) => {
                        title
                            .setResultKey('title')
                            .setRequired(true)
                            .setSpellcheck(true)
                            .setPlaceholder(
                                this.__ITranslationService.get('Title'),
                            );
                    });
            })

            .addSettingRow((descriptionRow) => {
                descriptionRow
                    .setName(this.__ITranslationService.get('Description'))
                    .setDescription(
                        this.__ITranslationService.get(
                            'Description description',
                        ),
                    )
                    .setClass('custom-form-textarea')
                    .add('input', (description) => {
                        description
                            .setResultKey('description')
                            .setSpellcheck(true)
                            .setType('textarea')
                            .setPlaceholder(
                                this.__ITranslationService.get('Description'),
                            );
                    });
            })

            .addSettingRow((senderRow) => {
                senderRow
                    .setName(this.__ITranslationService.get('Sender'))
                    .setDescription(
                        this.__ITranslationService.get('Sender description'),
                    )
                    .add('input', (sender) => {
                        sender
                            .setResultKey('sender')
                            .setPlaceholder(
                                this.__ITranslationService.get('Sender'),
                            )
                            .addSuggestion((_input) =>
                                (
                                    this.__IDocumentModel as unknown as {
                                        getAllSenderRecipients(): string[];
                                    }
                                ).getAllSenderRecipients(),
                            );
                    });
            })

            .addSettingRow((recipientRow) => {
                recipientRow
                    .setName(this.__ITranslationService.get('Recipient'))
                    .setDescription(
                        this.__ITranslationService.get('Recipient description'),
                    )
                    .add('input', (recipient) => {
                        recipient
                            .setResultKey('recipient')
                            .setPlaceholder(
                                this.__ITranslationService.get('Recipient'),
                            )
                            .addSuggestion((_input) =>
                                (
                                    this.__IDocumentModel as unknown as {
                                        getAllSenderRecipients(): string[];
                                    }
                                ).getAllSenderRecipients(),
                            );
                    });
            })

            .addSettingRow((hideRow) => {
                hideRow
                    .setName(this.__ITranslationService.get('Hide'))
                    .setDescription(
                        this.__ITranslationService.get('Hide description'),
                    )
                    .add('toggle', (hide) => {
                        hide.setResultKey('hide');
                    });
            })

            .addSettingRow((dontChangePdfPathRow) => {
                dontChangePdfPathRow
                    .setName(
                        this.__ITranslationService.get('Dont change PDF path'),
                    )
                    .setDescription(
                        this.__ITranslationService.get(
                            'Dont change PDF path description',
                        ),
                    )
                    .add('toggle', (dontChangePdfPath) => {
                        dontChangePdfPath.setResultKey('dontChangePdfPath');
                    });
            })

            .addSettingRow((tagSearchRow) => {
                this._modal.result.tags = new this.__ITags(undefined);

                const tags = this.__IMetadataCache.cache
                    .map((tag) => tag?.metadata?.frontmatter?.tags)
                    .filter((tag) => tag !== undefined) as string[][];

                const tagsFlat = tags.flat();
                const tagsSet = new Set(tagsFlat);

                tagSearchRow
                    .setName(this.__ITranslationService.get('Tags'))
                    .setDescription(
                        this.__ITranslationService.get('Tags description'),
                    )
                    .add('tagsearch', (tagSearch) => {
                        tagSearch
                            .setDefaultEntries(() => {
                                const activeFile =
                                    this.__IHelperObsidian.getActiveFile();

                                const activeFileTags = new this.__ITags(
                                    undefined,
                                );
                                activeFileTags.loadTagsFromFile(activeFile);

                                return activeFileTags.value || [];
                            })
                            .setList(this._modal.result.tags as ITags)
                            .setPlaceholder(
                                this.__ITranslationService.get('Tags'),
                            )
                            .addSuggestion(() => {
                                return Array.from(tagsSet);
                            });
                    });
            })

            .addSettingRow((fileRow) => {
                fileRow
                    .setName(this.__ITranslationService.get('File'))
                    .setDescription(
                        this.__ITranslationService.get('File description'),
                    )
                    .add('input', (file) => {
                        file.setResultKey('file')
                            .setRequired(true)
                            .setPlaceholder(
                                this.__ITranslationService.get('File'),
                            )
                            .addSuggestion((input) =>
                                (
                                    this.__IDocumentModel as unknown as {
                                        getAllPDFsWithoutMetadata(): TFile[];
                                    }
                                )
                                    .getAllPDFsWithoutMetadata()
                                    .map((file) => file.name),
                            );
                    });
            })

            .addSettingRow((buttonsRow) => {
                buttonsRow
                    .add('button', (save) => {
                        save.setButtonText(
                            this.__ITranslationService.get('Save'),
                        )
                            .setCta(true)
                            .onClick(() => {
                                if (this._modal.isRequiredFullfilled) {
                                    this.save();
                                    this._modal.close();
                                } else {
                                    new this.__Notice(
                                        this.__ITranslationService.get(
                                            'Please fill in all required fields',
                                        ),
                                        2500,
                                    );
                                }
                            });
                    })
                    .add('button', (close) => {
                        close
                            .setButtonText(
                                this.__ITranslationService.get('Cancel'),
                            )
                            .setCta(true)
                            .onClick(() => {
                                this._modal.close();
                            });
                    });
            });
    };

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
