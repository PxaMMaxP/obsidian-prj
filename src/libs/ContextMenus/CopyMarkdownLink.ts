import { Menu, TAbstractFile, TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Singleton } from 'src/classes/decorators/Singleton';
import { ContextMenu } from './ContextMenu';
import { IContextMenu } from './interfaces/IContextMenu';
import type { IDIContainer } from '../DependencyInjection/interfaces/IDIContainer';
import { Lifecycle } from '../LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from '../LifecycleManager/interfaces/ILifecycleManager';
import ITranslationService from '../TranslationService/interfaces/ITranslationService';

/**
 * Represents a context menu for copying markdown links.
 * @see {@link Singleton}
 * @see {@link Lifecycle}
 */
@Lifecycle
@ImplementsStatic<ILifecycleObject>()
@Singleton
export class CopyMarkdownLink extends ContextMenu implements IContextMenu {
    protected _bindContextMenu = this.onContextMenu.bind(this);
    private _translationService: ITranslationService;

    /**
     * Creates an instance of CopyMarkdownLink.
     * @param dependencies The dependencies for the context menu.
     */
    constructor(dependencies?: IDIContainer) {
        super(dependencies);

        this._translationService =
            this._dependencies.resolve<ITranslationService>(
                'ITranslationService',
            );
    }

    /**
     * This method is called when the application is unloaded.
     */
    public static onLoad(): void {
        const instance = new CopyMarkdownLink();
        instance.isInitialized();
    }

    /**
     * This method is called when the application is unloaded.
     */
    public static onUnload(): void {
        const instance = new CopyMarkdownLink();
        instance.deconstructor();
    }

    /**
     * Initializes the context menu.
     */
    protected onConstruction(): void {
        this._app.workspace.on('file-menu', this._bindContextMenu);
    }

    /**
     * Cleans up the context menu.
     */
    protected onDeconstruction(): void {
        this._app.workspace.off('file-menu', this._bindContextMenu);
    }

    /**
     * Handles the context menu event.
     * @param menu - The context menu.
     * @param file - The file associated with the context menu.
     */
    protected onContextMenu(menu: Menu, file: TAbstractFile): void {
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
            item.setTitle(this._translationService.get('Copy MD Link'))
                .setIcon('link')
                .onClick(async () => {
                    navigator.clipboard.writeText(linktext);
                });
        });
    }
    /**
     * Invokes the context menu.
     */
    public invoke(): Promise<void> {
        throw new Error('Method not implemented!');
    }
}
