import { Menu, TAbstractFile, TFile } from 'obsidian';
import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import { Logging } from 'src/classes/Logging';

/**
 * Class to handle the 'CopyMarkdownLink' context menu
 * - Adds a context menu item to copy the markdown link of a file
 */
export default class CopyMarkdownLink {
    static instance: CopyMarkdownLink;
    private _app = Global.getInstance().app;
    private _logger = Logging.getLogger('CopyMarkdownLink');
    private _plugin = Global.getInstance().plugin;
    protected eventsRegistered = false;
    protected bindContextMenu = this.onContextMenu.bind(this);

    /**
     * Creates an instance of CopyMarkdownLink.
     */
    constructor() {
        this._logger.debug('Initializing CopyMarkdownLink');
        this.registerEvents();
    }

    /**
     * Gets the singleton instance of the CopyMarkdownLink class.
     * @returns The singleton instance.
     */
    static getInstance(): CopyMarkdownLink {
        if (!CopyMarkdownLink.instance) {
            CopyMarkdownLink.instance = new CopyMarkdownLink();
        }

        return CopyMarkdownLink.instance;
    }

    /**
     * Deconstructs the 'CopyMarkdownLink' events
     */
    public static deconstructor() {
        if (this.instance && this.instance.eventsRegistered) {
            this.instance._logger.trace(
                "Deconstructing 'CopyMarkdownLink' events",
            );

            this.instance._app.workspace.off(
                'file-menu',
                this.instance.bindContextMenu,
            );
            this.instance.eventsRegistered = false;
        } else {
            this.instance._logger.trace(
                "No 'CopyMarkdownLink' events to deconstruct",
            );
        }
    }

    /**
     * Registers the 'CopyMarkdownLink' events
     */
    private registerEvents() {
        if (!this.eventsRegistered) {
            this._logger.trace("Registering 'CopyMarkdownLink' events");
            this._app.workspace.on('file-menu', this.bindContextMenu);
            this.eventsRegistered = true;
        }
    }

    /**
     * Handles the context menu event
     * @param menu The context menu
     * @param file The file to add the context menu to
     * @remarks Adds a context menu item to copy the markdown link of a file:
     * - The context menu item copies the markdown link of the file to the clipboard.
     */
    private onContextMenu(menu: Menu, file: TAbstractFile) {
        if (!(file instanceof TFile)) {
            return;
        }

        const fileText = this._app.metadataCache.fileToLinktext(
            file,
            file.path,
        );

        if (!fileText) {
            return;
        }

        const linktext = `[[${fileText}]]`;

        menu.addSeparator();

        menu.addItem((item) => {
            item.setTitle(Lng.gt('Copy MD Link'))
                .setIcon('link')
                .onClick(async () => {
                    navigator.clipboard.writeText(linktext);
                });
        });
    }
}
