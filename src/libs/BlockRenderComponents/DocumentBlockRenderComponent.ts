import { DocumentModel } from "src/models/DocumentModel";
import TableBlockRenderComponent from "./TableBlockRenderComponent";
import { IProcessorSettings } from "../../interfaces/IProcessorSettings";
import Search, { SearchTermsArray } from "../Search";
import Table, { Row, RowsState, TableHeader } from "../Table";
import Lng from "src/classes/Lng";
import FilterButton from "./InnerComponents/FilterButton";
import MaxShownModelsInput from "./InnerComponents/MaxShownModelsInput";
import SearchInput from "./InnerComponents/SearchInput";
import Helper from "../Helper";
import DocumentComponents from "./InnerComponents/DocumentComponents";
import GeneralComponents from "./InnerComponents/GeneralComponents";

/**
 * Document block render component class for `TableBlockRenderComponent`.
 * @remarks This class provides methods to create and manage a document block render component.
 * @see {@link create} for details about creating a document block render component.
 */
export default class DocumentBlockRenderComponent extends TableBlockRenderComponent<DocumentModel> {
    protected settings: DocumentBlockRenderSettings = {
        tags: [],
        docSymbol: this.global.settings.documentSettings.symbol,
        hideDocSymbol: this.global.settings.documentSettings.hideSymbol,
        clusterSymbol: this.global.settings.documentSettings.clusterSymbol,
        noneDocSymbol: "diamond",
        filter: ["Documents"],
        maxDocuments: this.global.settings.defaultMaxShow,
        search: undefined,
        batchSize: 8,
        sleepBetweenBatches: 10
    };

    /**
     * The table headers.
     * @remarks The table headers are used to create the table.
     * 
     */
    protected tableHeaders: TableHeader[] = [
        { text: Lng.gt("DocumentType"), headerClass: [], columnClass: ["dont-decorate-link", "font-medium"] },
        { text: Lng.gt("Date"), headerClass: [], columnClass: ["font-xsmall"] },
        { text: Lng.gt("Subject"), headerClass: [], columnClass: [] },
        { text: Lng.gt("SendRecip"), headerClass: [], columnClass: ["font-xsmall"] },
        { text: Lng.gt("Content"), headerClass: [], columnClass: ["font-xsmall"] },
        { text: Lng.gt("DeliveryDate"), headerClass: [], columnClass: ["font-xsmall"] },
        { text: Lng.gt("Tags"), headerClass: [], columnClass: ["tags"] }
    ];

    constructor(settings: IProcessorSettings) {
        super(settings);
        this.parseSettings();
    }

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

        const documentsPromise = this.getModels();
        await super.draw();
        await this.buildTable();
        await this.buildHeader();
        this.grayOutHeader();
        this.models = (await documentsPromise);

        DocumentModel.sortDocumentsByDateDesc(this.models);
        await this.addDocumentsToTable();
        this.normalizeHeader();
        const endTime = Date.now();
        this.logger.debug(`Redraw Documents (for ${this.models.length} Docs.) runs for ${endTime - startTime}ms`);
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
        filterLabel.textContent = Lng.gt("Filter");

        const documentFilterButton = FilterButton.create(
            this.component,
            "Documents",
            this.settings.docSymbol,
            this.settings.filter.includes("Documents"),
            this.onFilterButton.bind(this));
        headerFilterButtons.appendChild(documentFilterButton);

        const hideDocumentFilterButton = FilterButton.create(
            this.component,
            "HideDocuments",
            this.settings.hideDocSymbol,
            this.settings.filter.includes("HideDocuments"),
            this.onFilterButton.bind(this));
        headerFilterButtons.appendChild(hideDocumentFilterButton);

        const clusterFilterButton = FilterButton.create(
            this.component,
            "Cluster",
            this.settings.clusterSymbol,
            this.settings.filter.includes("Cluster"),
            this.onFilterButton.bind(this));
        headerFilterButtons.appendChild(clusterFilterButton);

        const maxDocuments = MaxShownModelsInput.create(
            this.component,
            this.settings.maxDocuments,
            this.global.settings.defaultMaxShow,
            this.onMaxDocumentsChange.bind(this));
        headerFilterButtons.appendChild(maxDocuments);

