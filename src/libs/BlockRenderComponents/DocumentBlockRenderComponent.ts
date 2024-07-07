import API from 'src/classes/API';
import Lng from 'src/classes/Lng';
import Logging from 'src/classes/Logging';
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
import Helper from '../Helper';
import { FileMetadata } from '../MetadataCache';
import Table, { Row, TableHeader } from '../Table';

/**
 * Document block render component class for `TableBlockRenderComponent`.
 * @remarks This class provides methods to create and manage a document block render component.
 * @see {@link create} for details about creating a document block render component.
 */
export default class DocumentBlockRenderComponent extends TableBlockRenderComponent<DocumentModel> {
    private _filterButtonDebounceTimer: NodeJS.Timeout;
    protected settings: BlockRenderSettings = {
        tags: [],
        reactOnActiveFile: false,
        filter: ['Documents'],
        maxDocuments: this.global.settings.defaultMaxShow,
        search: undefined,
        searchText: undefined,
        batchSize: 8,
        sleepBetweenBatches: 10,
    };

    /**
     * The table headers.
     * @remarks The table headers are used to create the table.
     */
    protected tableHeaders: TableHeader[] = [
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
            this.settings.tags,
            (metadata: FileMetadata) => new DocumentModel(metadata.file),
        );
        await super.draw();
        await this.buildTable();
        await this.buildHeader();
        this.grayOutHeader();
        this.models = await documentsPromise;

        API.documentModel.sortDocumentsByDateDesc(this.models);
        await this.addDocumentsToTable();
        this.normalizeHeader();
        const endTime = Date.now();

