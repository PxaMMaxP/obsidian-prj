import { Menu, TAbstractFile, TFile } from 'obsidian';
import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import { DocumentModel } from 'src/models/DocumentModel';
import { FileType } from 'src/types/PrjTypes';
import { FileMetadata } from '../MetadataCache';
import Helper from '../Helper';
import Logging from 'src/classes/Logging';

export default class GetMetadata {
    static instance: GetMetadata;
    private _app = Global.getInstance().app;
    private logger = Logging.getLogger('GetMetadata');
    private _plugin = Global.getInstance().plugin;
    private _metadataCache = Global.getInstance().metadataCache;
    protected eventsRegistered = false;
    protected bindContextMenu = this.onContextMenu.bind(this);

    private constructor() {
        this.logger.debug('Initializing GetMetadata');
        this.registerEvents();
        this.registerCommands();
    }

    static getInstance(): GetMetadata {
        if (!GetMetadata.instance) {
            GetMetadata.instance = new GetMetadata();
        }

        return GetMetadata.instance;
    }

    /**
     * Deconstructs the 'GetMetadata' events
     */
    public static deconstructor() {
        if (this.instance && this.instance.eventsRegistered) {
            this.instance.logger.trace("Deconstructing 'GetMetadata' events");

            this.instance._app.workspace.off(
                'file-menu',
                this.instance.bindContextMenu,
            );
            this.instance.eventsRegistered = false;
        } else {
            this.instance.logger.trace(
                "No 'GetMetadata' events to deconstruct",
            );
        }
    }

    /**
     * Registers the 'GetMetadata' events
     */
    private registerEvents() {
        if (!this.eventsRegistered) {
            this.logger.trace("Registering 'GetMetadata' events");
            this._app.workspace.on('file-menu', this.bindContextMenu);
            this.eventsRegistered = true;
        }
    }

    /**
     * Registers the 'GetMetadata' commands
     */
    private registerCommands() {
        this.logger.trace("Registering 'GetMetadata' commands");

        this._plugin.addCommand({
            id: 'get-metadata-file',
            name: Lng.gt('Show Metadata File'),
            callback: () => {
                GetMetadata.getInstance().invoke();
            },
        });
    }

    /**
     * Adds the 'GetMetadata' context menu item
     * @param menu The context menu
     * @param file The file to add the context menu item to
     */
    private onContextMenu(menu: Menu, file: TAbstractFile) {
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
                item.setTitle(Lng.gt('Show Metadata File'))
                    .setIcon(document.getCorospondingSymbol())
                    .onClick(async () => {
                        await Helper.openFile(document.file);
                    });
            });
        }
    }

    /**
     * Returns the metadata file for the given document (e.g. pdf) file
     * @param file The document file
     * @returns The metadata file or undefined if not found
     */
    private getCorrespondingMetadataFile(
        file: TFile,
    ): FileMetadata | undefined {
        return this._metadataCache.cache.find((metadata) => {
            const type = metadata.metadata.frontmatter?.type as
                | FileType
                | undefined
                | null;

            const fileLink = metadata.metadata.frontmatter?.file as
                | string
                | undefined
                | null;

            if (type && fileLink && type === 'Metadata') {
                return fileLink.contains(file.name);
            } else {
                return false;
            }
        });
    }

    /**
     * Opens the metadata file for the active (e.g. pdf) file
     */
    public async invoke() {
        const workspace = this._app.workspace;
        const activeFile = workspace.getActiveFile();

        if (
            !activeFile ||
            !(activeFile instanceof TFile) ||
            !activeFile.path.endsWith('.pdf')
        ) {
            this.logger.warn('No active pdf file found.');

            return;
        }
        const metadataFile = this.getCorrespondingMetadataFile(activeFile);

        if (!metadataFile) {
            this.logger.warn('No metadata file to the active pdf file found.');

            return;
        }
        const document = new DocumentModel(metadataFile.file);
        await Helper.openFile(document.file);
    }
}