        const searchBox = SearchInput.create(
            this.component,
            this.onSearch.bind(this));
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
            this.settings.filter = this.settings.filter.filter(v => v !== type);
        } else {
            this.settings.filter.push(type as FilteredDocument);
        }
        this.onFilter();
    }

    /**
     * This method is called when the max documents input is changed.
     * @param maxDocuments The new max documents value.
     * @returns A promise which is resolved when the documents are filtered.
     * @remarks Runs the `onFilter` method.
     */
    private async onMaxDocumentsChange(maxDocuments: number): Promise<undefined> {
        this.settings.maxDocuments = maxDocuments;
        this.onFilter();
        return undefined;
    }

    /**
     * This method is called when the search box is used.
     * @param search The search text.
     * @param key The key that was pressed.
     * @returns The search text.
     * @remarks - If the `Enter` key was pressed, the search is applied.
     * - If the `Escape` key was pressed, the search is reset.
     * - After the search is applied, the `onFilter` method is called.
     */
    private async onSearch(search: string, key: string): Promise<string> {
        if (key === "Enter") {
            if (search !== "") {
                this.settings.search = Search.parseSearchText(search);
                this.onFilter();
            } else {
                this.settings.search = undefined;
                this.onFilter();
            }
        } else if (key === "Escape") {
            this.settings.search = undefined;
            this.onFilter();
            return "";
        }
        return search;
    }

    /**
     * Filters the documents and shows/hides them in the table.
     * @remarks - The documents are filtered by the `filter` setting,
     * searched by the `search` setting 
     * and the number of documents is limited by the `maxDocuments` if no search is applied.
     */
    private async onFilter() {
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
            this.logger.trace(`Document ${rowUid} is hidden by state: ${hide}`);
            this.logger.trace(`Visible rows: ${visibleRows}; Max shown Docs: ${this.settings.maxDocuments}`);
            if (visibleRows >= this.settings.maxDocuments) {
                hide = true
            }
            this.logger.trace(`Document ${rowUid} is hidden by max counts: ${hide}`);

            if (hide) {
                rows.push({ rowUid, hidden: true });
            } else {
                visibleRows++;
                rows.push({ rowUid, hidden: false });
            }

            if ((i !== 0 && i % batchSize === 0) || i === documentsLength - 1) {
                await sleepPromise;
                this.logger.trace(`Batchsize reached. Change rows: ${rows.length}`);
                await this.table.changeShowHideStateRows(rows);
                rows.length = 0;
                sleepPromise = Helper.sleep(sleepBetweenBatches);
            }
        }

        this.normalizeHeader();
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
    private async addDocumentsToTable(batchSize = this.settings.batchSize, sleepBetweenBatches = this.settings.sleepBetweenBatches): Promise<void> {
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
            const document = i + 1 < documentsLength ? this.models[i + 1] : null;

            const row = await rowPromise;
            rowPromise = document ? this.generateTableRow(document) : undefined;

            if (row && !row.hidden) {
                if (visibleRows < this.settings.maxDocuments) {
                    visibleRows++;
                } else {
                    row.hidden = true;
                }
            }

            if (row)
                rows.push(row);

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
            documentModel);

        // Row 1 -- Date
        const date = document.createDocumentFragment();
        rowData.push(date);
        GeneralComponents.createCellDate(
            date,
            this.component,
            Lng.gt("DocumentDate"),
            this.global.settings.dateFormat,
            () => documentModel.data.date ?? "na",
            async (value: string) => documentModel.data.date = value);

        // Row 2 -- File Link
        const fileLink = document.createDocumentFragment();
        rowData.push(fileLink);
        DocumentComponents.createCellFileLink(
            fileLink,
            this.component,
            documentModel);

        // Row 3 -- Sender Recipient
        const senderRecipient = DocumentComponents.createCellSenderRecipient(
            documentModel,
            this.component,
            this.models);
        rowData.push(senderRecipient);

        // Row 4 -- Summary & Related Files
        const summaryRelatedFiles = document.createDocumentFragment();
        rowData.push(summaryRelatedFiles);
        DocumentComponents.createCellSummary(
            documentModel,
            this.component,
            summaryRelatedFiles);
        DocumentComponents.createRelatedFilesList(
            summaryRelatedFiles,
            this.component,
            documentModel,
            this.settings.noneDocSymbol,
            this.global.settings.dateFormatShort);

        // Row 5 -- Date of delivery
        const deliveryDate = document.createDocumentFragment();
        rowData.push(deliveryDate);
        GeneralComponents.createCellDate(
            deliveryDate,
            this.component,
            Lng.gt("DeliveryDate"),
            this.global.settings.dateFormat,
            () => documentModel.data.dateOfDelivery ?? "na",
            async (value: string) => documentModel.data.dateOfDelivery = value);

        // Row 6 -- Tags
        const tags = document.createDocumentFragment();
        rowData.push(tags);
        DocumentComponents.createCellTags(
            tags,
            this.component,
            documentModel.getTags());

        const hide = this.getHideState(documentModel, undefined);

        const row = {
            rowUid,
            rowData,
            rowClassList,
            hidden: hide
        };
        return row;
    }

    private getHideState(document: DocumentModel, maxVisibleRows: number | undefined): boolean {
        let searchResult = false;
        let maxRows = false;

        if (this.settings.search) {
            const text = document.toString();
            searchResult = Search.applySearchLogic(this.settings.search, text);
        }

        if (maxVisibleRows && maxVisibleRows > 0) {
            const rowStats = this.table.getRowStats();
            maxRows = rowStats.visibleRows >= maxVisibleRows;
        }

        const hide = this.determineHideState(document);

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
        if (this.settings.filter.includes("Documents") && document.data.hide !== true && document.data.subType !== "Cluster") {
            return false;
        }
        if (this.settings.filter.includes("Cluster") && document.data.subType === "Cluster") {
            return false;
        }
        if (this.settings.filter.includes("HideDocuments") && document.data.hide === true) {
            return false;
        }
        return true;
    }

    /**
     * Builds the table.
     * @remarks - The table is saved in the `table` property.
     * - The table is appended to the `tableContainer`.
     * - The table has the CSS class `document-table`.
     * - The table has the headers from the `tableHeaders` property.
     */
    private async buildTable(): Promise<void> {
        this.table = new Table(this.tableHeaders, "document-table", undefined);
        this.tableContainer.appendChild(this.table.data.table);
    }

    public redraw(): Promise<void> {
        return super.redraw();
    }

    /**
     * Parses the settings given by the user per YAML in code block.
     * @remarks The settings are parsed and saved in the `settings` property.
     * @remarks Settings:
     * - `tags`: Can be `all`, `this` or a list of tags.
     * `this` means the tags of the current document.
     * - `maxDocuments`: The maximum number of documents to show on same time.
     * - `filter`: Must be an array. You can add the following values:
     * `Documents`, `HideDocuments` or `Cluster`. The values present the document types.
     * All values that are in the array are shown.
     */
    protected parseSettings(): void {
        this.processorSettings.options.forEach(option => {
            switch (option.label) {
                case "tags":
                    if (option.value === "all") {
                        this.settings.tags = [];
                    } else if (option.value === "this") {
                        const tags = this.processorSettings?.frontmatter?.tags;
                        if (Array.isArray(tags)) {
                            this.settings.tags.push(...tags);
                        } else if (tags) {
                            this.settings.tags.push(tags);
                        }
                    } else {
                        this.settings.tags = option.value;
                    }
                    break;
                case "maxDocuments":
                    this.settings.maxDocuments = option.value;
                    break;
                case "filter":
                    this.settings.filter = option.value;
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * Returns the models for the table.
     * @returns The models for the table.
     * @remarks - The models are the documents.
     * - The documents are filtered by the `tags` setting. 
     * If tags are empty, all documents are returned, 
     * else only the documents with the tags are returned.
     */
    protected async getModels(): Promise<DocumentModel[]> {
        const templateFolder = this.global.settings.templateFolder;
        const allDocumentFiles = this.metadataCache.filter(file => {
            const defaultFilter = file.metadata.frontmatter?.type === "Metadata" &&
                file.file.path !== this.processorSettings.source &&
                !file.file.path.startsWith(templateFolder);
            if (this.settings.tags.length > 0) {
                const tagFilter = Helper.isTagIncluded(this.settings.tags, file.metadata.frontmatter?.tags);
                return defaultFilter && tagFilter;
            }
            return defaultFilter;
        });
        const documents = allDocumentFiles.map(file => new DocumentModel(file.file));
        return documents;
    }

    /**
     * Returns if the file tags are included in the setting tags.
     * @param fileTags The tags of the file.
     * @param settingTags The tags of the settings.
     * @returns If the file tags are included in the setting tags.
     * @remarks - If the file tags are an array, one tag must be included.
     * - If the file tags are a string, the string must be included.
     */
    private isTagIncluded(fileTags: string | string[], settingTags: string[]): boolean {
        if (Array.isArray(fileTags)) {
            return fileTags.some(tag => settingTags.includes(tag));
        } else {
            return settingTags.includes(fileTags);
        }
    }

}

/**
 * The types of documents to show.
 * @remarks - `Documents` - Show documents.
 * - `HideDocuments` - Show hidden documents.
 * - `Cluster` - Show clusters.
 */
type FilteredDocument = "Documents" | "HideDocuments" | "Cluster";

/**
 * The settings for the document block render component.
 * @remarks The settings are parsed from the YAML options in the code block.
 */
type DocumentBlockRenderSettings = {
    /**
     * The tags associated with the documents.
     * Can be `all`, `this` or a list of specific tags.
     * `all` includes all documents regardless of their tags.
     * `this` includes documents that have the same tags as the current document.
     */
    tags: string[],

    /**
     * Symbol representing a document.
     */
    docSymbol: string,

    /**
     * Symbol used to indicate hidden documents.
     */
    hideDocSymbol: string,

    /**
     * Symbol representing a cluster of documents.
     */
    clusterSymbol: string,

    /**
     * Symbol used for documents that don't fit any other category.
     */
    noneDocSymbol: string,

    /**
     * Filter for the document types to display.
     * Must be an array containing any of the following values:
     * `Documents`, `HideDocuments`, `Cluster`.
     * Only the document types listed in the array will be shown.
     */
    filter: FilteredDocument[],

    /**
     * The maximum number of documents to show at the same time.
     */
    maxDocuments: number,

    /**
     * Search terms array used to filter the documents.
     * If undefined, no search filter is applied.
     */
    search: SearchTermsArray | undefined,

    /**
     * The number of documents to process in one batch.
     */
    batchSize: number,

    /**
     * The time to wait (in milliseconds) between processing batches of documents.
     */
    sleepBetweenBatches: number
};
