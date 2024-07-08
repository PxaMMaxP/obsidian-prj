import API from 'src/classes/API';
import Lng from 'src/classes/Lng';
import Logging from 'src/classes/Logging';
import IPrjData from 'src/interfaces/IPrjData';
import IPrjTaskManagement from 'src/interfaces/IPrjTaskManagement';
import { IProcessorSettings } from 'src/interfaces/IProcessorSettings';
import BaseData from 'src/models/Data/BaseData';
import ProjectData from 'src/models/Data/ProjectData';
import TaskData from 'src/models/Data/TaskData';
import TopicData from 'src/models/Data/TopicData';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import { Priority, Status } from 'src/types/PrjTypes';
import FilterButton from './InnerComponents/FilterButton';
import GeneralComponents from './InnerComponents/GeneralComponents';
import MaxShownModelsInput from './InnerComponents/MaxShownModelsInput';
import ProjectComponents from './InnerComponents/ProjectComponents';
import SearchInput from './InnerComponents/SearchInput';
import TableBlockRenderComponent, {
    BlockRenderSettings,
} from './TableBlockRenderComponent';
import Helper from '../Helper';
import { FileMetadata } from '../MetadataCache';
import Table, { Row, TableHeader } from '../Table';

/**
 * Represents a block render component for `PrjTaskManagementModel`.
 */
export default class ProjectBlockRenderComponent extends TableBlockRenderComponent<
    PrjTaskManagementModel<IPrjData & IPrjTaskManagement & BaseData<unknown>>
