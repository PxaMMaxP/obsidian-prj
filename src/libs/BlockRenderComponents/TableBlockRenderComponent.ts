import { Component, setIcon } from 'obsidian';
import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import { Logging } from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';
import { FileType } from 'src/libs/FileType/FileType';
import { FileTypes } from 'src/libs/FileType/interfaces/IFileType';
import IPrjModel from 'src/models/interfaces/IPrjModel';
import { IPrjSettings } from 'src/types/PrjSettings';
import RedrawableBlockRenderComponent from './RedrawableBlockRenderComponent';
import { IProcessorSettings } from '../../interfaces/IProcessorSettings';
import { HelperGeneral } from '../Helper/General';
import MetadataCache, { FileMetadata } from '../MetadataCache';
import { ISearch } from '../Search/interfaces/ISearch';
import { Search } from '../Search/Search';
import Table, { RowsState, TableHeader } from '../Table';
import { Tags } from '../Tags/Tags';

/**
 * Represents the base class for table block render components.
 */
export default abstract class TableBlockRenderComponent<
    T extends IPrjModel<unknown>,
> implements RedrawableBlockRenderComponent
{
    //#region General properties
    protected global: Global;
    protected globalSettings: IPrjSettings;
    protected logger: ILogger;
    protected metadataCache: MetadataCache;
    private _activeFileDebounceTimer: NodeJS.Timeout;
    //#endregion
    //#region Component properties
    protected processorSettings: IProcessorSettings;
    protected component: Component;
    protected settings: BlockRenderSettings;
    //#endregion
    //#region Models
    protected models: T[];
    //#endregion
    //#region HTML properties
    protected table: Table;
    protected tableHeaders: TableHeader[];
    protected headerContainer: HTMLElement;
    protected tableContainer: HTMLElement;
    //#endregion

    /**
     * Creates a new TableBlockRenderComponent instance.
     * @param settings The processor settings.
     * @param logger The logger to use. Defaults to the default logger `TableBlockRenderComponent`.
     */
    constructor(settings: IProcessorSettings, logger?: ILogger) {
        // General properties
        this.logger = logger ?? Logging.getLogger('TableBlockRenderComponent');
        this.global = Global.getInstance();
        this.globalSettings = this.global.settings;
        this.metadataCache = this.global.metadataCache;

        this.processorSettings = settings;
        this.component = settings.component;
        this.onActiveFileDebounce = this.onActiveFileDebounce.bind(this);
        //this.parseSettings();
    }

    /**
     * Builds the component first time.
     * @returns A promise that resolves when the component is drawn.
     * @remarks Calls the `draw` method.
     */
    public async build(): Promise<void> {
        return this.draw();
    }

    /**
     * Builds the `tableContainer` and `headerContainer` elements.
     * @remarks - Call this method to build the base structure first.
     * - Override this method to build the other elements.
     * @remarks - Build the `tableContainer` and `headerContainer` elements.
     * - Build the `controle block` => add a refresh button which calls the `redraw` method.
     */
    protected async draw(): Promise<void> {
        //Create header container
        this.headerContainer = document.createElement('div');
        this.processorSettings.container.appendChild(this.headerContainer);
        this.headerContainer.classList.add('header-container');

        //Create controle block
        const blockControle = document.createElement('div');
        this.headerContainer.appendChild(blockControle);
        blockControle.classList.add('block-controle');

        //Create refresh Button
        const refreshButton = document.createElement('a');
        blockControle.appendChild(refreshButton);
        refreshButton.classList.add('refresh-button');
        refreshButton.title = Lng.gt('Refresh');
        refreshButton.href = '#';
        setIcon(refreshButton, 'refresh-cw');

        this.component.registerDomEvent(
            refreshButton,
            'click',
            async (event: MouseEvent) => {
                event.preventDefault();
                this.redraw();
            },
        );

        this.tableContainer = document.createElement('div');
        this.processorSettings.container.appendChild(this.tableContainer);
        this.tableContainer.classList.add('table-container');
    }

    /**
     * Redraws the component on request. Clears the container and calls the `draw` method.
     * @returns A promise that resolves when the component is redrawn.
     * @remarks This methode clears the container and calls the `draw` methode.
     */
    public async redraw(): Promise<void> {
        this.processorSettings.container.innerHTML = '';

        return this.draw();
    }

    /**
     * Normalizes the header.
     * @remarks - Removes the `disable` class from the header.
     * - The header is not grayed out anymore.
     */
    protected normalizeHeader() {
        this.headerContainer.removeClass('disable');
    }

    /**
     * Grays out the header.
     * @remarks - Adds the `disable` class to the header.
     * - The header is grayed out.
     */
    protected grayOutHeader() {
        this.headerContainer.addClass('disable');
    }

    /**
     * Parses the settings given by the user per YAML in code block.
     * @remarks The settings are parsed and saved in the `settings` property.
     * @remarks Settings:
     * - `tags`: Can be `all`, `this`, `activeFile` or a list of tags.
     * `this` means the tags of the current document.
     * `activeFile` means the tags of the active file.
     * - `maxDocuments`: The maximum number of documents to show on same time.
     * - `filter`: Must be an array. The values present the document types.
     * All values that are in the array are shown.
     */
    protected parseSettings(): void {
        this.processorSettings.options.forEach((option) => {
            switch (option.label) {
                case 'tags':
                    if (option.value === 'all') {
                        this.settings.tags = [];
                    } else if (option.value === 'this') {
                        const tags = this.processorSettings?.frontmatter?.tags;

                        if (Array.isArray(tags)) {
                            this.settings.tags.push(...tags);
                        } else if (tags) {
                            this.settings.tags.push(tags);
                        } else {
                            this.settings.tags = ['NOTAGSNODATA'];
                        }
                    } else if (option.value === 'activeFile') {
                        // Register event to update the tags when the active file changes
                        this.component.registerEvent(
                            this.global.app.workspace.on(
                                'active-leaf-change',
                                () => this.onActiveFileChange.bind(this)(),
                            ),
                        );
                        this.settings.reactOnActiveFile = true;
                    } else {
                        this.settings.tags = option.value;
                    }
                    break;
                case 'maxDocuments':
                    this.settings.maxDocuments = option.value;
                    break;
                case 'filter':
                    this.settings.filter = option.value;
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * Handles the event when the active file changes.
     * If the active file is not in the "Ressourcen/Panels/" path,
     * it updates the tags in the settings based on the metadata of the active file.
     * @private
     */
    private onActiveFileChange(): void {
        const activeFile = this.global.app.workspace.getActiveFile();

        if (activeFile && !activeFile.path.contains('Ressourcen/Panels/')) {
            this.logger?.trace('Active file changed: ', activeFile.path);

            const tags =
                this.metadataCache.getEntry(activeFile)?.metadata?.frontmatter
                    ?.tags;
            let newTags: string[] = [];

            if (Array.isArray(tags)) {
                newTags = tags;
            } else if (tags && this) {
                newTags = [tags];
            }

            /**
             * Checks if the tags are different.
             * @param tags1 The first array to compare.
             * @param tags2 The second array to compare.
             * @returns True if the tags are different, false otherwise.
             */
            const areTagsDifferent = (tags1: string[], tags2: string[]) => {
                if (tags1.length !== tags2.length) return true;

                const sortedTags1 = [...tags1].sort();
                const sortedTags2 = [...tags2].sort();

                for (let i = 0; i < sortedTags1.length; i++) {
                    if (sortedTags1[i] !== sortedTags2[i]) return true;
                }

                return false;
            };

            if (areTagsDifferent(newTags, this.settings.tags)) {
                this.settings.tags = newTags;
                this.onActiveFileDebounce();
            }
        }
    }

    /**
     * Debounces the active file change event and triggers a redraw after a delay.
     */
    private onActiveFileDebounce(): void {
        this.logger?.trace('Active file changed: Debouncing');
        clearTimeout(this._activeFileDebounceTimer);

        this._activeFileDebounceTimer = setTimeout(async () => {
            this.onActiveFileFilter();
        }, 750);
    }

    /**
     * Handles the event when the active file changes.
     */
    abstract onActiveFileFilter(): void;

    /**
     * Gets the unique identifier for the model.
     * @param model The model to get the unique identifier for.
     * @returns The unique identifier per model.
     */
    protected getUID(model: T): string {
        return HelperGeneral.generateUID(model.file.path);
    }

    /**
     * Retrieves models based on the specified file types, tags, and model factory.
     * @param types - The file types to filter by.
     * @param tags - The tags to filter by.
     * @param modelFactory - The factory function to create models from file metadata.
     * @returns A promise that resolves to an array of models.
     */
    protected getModels(
        types: FileTypes[],
        tags: string[],
        modelFactory: (metadata: FileMetadata) => T | undefined,
    ): Promise<T[]> {
        const templateFolder = this.global.settings.templateFolder;

        // Create an instance of the Tags class for the provided tags
        const filterTags = new Tags(tags);

        const allDocumentFiles = this.metadataCache.cache.filter((file) => {
            const typeFilter = FileType.isValidOf(
                file.metadata.frontmatter?.type,
                types,
            );

            const thisFileAndTemplateFilter =
                file.file.path !== this.processorSettings.source &&
                !file.file.path.startsWith(templateFolder);

            if (tags.length > 0) {
                const fileTags = new Tags(file.metadata.frontmatter?.tags);

                const tagFilter = fileTags.contains(filterTags);

                return thisFileAndTemplateFilter && typeFilter && tagFilter;
            }

            return thisFileAndTemplateFilter && typeFilter;
        });

        const models: T[] = [];

        for (const file of allDocumentFiles) {
            const model = modelFactory(file);

            if (model) models.push(model);
        }

        return Promise.resolve(models);
    }

    /**
     * This method is called when the search box is used.
     * @param searchQuery The search text.
     * @param key The key that was pressed.
     * @returns The search text.
     * @remarks - If the `Enter` key was pressed, the search is applied.
     * - If the `Escape` key was pressed, the search is reset.
     * - After the search is applied, the {@link onFilter} method is called.
     */
    protected async onSearch(
        searchQuery: string,
        key: string,
    ): Promise<string> {
        if (key === 'Enter') {
            if (searchQuery !== '') {
                this.settings.searchText = searchQuery;
                this.settings.search = new Search(searchQuery);
                this.settings.search.parse();
                this.onFilter();
            } else {
                this.settings.searchText = undefined;
                this.settings.search = undefined;
                this.onFilter();
            }
        } else if (key === 'Escape') {
            this.settings.searchText = undefined;
            this.settings.search = undefined;
            this.onFilter();

            return '';
        }

        return searchQuery;
    }

    /**
     * Filters the models and shows/hides them in the table.
     * @remarks - The models are filtered by the `filter` setting,
     * searched by the `search` setting
     * and the number of documents is limited by the `maxDocuments` if no search is applied.
     */
    protected async onFilter() {
        this.grayOutHeader();
        const batchSize = this.settings.batchSize;
        const sleepBetweenBatches = this.settings.sleepBetweenBatches;
        let sleepPromise = Promise.resolve();
        const documentsLength = this.models.length;
        const rows: RowsState[] = [];
        let visibleRows = 0;

        for (let i = 0; i < documentsLength; i++) {
            const document = this.models[i];

            const rowUid = this.getUID(document);
            let hide = this.getHideState(document, undefined);
            this.logger?.trace(`Model ${rowUid} is hidden by state: ${hide}`);

            this.logger?.trace(
                `Visible rows: ${visibleRows}; Max shown Models: ${this.settings.maxDocuments}`,
            );

            if (visibleRows >= this.settings.maxDocuments) {
                hide = true;
            }

            this.logger?.trace(
                `Model ${rowUid} is hidden by max counts: ${hide}`,
            );

            if (hide) {
                rows.push({ rowUid, hidden: true });
            } else {
                visibleRows++;
                rows.push({ rowUid, hidden: false });
            }

            if ((i !== 0 && i % batchSize === 0) || i === documentsLength - 1) {
                await sleepPromise;

                this.logger?.trace(
                    `Batchsize reached. Change rows: ${rows.length}`,
                );
                await this.table.changeShowHideStateRows(rows);
                rows.length = 0;
                sleepPromise = HelperGeneral.sleep(sleepBetweenBatches);
            }
        }

        this.normalizeHeader();
    }

    /**
     * Gets the hide state for the document.
     * @param model - The document to get the hide state for.
     * @param maxVisibleRows - The maximum number of visible rows.
     * @returns True if the document should be hidden, false otherwise.
     */
    protected abstract getHideState(
        model: T,
        maxVisibleRows: number | undefined,
    ): boolean;
}

export type BlockRenderSettings = {
    /**
     * The tags associated with the documents.
     * Can be `all`, `this` or a list of specific tags.
     * `all` includes all documents regardless of their tags.
     * `this` includes documents that have the same tags as the current document.
     */
    tags: string[];

    /**
     * Whether to react to the active file change event.
     */
    reactOnActiveFile: boolean;

    /**
     * Filter for the model types to display.
     * Only the types listed in the array will be shown.
     */
    filter: unknown[];

    /**
     * The maximum number of models to show at the same time.
     */
    maxDocuments: number;

    /**
     * Search terms array used to filter the models.
     * If undefined, no search filter is applied.
     */
    search: ISearch | undefined;

    /**
     * The search text.
     */
    searchText: string | undefined;

    /**
     * The number of models to process in one batch.
     */
    batchSize: number;

    /**
     * The time to wait (in milliseconds) between processing batches of models.
     */
    sleepBetweenBatches: number;
};
