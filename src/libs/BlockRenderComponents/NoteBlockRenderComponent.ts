import API from 'src/classes/API';
import Lng from 'src/classes/Lng';
import { Logging } from 'src/classes/Logging';
import { DocumentModel } from 'src/models/DocumentModel';
import { NoteModel } from 'src/models/NoteModel';
import GeneralComponents from './InnerComponents/GeneralComponents';
import MaxShownModelsInput from './InnerComponents/MaxShownModelsInput';
import ProjectComponents from './InnerComponents/ProjectComponents';
import SearchInput from './InnerComponents/SearchInput';
import TableBlockRenderComponent, {
    BlockRenderSettings,
} from './TableBlockRenderComponent';
import { IProcessorSettings } from '../../interfaces/IProcessorSettings';
import EditableDataView from '../EditableDataView/EditableDataView';
import { HelperGeneral } from '../Helper/General';
import { FileMetadata } from '../MetadataCache';
import Table, { Row, TableHeader } from '../Table';
import { Tags } from '../Tags/Tags';

/**
 * Document block render component class for `TableBlockRenderComponent`.
 * @remarks This class provides methods to create and manage a document block render component.
 * @see {@link create} for details about creating a document block render component.
 * @augments TableBlockRenderComponent<NoteModel>
 */
export default class NoteBlockRenderComponent extends TableBlockRenderComponent<NoteModel> {
    protected _settings: BlockRenderSettings = {
        tags: [],
        reactOnActiveFile: false,
        filter: ['Note'],
        maxDocuments: this._global.settings.defaultMaxShow,
        search: undefined,
        searchText: undefined,
        batchSize: 8,
        sleepBetweenBatches: 10,
    };

    /**
     * The table headers.
     * @remarks The table headers are used to create the table.
     */
    protected _tableHeaders: TableHeader[] = [
        { text: Lng.gt('Date'), headerClass: [], columnClass: ['font-xsmall'] },
        { text: Lng.gt('Notice'), headerClass: [], columnClass: [] },
        {
            text: Lng.gt('Description'),
            headerClass: [],
            columnClass: ['font-xsmall'],
        },
        { text: Lng.gt('Tags'), headerClass: [], columnClass: ['tags'] },
    ];

    /**
     * Represents a NoteBlockRenderComponent.
     * @param settings The settings for the component.
     */
    constructor(settings: IProcessorSettings) {
        super(settings);
        this.parseSettings();
    }

    /**
     * Builds the NoteBlockRenderComponent.
     * @returns A promise that resolves when the build is complete.
     */
    public build(): Promise<void> {
        return super.build();
    }

    /**
     * Draws the component and adds the documents to the table.
     * @returns A promise which is resolved when the documents are added to the table.
     * @remarks - Calls the `super.draw` method.
     * - Calls the `buildTable` method.
     * - Calls the `buildHeader` method.
     * - Calls the `addDocumentsToTable` method.
     */
    protected async draw(): Promise<void> {
        const startTime = Date.now();

        const documentsPromise = super.getModels(
            ['Note'],
            this._settings.tags,
            (metadata: FileMetadata) => new NoteModel(metadata.file),
        );
        await super.draw();
        await this.buildTable();
        await this.buildHeader();
        this.grayOutHeader();
        this._models = await documentsPromise;

        API.documentModel.sortDocumentsByDateDesc(
            this._models as unknown as DocumentModel[],
        );
        await this.addDocumentsToTable();
        this.normalizeHeader();
        const endTime = Date.now();

        this._logger.debug(
            `Redraw Documents (for ${this._models.length} Docs.) runs for ${endTime - startTime}ms`,
        );
    }

    /**
     * Builds the header.
     * @remarks - The header is saved in the `headerContainer` property.
     * - Creates the `filter container`.
     * - Creates the `filter label`.
     * - Creates the `filter buttons`: `Documents`, `HideDocuments` and `Cluster`.
     * - Creates the `max documents input`.
     * - Creates the `search box`.
     */
    private async buildHeader(): Promise<void> {
        // Filter container
        const headerFilterButtons = document.createElement('div');
        this._headerContainer.appendChild(headerFilterButtons);
        headerFilterButtons.classList.add('header-item');
        headerFilterButtons.classList.add('filter-symbols');

        // Filter label
        const filterLabelContainer = document.createElement('div');
        headerFilterButtons.appendChild(filterLabelContainer);
        const filterLabel = document.createElement('span');
        filterLabelContainer.appendChild(filterLabel);
        filterLabel.classList.add('filter-symbol');
        filterLabel.textContent = Lng.gt('Filter');

        const maxDocuments = MaxShownModelsInput.create(
            this._component,
            this._settings.maxDocuments,
            this._global.settings.defaultMaxShow,
            this.onMaxDocumentsChange.bind(this),
        );
        headerFilterButtons.appendChild(maxDocuments);

        const searchBox = SearchInput.create(
            this._component,
            this.onSearch.bind(this),
            this._settings.searchText,
        );
        headerFilterButtons.appendChild(searchBox);
    }

    /**
     * This method is called when the max documents input is changed.
     * @param maxDocuments The new max documents value.
     * @returns A promise which is resolved when the documents are filtered.
     * @remarks Runs the `onFilter` method.
     */
    private async onMaxDocumentsChange(
        maxDocuments: number,
    ): Promise<undefined> {
        this._settings.maxDocuments = maxDocuments;
        this.onFilter();

        return undefined;
    }