> {
    private _filterButtonDebounceTimer: NodeJS.Timeout;
    protected settings: BlockRenderSettings = {
        tags: [],
        reactOnActiveFile: false,
        filter: ['Topic', 'Project', 'Task'],
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
        { text: Lng.gt('TraficLight'), headerClass: [], columnClass: [] },
        {
            text: Lng.gt('Description'),
            headerClass: [],
            columnClass: ['dont-decorate-link', 'link-weight-bold'],
        },
        { text: Lng.gt('Priority'), headerClass: [], columnClass: [] },
        {
            text: Lng.gt('Due date'),
            headerClass: [],
            columnClass: ['font-xsmall'],
        },
        { text: Lng.gt('Status'), headerClass: [], columnClass: [] },
        { text: Lng.gt('Tags'), headerClass: [], columnClass: ['tags'] },
    ];

    /**
     * Creates an instance of `ProjectBlockRenderComponent`.
     * @param settings The settings for the processor.
     */
    constructor(settings: IProcessorSettings) {
        super(settings);
        this.parseSettings();
    }

    /**
     * Build the basic structure of the component.
     * @returns A promise that resolves when the component is built.
     */
    public build(): Promise<void> {
        return super.build();
    }

    /**
     * Redraw the component.
     * @returns A promise that resolves when the component is redrawn.
     */
    public redraw(): Promise<void> {
        return super.redraw();
    }

    /**
     * Draw the component.
     * @returns A promise that resolves when the component is drawn.
     */
    protected async draw(): Promise<void> {
        const startTime = Date.now();

        const getModelsPromise = super.getModels(
            ['Topic', 'Project', 'Task'],
            this.settings.tags,
            (metadata: FileMetadata) =>
                API.prjTaskManagementModel.getCorospondingModel(metadata.file),
        );
        await super.draw();
        await this.buildTable();
        await this.buildHeader();
        this.grayOutHeader();
        this.models = await getModelsPromise;

        API.prjTaskManagementModel.sortModelsByUrgency(
            this.models as PrjTaskManagementModel<
                TaskData | TopicData | ProjectData
            >[],
        );
        await this.addDocumentsToTable();
        this.normalizeHeader();
        const endTime = Date.now();

        this.logger.debug(
            `Redraw (for ${this.models.length} Models) runs for ${endTime - startTime}ms`,
        );
    }

    /**
     * Build the basic table structure.
     */
    private async buildTable(): Promise<void> {
        this.table = new Table(
            this.tableHeaders,
            'project-table',
            undefined,
            Logging.getLogger('ProjectBlockRenderComponent/Table'),
        );
        this.tableContainer.appendChild(this.table.data.table);
    }

    /**
     * Build the header of the component.
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

        const topicFilterButton = FilterButton.create(
            this.component,
            'Topic',
            this.globalSettings.prjSettings.topicSymbol,
            this.settings.filter.includes('Topic'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(topicFilterButton);

        const projectFilterButton = FilterButton.create(
            this.component,
            'Project',
            this.globalSettings.prjSettings.projectSymbol,
            this.settings.filter.includes('Project'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(projectFilterButton);

        const taskFilterButton = FilterButton.create(
            this.component,
            'Task',
            this.globalSettings.prjSettings.taskSymbol,
            this.settings.filter.includes('Task'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(taskFilterButton);

        const doneFilterButton = FilterButton.create(
            this.component,
            'Done',
            'check-square',
            this.settings.filter.includes('Done'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(doneFilterButton);

        const deepHierarchyFilterButton = FilterButton.create(
            this.component,
            'DeepHierarchy',
            'gantt-chart',
            this.settings.filter.includes('DeepHierarchy'),
            this.onFilterButton.bind(this),
        );
        headerFilterButtons.appendChild(deepHierarchyFilterButton);

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
     * Add the documents to the table.
     * @param batchSize The size of the batch.
     * @param sleepBetweenBatches The time to sleep between batches.
     */
    private async addDocumentsToTable(
        batchSize = this.settings.batchSize,
        sleepBetweenBatches = this.settings.sleepBetweenBatches,
    ): Promise<void> {
        let sleepPromise = Promise.resolve();
        const modelsLength = this.models.length;
        const rows: Row[] = [];
        let rowPromise: Promise<Row> | undefined = undefined;

        if (modelsLength > 0) {
            rowPromise = this.generateTableRow(this.models[0]);
        } else {
            return;
        }

        let visibleRows = 0;

        for (let i = 0; i < modelsLength; i++) {
            const model = i + 1 < modelsLength ? this.models[i + 1] : null;

            const row = await rowPromise;
            rowPromise = model ? this.generateTableRow(model) : undefined;

            if (row && !row.hidden) {
                if (visibleRows < this.settings.maxDocuments) {
                    visibleRows++;
                } else {
                    row.hidden = true;
                }
            }

            if (row) rows.push(row);

            if ((i !== 0 && i % batchSize === 0) || i === modelsLength - 1) {
                await sleepPromise;
                this.table.addRows(rows);
                rows.length = 0;
                sleepPromise = Helper.sleep(sleepBetweenBatches);
            }
        }
    }

    /**
     * Generate a table row for a model.
     * @param model The model to generate the row for.
     * @returns The generated row.
     */
    private async generateTableRow(
        model: PrjTaskManagementModel<
            IPrjData & IPrjTaskManagement & BaseData<unknown>
        >,
    ): Promise<Row> {
        const rowClassList: string[] = [];
        const rowData: DocumentFragment[] = [];
        const rowUid = this.getUID(model);

        // Row 0 -- Metadata Link
        const metadataLink = document.createDocumentFragment();
        rowData.push(metadataLink);

        GeneralComponents.createMetadataLink(
            metadataLink,
            this.component,
            model.file.path,
            model.data.type,
            model.getCorospondingSymbol(),
        );

        // Row 1 -- Trafic Light
        const traficLight = document.createDocumentFragment();
        rowData.push(traficLight);
        ProjectComponents.createTraficLight(traficLight, model.urgency);

        // Row 2 -- Title & Description
        const titleAndSummary = document.createDocumentFragment();
        rowData.push(titleAndSummary);

        ProjectComponents.createTitle(
            titleAndSummary,
            this.component,
            model.file.path,
            () => model.data.title ?? '',
            async (value: string) => (model.data.title = value),
        );

        const lineBreak = document.createElement('br');
        titleAndSummary.appendChild(lineBreak);

        ProjectComponents.createSummary(
            titleAndSummary,
            this.component,
            model.data.description ?? '',
            (value: string) => (model.data.description = value),
        );

        // Row 3 -- Priority
        const priority = document.createDocumentFragment();
        rowData.push(priority);

        ProjectComponents.createPriority(
            priority,
            this.component,
            () => model.data.priority?.toString() ?? '0',
            async (value: string) =>
                (model.data.priority = value as unknown as Priority),
        );

        // Row 4 -- Due Date
        const dueDate = document.createDocumentFragment();
        rowData.push(dueDate);

        GeneralComponents.createCellDate(
            dueDate,
            this.component,
            Lng.gt('Due date'),
            this.global.settings.dateFormat,
            () => model.data.due ?? 'na',
            async (value: string) => (model.data.due = value),
        );

        // Row 5 -- Status
        const status = document.createDocumentFragment();
        rowData.push(status);

        ProjectComponents.createStatus(
            status,
            this.component,
            () => model.data.status ?? 'Active',
            async (value: string) =>
                (model.data.status = value as unknown as Status),
        );

        // Row 6 -- Tags
        const tags = document.createDocumentFragment();
        rowData.push(tags);

        GeneralComponents.createCellTags(
            tags,
            this.component,
            model.data.tags?.toStringArray() ?? [],
        );

        const hide = this.getHideState(model, this.settings.maxDocuments);

        const row = {
            rowUid,
            rowData,
            rowClassList,
            hidden: hide,
        };

        return row;
    }

    /**
     * Called when the search input changes or a filter is applied.
     * @param type The type of the filter.
     * @param status The status of the filter.
     */
    private async onFilterButton(type: string, status: boolean): Promise<void> {
        if (this.settings.filter.includes(type as FilteredModels)) {
            this.settings.filter = this.settings.filter.filter(
                (v) => v !== type,
            );
        } else {
            this.settings.filter.push(type as FilteredModels);
        }
        await this.onFilterDebounce();
    }

    /**
     * Debounce the filter button.
     */
    private async onFilterDebounce(): Promise<void> {
        clearTimeout(this._filterButtonDebounceTimer);

        this._filterButtonDebounceTimer = setTimeout(async () => {
            await this.onFilter();
        }, 750);
    }

    /**
     * Called when the maximum documents to show changes.
     * @param maxDocuments The maximum documents to show.
     * @returns A promise that resolves when the maximum documents to show changes.
     */
    private async onMaxDocumentsChange(
        maxDocuments: number,
    ): Promise<undefined> {
        this.settings.maxDocuments = maxDocuments;
        this.onFilter();

        return undefined;
    }

    /**
     * Get the hide state of a model.
     * @param model The model to get the hide state for.
     * @param maxVisibleRows The maximum visible rows.
     * @returns Whether the model should be hidden.
     */
    protected getHideState(
        model: PrjTaskManagementModel<
            IPrjData & IPrjTaskManagement & BaseData<unknown>
        >,
        maxVisibleRows: number | undefined,
    ): boolean {
        let searchResult = false;
        let maxRows = false;

        if (
            !this.settings.filter.includes('Done') &&
            model.data.status === 'Done'
        ) {
            return true;
        }

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
     * Determine the hide state of a model.
     * @param model The model to determine the hide state for.
     * @returns Whether the model should be hidden.
     */
    private determineHideState(
        model: PrjTaskManagementModel<
            IPrjData & IPrjTaskManagement & BaseData<unknown>
        >,
    ): boolean {
        if (
            this.settings.filter.includes('Topic') &&
            model.data.type === 'Topic'
        ) {
            return false;
        }

        if (
            this.settings.filter.includes('Project') &&
            model.data.type === 'Project'
        ) {
            return false;
        }

        if (
            this.settings.filter.includes('Task') &&
            model.data.type === 'Task'
        ) {
            return false;
        }

        return true;
    }

    /**
     * Determine the tag hide state of a model.
     * @param document The document to determine the tag hide state for.
     * @returns Whether the model should be hidden.
     */
    private determineTagHideState(
        document: PrjTaskManagementModel<
            IPrjData & IPrjTaskManagement & BaseData<unknown>
        >,
    ): boolean {
        if (this.settings.reactOnActiveFile) {
            return !Helper.isTagIncluded(
                this.settings.tags,
                document.data.tags?.toStringArray() ?? [],
            );
        } else if (this.settings.filter.includes('DeepHierarchy')) {
            return false;
        } else {
            return !Helper.isTagDirectlyBelow(
                this.settings.tags,
                document.data.tags?.toStringArray() ?? [],
            );
        }
    }

    /**
     * Called when the search input changes.
     */
    public onActiveFileFilter() {
        this.onFilter();
    }
}

/**
 * The types of models to show.
 * @remarks - `Topic` includes all topics.
 * - `Project` includes all projects.
 * - `Task` includes all tasks.
 * - `Done` includes all done tasks.
 * - `DeepHierarchy` includes all models that are below the active file.
 */
type FilteredModels = 'Topic' | 'Project' | 'Task' | 'Done' | 'DeepHierarchy';
