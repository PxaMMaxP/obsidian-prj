import { Menu, TAbstractFile, TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Singleton } from 'src/classes/decorators/Singleton';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { FileType } from 'src/libs/FileType/FileType';
import { DocumentModel } from 'src/models/DocumentModel';
import { ContextMenu } from './ContextMenu';
import { IContextMenu } from './interfaces/IContextMenu';
import { Inject } from '../DependencyInjection/decorators/Inject';
import type { IDIContainer } from '../DependencyInjection/interfaces/IDIContainer';
import type { IHelperObsidian } from '../Helper/interfaces/IHelperObsidian';
import { Lifecycle } from '../LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from '../LifecycleManager/interfaces/ILifecycleObject';
import { FileMetadata } from '../MetadataCache';
import type ITranslationService from '../TranslationService/interfaces/ITranslationService';

/**
 * Represents a class for retrieving metadata for a file.
 * @see {@link Singleton}
 * @see {@link Lifecycle}
 */
@Lifecycle()
@ImplementsStatic<ILifecycleObject>()
@Singleton
export class GetMetadata extends ContextMenu implements IContextMenu {
    protected _bindContextMenu = this.onContextMenu.bind(this);
    @Inject('ITranslationService')
    private readonly _ITranslationService: ITranslationService;
    @Inject('IMetadataCache')
    private readonly _IMetadataCache: IMetadataCache;
    @Inject('IHelperObsidian')
    private readonly _IHelperObsidian: IHelperObsidian;
    protected _hasEventsRegistered = false;

    /**
     * Initializes a instance of the GetMetadata class.
     * @param dependencies The dependencies for the context menu.
     */
    constructor(dependencies?: IDIContainer) {
        super();
    }

    /**
     * This method is called when the application is unloaded.
     */
    public static onLoad(): void {
        const instance = new GetMetadata();
        instance.isInitialized();
    }

    /**
     * This method is called when the application is unloaded.
     */
    public static onUnload(): void {
        const instance = new GetMetadata();
        instance.deconstructor();
    }

    /**
     * Initializes the context menu.
     */
    protected onConstruction(): void {
        this._IApp.workspace.on('file-menu', this._bindContextMenu);

        this._IPrj.addCommand({
            id: 'get-metadata-file',
            name: this._ITranslationService.get('Show Metadata File'),
            /**
             * Callback function for the 'get-metadata-file' command.
             */
            callback: () => {
                new GetMetadata().invoke();
            },
        });
    }

    /**
     * Cleans up the context menu.
     */
    protected onDeconstruction(): void {
        this._IApp.workspace.off('file-menu', this._bindContextMenu);
    }

    /**
     * Adds the 'GetMetadata' context menu item.
     * @param menu The context menu.
     * @param file The file to add the context menu item to.
     */
    protected onContextMenu(menu: Menu, file: TAbstractFile): void {
        // Allow only pdf files
        if (!(file instanceof TFile) || !file.path.endsWith('.pdf')) {
            return;
        }
        const metadataFile = this.getCorrespondingMetadataFile(file);

        if (!metadataFile) {
            return;
        }
        const document = new DocumentModel(metadataFile.file);

        if (metadataFile) {
            menu.addSeparator();

            menu.addItem((item) => {
                item.setTitle(
                    this._ITranslationService.get('Show Metadata File'),
                )
                    .setIcon(document.getCorospondingSymbol())
                    .onClick(async () => {
                        await this._IHelperObsidian.openFile(document.file);
                    });
            });
        }
    }

    /**
     * Returns the metadata file for the given document (e.g. pdf) file.
     * @param file The document file.
     * @returns The metadata file or undefined if not found.
     */
    private getCorrespondingMetadataFile(
        file: TFile,
    ): FileMetadata | undefined {
        return this._IMetadataCache.cache.find((metadata) => {
            const type = new FileType(metadata.metadata.frontmatter?.type);

            const fileLink = metadata.metadata.frontmatter?.file as
                | string
                | undefined
                | null;

            if (type.value && fileLink && type.equals('Metadata')) {
                return fileLink.contains(file.name);
            } else {
                return false;
            }
        });
    }

    /**
     * Opens the metadata file for the active (e.g. pdf) file.
     */
    public async invoke(): Promise<void> {
        const workspace = this._IApp.workspace;
        const activeFile = workspace.getActiveFile();

        if (
            !activeFile ||
            !(activeFile instanceof TFile) ||
            !activeFile.path.endsWith('.pdf')
        ) {
            this._logger?.warn('No active pdf file found.');

            return;
        }
        const metadataFile = this.getCorrespondingMetadataFile(activeFile);

        if (!metadataFile) {
            this._logger?.warn(
                'No metadata file to the active pdf file found.',
            );

            return;
        }
        const document = new DocumentModel(metadataFile.file);
        await this._IHelperObsidian.openFile(document.file);
    }
}
