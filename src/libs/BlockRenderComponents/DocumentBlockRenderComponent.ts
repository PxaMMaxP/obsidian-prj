import API from 'src/classes/API';
import Lng from 'src/classes/Lng';
import { Logging } from 'src/classes/Logging';
import { DocumentModel } from 'src/models/DocumentModel';
import DocumentComponents from './InnerComponents/DocumentComponents';
import FilterButton from './InnerComponents/FilterButton';
import GeneralComponents from './InnerComponents/GeneralComponents';
import MaxShownModelsInput from './InnerComponents/MaxShownModelsInput';
import SearchInput from './InnerComponents/SearchInput';
import TableBlockRenderComponent, {
    BlockRenderSettings,
} from './TableBlockRenderComponent';
import { IProcessorSettings } from '../../interfaces/IProcessorSettings';
import { HelperGeneral } from '../Helper/General';
import { FileMetadata } from '../MetadataCache';
import Table, { Row, TableHeader } from '../Table';
import { Tags } from '../Tags/Tags';

/**
 * Document block render component class for `TableBlockRenderComponent`.
 * @remarks This class provides methods to create and manage a document block render component.
 * @see {@link create} for details about creating a document block render component.
 */
export default class DocumentBlockRenderComponent extends TableBlockRenderComponent<DocumentModel> {
    private _filterButtonDebounceTimer: NodeJS.Timeout;
    protected _settings: BlockRenderSettings = {
        tags: [],
        reactOnActiveFile: false,
        filter: ['Documents'],
        maxDocuments: this._IPrjSettings.defaultMaxShow,
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
        {
            text: Lng.gt('DocumentType'),
            headerClass: [],
            columnClass: ['dont-decorate-link', 'font-medium'],
        },
        { text: Lng.gt('Date'), headerClass: [], columnClass: ['font-xsmall'] },
        { text: Lng.gt('Subject'), headerClass: [], columnClass: [] },
        {
            text: Lng.gt('SendRecip'),
            headerClass: [],
            columnClass: ['font-xsmall'],
        },
        {
            text: Lng.gt('Content description'),
            headerClass: [],
            columnClass: ['font-xsmall'],
        },
        {
            text: Lng.gt('DeliveryDate'),
            headerClass: [],
            columnClass: ['font-xsmall'],
        },
        { text: Lng.gt('Tags'), headerClass: [], columnClass: ['tags'] },
    ];

    /**
     * Creates a new document block render component.
     * @param settings The settings of the document block render component.
     */
    constructor(settings: IProcessorSettings) {
        super(settings);
        this.parseSettings();
    }

    /**
     * Run the {@link TableBlockRenderComponent.build} method.
     * @returns A promise which is resolved when the documents basic components are built.
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
            ['Metadata'],
            this._settings.tags,
            (metadata: FileMetadata) => new DocumentModel(metadata.file),
        );
        await super.draw();
        await this.buildTable();
        await this.buildHeader();
        this.grayOutHeader();
        this._models = await documentsPromise;

        API.documentModel.sortDocumentsByDateDesc(this._models);
        await this.addDocumentsToTable();
        this.normalizeHeader();
        const endTime = Date.now();

        this._logger?.debug(
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

        const documentFilterButton = FilterButton.create(
            this._component,
            'Documents',
            this._IPrjSettings.documentSettings.symbol,
            this._settings.filter.includes('Documents'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(documentFilterButton);

        const hideDocumentFilterButton = FilterButton.create(
            this._component,
            'HideDocuments',
            this._IPrjSettings.documentSettings.hideSymbol,
            this._settings.filter.includes('HideDocuments'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(hideDocumentFilterButton);

        const clusterFilterButton = FilterButton.create(
            this._component,
            'Cluster',
            this._IPrjSettings.documentSettings.clusterSymbol,
            this._settings.filter.includes('Cluster'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(clusterFilterButton);

        const maxDocuments = MaxShownModelsInput.create(
            this._component,
            this._settings.maxDocuments,
            this._IPrjSettings.defaultMaxShow,
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
     * This method is called when the filter button is clicked.
     * @param type The type of the filter button.
     * @param status The new status of the filter button.
     * @remarks Runs the `onFilter` method.
     */
    private async onFilterButton(type: string, status: boolean): Promise<void> {
        if (this._settings.filter.includes(type as FilteredDocument)) {
            this._settings.filter = this._settings.filter.filter(
                (v) => v !== type,
            );
        } else {
            this._settings.filter.push(type as FilteredDocument);
        }
        await this.onFilterDebounce();
    }

