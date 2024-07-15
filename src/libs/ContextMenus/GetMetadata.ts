import { Menu, TAbstractFile, TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Singleton } from 'src/classes/decorators/Singleton';
import IMetadataCache from 'src/interfaces/IMetadataCache';
import { DocumentModel } from 'src/models/DocumentModel';
import { FileType } from 'src/libs/FileType/FileType';
import { ContextMenu } from './ContextMenu';
import { IContextMenu } from './interfaces/IContextMenu';
import type { IDIContainer } from '../DependencyInjection/interfaces/IDIContainer';
import { IHelperObsidian_ } from '../Helper/Obsidian';
import { Lifecycle } from '../LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from '../LifecycleManager/interfaces/ILifecycleManager';
import { FileMetadata } from '../MetadataCache';
import ITranslationService from '../TranslationService/interfaces/ITranslationService';

/**
 * Represents a class for retrieving metadata for a file.
 * @see {@link Singleton}
 * @see {@link Lifecycle}
 */
@Lifecycle
@ImplementsStatic<ILifecycleObject>()
@Singleton
export class GetMetadata extends ContextMenu implements IContextMenu {
    protected bindContextMenu = this.onContextMenu.bind(this);
    private _translationService: ITranslationService;
    private _metadataCache: IMetadataCache;
    private _helperObsidian: IHelperObsidian_;
    protected eventsRegistered = false;

    /**
     * Initializes a instance of the GetMetadata class.
     * @param dependencies The dependencies for the context menu.
     */
    constructor(dependencies?: IDIContainer) {
        super(dependencies);

        this._translationService =
            this._dependencies.resolve<ITranslationService>(
                'ITranslationService',
            );

        this._metadataCache =
            this._dependencies.resolve<IMetadataCache>('IMetadataCache');

        this._helperObsidian =
            this._dependencies.resolve<IHelperObsidian_>('IHelperObsidian_');
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
        this._app.workspace.on('file-menu', this.bindContextMenu);

        this._plugin.addCommand({
            id: 'get-metadata-file',
            name: this._translationService.get('Show Metadata File'),
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
        this._app.workspace.off('file-menu', this.bindContextMenu);
    }

    /**
     * Adds the 'GetMetadata' context menu item.
     * @param menu The context menu.
     * @param file The file to add the context menu item to.
     */
    protected onContextMenu(menu: Menu, file: TAbstractFile) {
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
                    this._translationService.get('Show Metadata File'),
                )
                    .setIcon(document.getCorospondingSymbol())
                    .onClick(async () => {
                        await this._helperObsidian.openFile(document.file);
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
        return this._metadataCache.cache.find((metadata) => {
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
    public async invoke() {
        const workspace = this._app.workspace;
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
        await this._helperObsidian.openFile(document.file);
    }
}
