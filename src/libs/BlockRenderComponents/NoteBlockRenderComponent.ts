import { DocumentModel } from "src/models/DocumentModel";
import TableBlockRenderComponent, { BlockRenderSettings } from "./TableBlockRenderComponent";
import { IProcessorSettings } from "../../interfaces/IProcessorSettings";
import Search from "../Search";
import Table, { Row, RowsState, TableHeader } from "../Table";
import Lng from "src/classes/Lng";
import MaxShownModelsInput from "./InnerComponents/MaxShownModelsInput";
import SearchInput from "./InnerComponents/SearchInput";
import Helper from "../Helper";
import GeneralComponents from "./InnerComponents/GeneralComponents";
import API from "src/classes/API";
import { FileMetadata } from "../MetadataCache";
import { NoteModel } from "src/models/NoteModel";
import ProjectComponents from "./InnerComponents/ProjectComponents";
import EditableDataView from "../EditableDataView/EditableDataView";

/**
 * Document block render component class for `TableBlockRenderComponent`.
 * @remarks This class provides methods to create and manage a document block render component.
 * @see {@link create} for details about creating a document block render component.
 */
export default class NoteBlockRenderComponent extends TableBlockRenderComponent<NoteModel> {
    protected settings: BlockRenderSettings = {
        tags: [],
        reactOnActiveFile: false,
        filter: ["Note"],
        maxDocuments: this.global.settings.defaultMaxShow,
        search: undefined,
        searchText: undefined,
        batchSize: 8,
        sleepBetweenBatches: 10
    };

    /**
     * The table headers.
     * @remarks The table headers are used to create the table.
     * 
     */
    protected tableHeaders: TableHeader[] = [
        { text: Lng.gt("Date"), headerClass: [], columnClass: ["font-xsmall"] },
        { text: Lng.gt("Notice"), headerClass: [], columnClass: [] },
        { text: Lng.gt("Description"), headerClass: [], columnClass: ["font-xsmall"] },
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

        const documentsPromise = super.getModels(
            ['Note'],
            this.settings.tags,
            (metadata: FileMetadata) => new NoteModel(metadata.file));
        await super.draw();
        await this.buildTable();
        await this.buildHeader();
        this.grayOutHeader();
        this.models = (await documentsPromise);

        API.documentModel.sortDocumentsByDateDesc(this.models as unknown as DocumentModel[]);
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

        const maxDocuments = MaxShownModelsInput.create(
            this.component,
            this.settings.maxDocuments,
            this.global.settings.defaultMaxShow,
            this.onMaxDocumentsChange.bind(this));
        headerFilterButtons.appendChild(maxDocuments);

        const searchBox = SearchInput.create(
            this.component,
            this.onSearch.bind(this),
            this.settings.searchText);
        headerFilterButtons.appendChild(searchBox);
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
                this.settings.searchText = search;
                this.settings.search = Search.parseSearchText(search);
                this.onFilter();
            } else {
                this.settings.searchText = undefined;
                this.settings.search = undefined;
                this.onFilter();
            }
        } else if (key === "Escape") {
            this.settings.searchText = undefined;
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
            let hide = this.determineTagHideState(document);
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
            this.component,
            Lng.gt("DocumentDate"),
            this.global.settings.dateFormat,
            () => noteModel.data.date ?? "na",
            async (value: string) => noteModel.data.date = value);

        // Row 1 -- File Link & Title
        const fileLink = document.createDocumentFragment();
        rowData.push(fileLink);
        new EditableDataView(fileLink, this.component)
            .addLink(link => link
                .setValue(noteModel.data.title ?? "na")
                .setTitle("Note")
                .setLinkType("file")
                .setFormator((value: string) => {
                    return { href: `${noteModel.file.path}`, text: `${value}`, html: undefined };
                })
                .enableEditability()
                .onSave((value: string) => {
                    noteModel.data.title = value;
                    return Promise.resolve();
                }));

        // Row 2 -- Description
        const description = document.createDocumentFragment();
        rowData.push(description);
        ProjectComponents.createSummary(
            description,
            this.component,
            noteModel.data.description ?? "",
            async (value: string) => noteModel.data.description = value);

        // Row 3 -- Tags
        const tags = document.createDocumentFragment();
        rowData.push(tags);
        GeneralComponents.createCellTags(
            tags,
            this.component,
            noteModel.getTags());


        const row = {
            rowUid,
            rowData,
            rowClassList,
            hidden: false
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

        const hide = false;

        if (searchResult && !hide) {
            return false; // Shows the document, if it is not hidden and the search was successful
        } else if (this.settings.search) {
            return true; // Hide the document, if the search was not successful and aplicable
        } else if (!searchResult) {
            return maxRows || hide; // Else the document is hidden, if the max rows are reached or the document type is hidden
        }

        return hide; // Standard-Verhalten
    }

    private determineTagHideState(document: NoteModel): boolean {
        return this.settings.reactOnActiveFile ? !Helper.isTagIncluded(this.settings.tags, document.getTags()) : false;
    }

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
        this.table = new Table(this.tableHeaders, "document-table", undefined);
        this.tableContainer.appendChild(this.table.data.table);
    }

    public redraw(): Promise<void> {
        return super.redraw();
    }

}