    /**
     * This method debounces the `onFilter` method.
     * @returns A promise which is resolved when Timer is set.
     */
    private async onFilterDebounce(): Promise<void> {
        clearTimeout(this._filterButtonDebounceTimer);

        this._filterButtonDebounceTimer = setTimeout(() => {
            this.onFilter();
        }, 750);
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
     * @param documentModel The document to generate the table row for.
     * @returns The generated table row.
     */
    private async generateTableRow(documentModel: DocumentModel): Promise<Row> {
        const rowClassList: string[] = [];
        const rowData: DocumentFragment[] = [];
        const rowUid = this.getUID(documentModel);

        // Row 0 -- Metadata Link
        const metadataLink = document.createDocumentFragment();
        rowData.push(metadataLink);

        DocumentComponents.createCellMetadatalink(
            metadataLink,
            this._component,
            documentModel,
        );

        // Row 1 -- Date
        const date = document.createDocumentFragment();
        rowData.push(date);

        GeneralComponents.createCellDate(
            date,
            this._component,
            Lng.gt('DocumentDate'),
            this._IPrjSettings.dateFormat,
            () => documentModel.data.date ?? 'na',
            (value: string) => (documentModel.data.date = value),
        );

        // Row 2 -- File Link
        const fileLink = document.createDocumentFragment();
        rowData.push(fileLink);

        DocumentComponents.createCellFileLink(
            fileLink,
            this._component,
            documentModel,
        );

        // Row 3 -- Sender Recipient
        const senderRecipient = DocumentComponents.createCellSenderRecipient(
            documentModel,
            this._component,
            this._models,
        );
        rowData.push(senderRecipient);

        // Row 4 -- Summary & Related Files
        const summaryRelatedFiles = document.createDocumentFragment();
        rowData.push(summaryRelatedFiles);

        DocumentComponents.createCellSummary(
            documentModel,
            this._component,
            summaryRelatedFiles,
        );

        DocumentComponents.createRelatedFilesList(
            summaryRelatedFiles,
            this._component,
            documentModel,
            this._IPrjSettings.noneSymbol,
            this._IPrjSettings.dateFormatShort,
        );

        // Row 5 -- Date of delivery
        const deliveryDate = document.createDocumentFragment();
        rowData.push(deliveryDate);

        GeneralComponents.createCellDate(
            deliveryDate,
            this._component,
            Lng.gt('DeliveryDate'),
            this._IPrjSettings.dateFormat,
            () => documentModel.data.dateOfDelivery ?? 'na',
            (value: string) => (documentModel.data.dateOfDelivery = value),
        );

        // Row 6 -- Tags
        const tags = document.createDocumentFragment();
        rowData.push(tags);

        GeneralComponents.createCellTags(
            tags,
            this._component,
            documentModel.data.tags?.toStringArray() ?? [],
        );

        const hide = this.getHideState(documentModel, undefined);

        const row = {
            rowUid,
            rowData,
            rowClassList,
            hidden: hide,
        };

        return row;
    }

    /**
     * Gets the hide state of the document.
     * @param model The document model to get the hide state for.
     * @param maxVisibleRows The maximum visible rows.
     * @returns If the document should be hidden returns `true`, else `false`.
     */
    protected getHideState(
        model: DocumentModel,
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

        const hide =
            this.determineHideState(model) || this.determineTagHideState(model);

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
     * Determines if the document should be hidden.
     * @param document The document to check.
     * @returns If the document should be hidden returns `true`, else `false`.
     * @remarks - The document is hidden if the `filter` setting not includes the document type.
     */
    private determineHideState(document: DocumentModel): boolean {
        if (
            this._settings.filter.includes('Documents') &&
            document.data.hide !== true &&
            document.data.subType !== 'Cluster'
        ) {
            return false;
        }

        if (
            this._settings.filter.includes('Cluster') &&
            document.data.subType === 'Cluster'
        ) {
            return false;
        }

        if (
            this._settings.filter.includes('HideDocuments') &&
            document.data.hide === true
        ) {
            return false;
        }

        return true;
    }

    /**
     * Determines if the document should be hidden based on the tags in the settings.
     * @param document The document to check.
     * @returns If the document should be  shown returns `true`, else `false`.
     */
    private determineTagHideState(document: DocumentModel): boolean {
        const settingTags = new Tags(this._settings.tags);

        return this._settings.reactOnActiveFile
            ? !document.data.tags?.contains(settingTags)
            : false;
    }

    /**
     * This method runs the {@link TableBlockRenderComponent.filter} method.
     */
    public onActiveFileFilter(): void {
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
            Logging.getLogger('DocumentBlockRenderComponent/Table'),
        );
        this._tableContainer.appendChild(this._table.data.table);
    }

    /**
     * This method runs the {@link TableBlockRenderComponent.redraw} method.
     * @returns A promise which is resolved when the documents are redrawn.
     */
    public redraw(): Promise<void> {
        return super.redraw();
    }
}

/**
 * The types of documents to show.
 * @remarks - `Documents` - Show documents.
 * - `HideDocuments` - Show hidden documents.
 * - `Cluster` - Show clusters.
 */
type FilteredDocument = 'Documents' | 'HideDocuments' | 'Cluster';