        this.logger.debug(
            `Redraw Documents (for ${this.models.length} Docs.) runs for ${endTime - startTime}ms`,
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
        this.headerContainer.appendChild(headerFilterButtons);
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
            this.component,
            'Documents',
            this.globalSettings.documentSettings.symbol,
            this.settings.filter.includes('Documents'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(documentFilterButton);

        const hideDocumentFilterButton = FilterButton.create(
            this.component,
            'HideDocuments',
            this.globalSettings.documentSettings.hideSymbol,
            this.settings.filter.includes('HideDocuments'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(hideDocumentFilterButton);

        const clusterFilterButton = FilterButton.create(
            this.component,
            'Cluster',
            this.globalSettings.documentSettings.clusterSymbol,
            this.settings.filter.includes('Cluster'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(clusterFilterButton);

        const maxDocuments = MaxShownModelsInput.create(
            this.component,
            this.settings.maxDocuments,
            this.global.settings.defaultMaxShow,
            this.onMaxDocumentsChange.bind(this),
        );
        headerFilterButtons.appendChild(maxDocuments);

        const searchBox = SearchInput.create(
            this.component,
            this.onSearch.bind(this),
            this.settings.searchText,
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
        if (this.settings.filter.includes(type as FilteredDocument)) {
            this.settings.filter = this.settings.filter.filter(
                (v) => v !== type,
            );
        } else {
            this.settings.filter.push(type as FilteredDocument);
        }
        await this.onFilterDebounce();
    }

    /**
     * This method debounces the `onFilter` method.
     * @returns A promise which is resolved when Timer is set.
     */
    private async onFilterDebounce(): Promise<void> {
        clearTimeout(this._filterButtonDebounceTimer);

        this._filterButtonDebounceTimer = setTimeout(async () => {
            await this.onFilter();
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
        this.settings.maxDocuments = maxDocuments;
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
        batchSize = this.settings.batchSize,
        sleepBetweenBatches = this.settings.sleepBetweenBatches,
    ): Promise<void> {
        let sleepPromise = Promise.resolve();
        const documentsLength = this.models.length;
        const rows: Row[] = [];
        let rowPromise: Promise<Row> | undefined = undefined;

        if (documentsLength > 0) {
            rowPromise = this.generateTableRow(this.models[0]);
        } else {
            return;
        }

        let visibleRows = 0;

        for (let i = 0; i < documentsLength; i++) {
            const document =
                i + 1 < documentsLength ? this.models[i + 1] : null;

            const row = await rowPromise;
            rowPromise = document ? this.generateTableRow(document) : undefined;

            if (row && !row.hidden) {
                if (visibleRows < this.settings.maxDocuments) {
                    visibleRows++;
                } else {
                    row.hidden = true;
                }
            }

            if (row) rows.push(row);

            if ((i !== 0 && i % batchSize === 0) || i === documentsLength - 1) {
                await sleepPromise;
                this.table.addRows(rows);
                rows.length = 0;
                sleepPromise = Helper.sleep(sleepBetweenBatches);
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
            this.component,
            documentModel,
        );

        // Row 1 -- Date
        const date = document.createDocumentFragment();
        rowData.push(date);

        GeneralComponents.createCellDate(
            date,
            this.component,
            Lng.gt('DocumentDate'),
            this.global.settings.dateFormat,
            () => documentModel.data.date ?? 'na',
            async (value: string) => (documentModel.data.date = value),
        );

        // Row 2 -- File Link
        const fileLink = document.createDocumentFragment();
        rowData.push(fileLink);

        DocumentComponents.createCellFileLink(
            fileLink,
            this.component,
            documentModel,
        );

        // Row 3 -- Sender Recipient
        const senderRecipient = DocumentComponents.createCellSenderRecipient(
            documentModel,
            this.component,
            this.models,
        );
        rowData.push(senderRecipient);

        // Row 4 -- Summary & Related Files
        const summaryRelatedFiles = document.createDocumentFragment();
        rowData.push(summaryRelatedFiles);

        DocumentComponents.createCellSummary(
            documentModel,
            this.component,
            summaryRelatedFiles,
        );

        DocumentComponents.createRelatedFilesList(
            summaryRelatedFiles,
            this.component,
            documentModel,
            this.globalSettings.noneSymbol,
            this.global.settings.dateFormatShort,
        );

        // Row 5 -- Date of delivery
        const deliveryDate = document.createDocumentFragment();
        rowData.push(deliveryDate);

        GeneralComponents.createCellDate(
            deliveryDate,
            this.component,
            Lng.gt('DeliveryDate'),
            this.global.settings.dateFormat,
            () => documentModel.data.dateOfDelivery ?? 'na',
            async (value: string) =>
                (documentModel.data.dateOfDelivery = value),
        );

        // Row 6 -- Tags
        const tags = document.createDocumentFragment();
        rowData.push(tags);

        GeneralComponents.createCellTags(
            tags,
            this.component,
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

        if (this.settings.search) {
            const text = model.data.toString?.();
            searchResult = this.settings.search.applySearchLogic(text ?? '');
        }

        if (maxVisibleRows && maxVisibleRows > 0) {
            const rowStats = this.table.getRowStats();
            maxRows = rowStats.visibleRows >= maxVisibleRows;
        }

        const hide =
            this.determineHideState(model) || this.determineTagHideState(model);

        if (searchResult && !hide) {
            return false; // Shows the document, if it is not hidden and the search was successful
        } else if (this.settings.search) {
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
            this.settings.filter.includes('Documents') &&
            document.data.hide !== true &&
            document.data.subType !== 'Cluster'
        ) {
            return false;
        }

        if (
            this.settings.filter.includes('Cluster') &&
            document.data.subType === 'Cluster'
        ) {
            return false;
        }

        if (
            this.settings.filter.includes('HideDocuments') &&
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
        return this.settings.reactOnActiveFile
            ? !Helper.isTagIncluded(
                  this.settings.tags,
                  document.data.tags?.toStringArray() ?? [],
              )
            : false;
    }

    /**
     * This method runs the {@link TableBlockRenderComponent.filter} method.
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
        this.table = new Table(
            this.tableHeaders,
            'document-table',
            undefined,
            Logging.getLogger('DocumentBlockRenderComponent/Table'),
        );
        this.tableContainer.appendChild(this.table.data.table);
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