    /**
     * Adds the documents to the table.
     * @param batchSize The batch size.
     * @param sleepBetweenBatches The sleep time between the batches.
     * @returns A promise which is resolved when the documents are added to the table.
     * @remarks - The documents are added to the table in batches.
     * - The batch size is defined in the `batchSize` parameter. Default is `settings.batchSize`.
     * - The sleep time between the batches is defined in the `sleepBetweenBatches` parameter. Default is `settings.sleepBetweenBatches`.
     */
    private async addDocumentsToTable(
        batchSize = this._settings.batchSize,
        sleepBetweenBatches = this._settings.sleepBetweenBatches,
    ): Promise<void> {
        let sleepPromise = Promise.resolve();
        const documentsLength = this._models.length;
        const rows: Row[] = [];
        let rowPromise: Promise<Row> | undefined = undefined;

        if (documentsLength > 0) {
            rowPromise = this.generateTableRow(this._models[0]);
        } else {
            return;
        }

        let visibleRows = 0;

        for (let i = 0; i < documentsLength; i++) {
            const document =
                i + 1 < documentsLength ? this._models[i + 1] : null;

            const row = await rowPromise;
            rowPromise = document ? this.generateTableRow(document) : undefined;

            if (row && !row.hidden) {
                if (visibleRows < this._settings.maxDocuments) {
                    visibleRows++;
                } else {
                    row.hidden = true;
                }
            }

            if (row) rows.push(row);

            if ((i !== 0 && i % batchSize === 0) || i === documentsLength - 1) {
                await sleepPromise;
                this._table.addRows(rows);
                rows.length = 0;
                sleepPromise = HelperGeneral.sleep(sleepBetweenBatches);
            }
        }
    }

    /**
     * Generates a table row for the given document.
     * @param noteModel The document to generate the table row for.
     * @returns The generated table row.
     */
    private async generateTableRow(noteModel: NoteModel): Promise<Row> {
        const rowClassList: string[] = [];
        const rowData: DocumentFragment[] = [];
        const rowUid = this.getUID(noteModel);

        // Row 0 -- Date
        const date = document.createDocumentFragment();
        rowData.push(date);

        GeneralComponents.createCellDate(
            date,
            this._component,
            Lng.gt('DocumentDate'),
            this._global.settings.dateFormat,
            () => noteModel.data.date ?? 'na',
            async (value: string) => (noteModel.data.date = value),
        );

        // Row 1 -- File Link & Title
        const fileLink = document.createDocumentFragment();
        rowData.push(fileLink);

        new EditableDataView(fileLink, this._component).addLink((link) =>
            link
                .setValue(noteModel.data.title ?? 'na')
                .setTitle('Note')
                .setLinkType('file')
                .setFormator((value: string) => {
                    return {
                        href: `${noteModel.file.path}`,
                        text: `${value}`,
                        html: undefined,
                    };
                })
                .enableEditability()
                .onSave((value: string) => {
                    noteModel.data.title = value;

                    return Promise.resolve();
                }),
        );

        // Row 2 -- Description
        const description = document.createDocumentFragment();
        rowData.push(description);

        ProjectComponents.createSummary(
            description,
            this._component,
            noteModel.data.description ?? '',
            async (value: string) => (noteModel.data.description = value),
        );

        // Row 3 -- Tags
        const tags = document.createDocumentFragment();
        rowData.push(tags);

        GeneralComponents.createCellTags(
            tags,
            this._component,
            noteModel.data.tags?.toStringArray() ?? [],
        );

        const row = {
            rowUid,
            rowData,
            rowClassList,
            hidden: false,
        };

        return row;
    }

    /**
     * Determines the hide state of a note block render component.
     * @param model The note model.
     * @param maxVisibleRows The maximum number of visible rows.
     * @returns A boolean indicating whether the note block should be hidden or not.
     */
    protected getHideState(
        model: NoteModel,
        maxVisibleRows: number | undefined,
    ): boolean {
        let searchResult = false;
        let maxRows = false;

        if (this._settings.search) {
            const text = model.data.toString?.();
            searchResult = this._settings.search.applySearchLogic(text ?? '');
        }

        if (maxVisibleRows && maxVisibleRows > 0) {
            const rowStats = this._table.getRowStats();
            maxRows = rowStats.visibleRows >= maxVisibleRows;
        }

        const hide = this.determineTagHideState(model);

        if (searchResult && !hide) {
            return false; // Shows the document, if it is not hidden and the search was successful
        } else if (this._settings.search) {
            return true; // Hide the document, if the search was not successful and aplicable
        } else if (!searchResult) {
            return maxRows || hide; // Else the document is hidden, if the max rows are reached or the document type is hidden
        }

        return hide; // Standard-Verhalten
    }

    /**
     * Determines the hide state of a tag based on the provided document and settings.
     * @param document The NoteModel representing the document.
     * @returns A boolean indicating whether the tag should be hidden or not.
     */
    private determineTagHideState(document: NoteModel): boolean {
        const settingTags = new Tags(this._settings.tags);

        return this._settings.reactOnActiveFile
            ? !document.data.tags?.contains(settingTags)
            : false;
    }

    /**
     * Executes the filter logic when the active file filter is triggered.
     */
    public onActiveFileFilter() {
        this.onFilter();
    }

    /**
     * Builds the table.
     * @remarks - The table is saved in the `table` property.
     * - The table is appended to the `tableContainer`.
     * - The table has the CSS class `document-table`.
     * - The table has the headers from the `tableHeaders` property.
     */
    private async buildTable(): Promise<void> {
        this._table = new Table(
            this._tableHeaders,
            'document-table',
            undefined,
            Logging.getLogger('NoteBlockRenderComponent/Table'),
        );
        this._tableContainer.appendChild(this._table.data.table);
    }

    /**
     * Redraws the component.
     * @returns A promise that resolves when the component has finished redrawing.
     */
    public redraw(): Promise<void> {
        return super.redraw();
    }
}
