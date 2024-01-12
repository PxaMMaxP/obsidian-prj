import TableBlockRenderComponent from "./TableBlockRenderComponent";
import { PrjTaskManagementModel } from "src/models/PrjTaskManagementModel";
import TaskData from "src/types/TaskData";
import TopicData from "src/types/TopicData";
import ProjectData from "src/types/ProjectData";
import { IProcessorSettings } from "src/interfaces/IProcessorSettings";
import Search, { SearchTermsArray } from "../Search";
import Table, { Row, RowsState, TableHeader } from "../Table";
import Lng from "src/classes/Lng";
import FilterButton from "./InnerComponents/FilterButton";
import MaxShownModelsInput from "./InnerComponents/MaxShownModelsInput";
import SearchInput from "./InnerComponents/SearchInput";
import Helper from "../Helper";
import { TopicModel } from "src/models/TopicModel";
import { ProjectModel } from "src/models/ProjectModel";
import { TaskModel } from "src/models/TaskModel";
import { Priority, Status } from "src/types/PrjTypes";
import DocumentComponents from "./InnerComponents/DocumentComponents";
import ProjectComponents from "./InnerComponents/ProjectComponents";
import GeneralComponents from "./InnerComponents/GeneralComponents";

export default class ProjectBlockRenderComponent extends TableBlockRenderComponent<PrjTaskManagementModel<TaskData | TopicData | ProjectData>> {
    protected settings: ProjectBlockRenderSettings = {
        tags: [],
        topicSymbol: this.global.settings.prjSettings.topicSymbol,
        projectSymbol: this.global.settings.prjSettings.projectSymbol,
        taskSymbol: this.global.settings.prjSettings.taskSymbol,
        otherSymbol: "diamond",
        filter: ["Topic", "Project", "Task"],
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
        { text: Lng.gt("TraficLight"), headerClass: [], columnClass: [] },
        { text: Lng.gt("Description"), headerClass: [], columnClass: ["dont-decorate-link", "link-weight-bold"] },
        { text: Lng.gt("Priority"), headerClass: [], columnClass: [] },
        { text: Lng.gt("DueDate"), headerClass: [], columnClass: ["font-xsmall"] },
        { text: Lng.gt("Status"), headerClass: [], columnClass: [] },
        { text: Lng.gt("Tags"), headerClass: [], columnClass: ["tags"] }
    ];

    constructor(settings: IProcessorSettings) {
        super(settings);
        this.parseSettings();
    }

    public build(): Promise<void> {
        return super.build();
    }

    protected async draw(): Promise<void> {
        const startTime = Date.now();

        const getModelsPromise = this.getModels();
        await super.draw();
        await this.buildTable();
        await this.buildHeader();
        this.grayOutHeader();
        this.models = (await getModelsPromise);

        PrjTaskManagementModel.sortModelsByUrgency(this.models as (PrjTaskManagementModel<TaskData | TopicData | ProjectData>)[]);
        await this.addDocumentsToTable();
        this.normalizeHeader();
        const endTime = Date.now();
        this.logger.debug(`Redraw (for ${this.models.length} Models) runs for ${endTime - startTime}ms`);
    }

    private async buildTable(): Promise<void> {
        this.table = new Table(this.tableHeaders, "project-table", undefined);
        this.tableContainer.appendChild(this.table.data.table);
    }

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

        const topicFilterButton = FilterButton.create(
            this.component,
            "Topic",
            this.settings.topicSymbol,
            this.settings.filter.includes("Topic"),
            this.onFilterButton.bind(this));
        headerFilterButtons.appendChild(topicFilterButton);

        const projectFilterButton = FilterButton.create(
            this.component,
            "Project",
            this.settings.projectSymbol,
            this.settings.filter.includes("Project"),
            this.onFilterButton.bind(this));
        headerFilterButtons.appendChild(projectFilterButton);

        const taskFilterButton = FilterButton.create(
            this.component,
            "Task",
            this.settings.taskSymbol,
            this.settings.filter.includes("Task"),
            this.onFilterButton.bind(this));
        headerFilterButtons.appendChild(taskFilterButton);

        const doneFilterButton = FilterButton.create(
            this.component,
            "Done",
            "check-square",
            this.settings.filter.includes("Done"),
            this.onFilterButton.bind(this));
        headerFilterButtons.appendChild(doneFilterButton);

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

    private async addDocumentsToTable(batchSize = this.settings.batchSize, sleepBetweenBatches = this.settings.sleepBetweenBatches): Promise<void> {
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

            if (row)
                rows.push(row);

            if ((i !== 0 && i % batchSize === 0) || i === modelsLength - 1) {
                await sleepPromise;
                this.table.addRows(rows);
                rows.length = 0;
                sleepPromise = Helper.sleep(sleepBetweenBatches);
            }
        }
    }

    private async generateTableRow(model: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>)): Promise<Row> {
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
            model.getCorospondingSymbol());

        // Row 1 -- Trafic Light
        const traficLight = document.createDocumentFragment();
        rowData.push(traficLight);
        ProjectComponents.createTraficLight(traficLight, model.getUrgency());

        // Row 2 -- Title & Description
        const titleAndSummary = document.createDocumentFragment();
        rowData.push(titleAndSummary);
        ProjectComponents.createTitle(
            titleAndSummary,
            this.component,
            model.file.path,
            () => model.data.title ?? "",
            async (value: string) => model.data.title = value);

        const lineBreak = document.createElement('br');
        titleAndSummary.appendChild(lineBreak);

        ProjectComponents.createSummary(
            titleAndSummary,
            this.component,
            model.data.description ?? "",
            (value: string) => model.data.description = value);

        // Row 3 -- Priority
        const priority = document.createDocumentFragment();
        rowData.push(priority);
        ProjectComponents.createPriority(
            priority,
            this.component,
            () => model.data.priority?.toString() ?? "0",
            async (value: string) => model.data.priority = value as unknown as Priority);

        // Row 4 -- Due Date
        const dueDate = document.createDocumentFragment();
        rowData.push(dueDate);
        GeneralComponents.createCellDate(
            dueDate,
            this.component,
            Lng.gt("DueDate"),
            this.global.settings.dateFormat,
            () => model.data.due ?? "na",
            async (value: string) => model.data.due = value);

        // Row 5 -- Status
        const status = document.createDocumentFragment();
        rowData.push(status);
        ProjectComponents.createStatus(
            status,
            this.component,
            () => model.data.status ?? "Active",
            async (value: string) => model.data.status = value as unknown as Status);

        // Row 6 -- Tags
        const tags = document.createDocumentFragment();
        rowData.push(tags);
        DocumentComponents.createCellTags(
            tags,
            this.component,
            model.getTags());


        const hide = this.getHideState(model, this.settings.maxDocuments);

        const row = {
            rowUid,
            rowData,
            rowClassList,
            hidden: hide
        };
        return row;
    }

    private async onFilterButton(type: string, status: boolean): Promise<void> {
        if (this.settings.filter.includes(type as FilteredModels)) {
            this.settings.filter = this.settings.filter.filter(v => v !== type);
        } else {
            this.settings.filter.push(type as FilteredModels);
        }
        this.onFilter();
    }

    private async onMaxDocumentsChange(maxDocuments: number): Promise<undefined> {
        this.settings.maxDocuments = maxDocuments;
        this.onFilter();
        return undefined;
    }

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
            if (visibleRows >= this.settings.maxDocuments) {
                hide = true
            }

            if (hide) {
                rows.push({ rowUid, hidden: true });
            } else {
                visibleRows++;
                rows.push({ rowUid, hidden: false });
            }

            if ((i !== 0 && i % batchSize === 0) || i === documentsLength - 1) {
                await sleepPromise;
                this.table.changeShowHideStateRows(rows);
                rows.length = 0;
                sleepPromise = Helper.sleep(sleepBetweenBatches);
            }
        }

        this.normalizeHeader();
    }

    private getHideState(model: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>), maxVisibleRows: number | undefined): boolean {
        let searchResult = false;
        let maxRows = false;

        if (!this.settings.filter.includes("Done") && model.data.status === "Done") {
            return true;
        }

        if (this.settings.search) {
            const text = model.toString();
            searchResult = Search.applySearchLogic(this.settings.search, text);
        }

        if (maxVisibleRows && maxVisibleRows > 0) {
            const rowStats = this.table.getRowStats();
            maxRows = rowStats.visibleRows >= maxVisibleRows;
        }

        const hide = this.determineHideState(model);

        if (searchResult && !hide) {
            return false; // Shows the document, if it is not hidden and the search was successful
        } else if (this.settings.search) {
            return true; // Hide the document, if the search was not successful and aplicable
        } else if (!searchResult) {
            return maxRows || hide; // Else the document is hidden, if the max rows are reached or the document type is hidden
        }

        return hide; // Standard-Verhalten
    }

    private determineHideState(model: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>)): boolean {
        if (this.settings.filter.includes("Topic") && model.data.type === "Topic") {
            return false;
        }
        if (this.settings.filter.includes("Project") && model.data.type === "Project") {
            return false;
        }
        if (this.settings.filter.includes("Task") && model.data.type === "Task") {
            return false;
        }
        return true;
    }

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

    protected async getModels(): Promise<(PrjTaskManagementModel<TaskData | TopicData | ProjectData>)[]> {
        const templateFolder = this.global.settings.templateFolder;
        const allModelFiles = this.metadataCache.filter(file => {
            const defaultFilter = (file.metadata.frontmatter?.type === "Topic" || file.metadata.frontmatter?.type === "Project" || file.metadata.frontmatter?.type === "Task") &&
                file.file.path !== this.processorSettings.source &&
                !file.file.path.startsWith(templateFolder);
            if (this.settings.tags.length > 0) {
                const tagFilter = Helper.isTagIncluded(this.settings.tags, file.metadata.frontmatter?.tags);
                return defaultFilter && tagFilter;
            }
            return defaultFilter;
        });
        const models: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>)[] = [];
        allModelFiles.forEach(file => {
            switch (file.metadata.frontmatter?.type) {
                case "Topic":
                    models.push(new TopicModel(file.file) as PrjTaskManagementModel<TopicData>);
                    break;
                case "Project":
                    models.push(new ProjectModel(file.file) as PrjTaskManagementModel<ProjectData>);
                    break;
                case "Task":
                    models.push(new TaskModel(file.file) as PrjTaskManagementModel<TaskData>);
                    break;
                default:
                    break;
            }
        });
        return models;
    }
}

/**
 * The types of models to show.
 * @remarks - `Topic` includes all topics.
 * - `Project` includes all projects.
 * - `Task` includes all tasks.
 */
type FilteredModels = "Topic" | "Project" | "Task" | "Done";

/**
 * The settings for the project block render component.
 * @remarks The settings are parsed from the YAML options in the code block.
 */
type ProjectBlockRenderSettings = {
    /**
     * The tags associated with the documents.
     * Can be `all`, `this` or a list of specific tags.
     * `all` includes all documents regardless of their tags.
     * `this` includes documents that have the same tags as the current document.
     */
    tags: string[],

    /**
     * Symbol representing a topic.
     */
    topicSymbol: string,

    /**
     * Symbol representing a project.
     */
    projectSymbol: string,

    /**
     * Symbol representing a task.
     */
    taskSymbol: string,

    /**
     * Symbol used for documents that don't fit any other category.
     */
    otherSymbol: string,

    /**
     * Filter for the model types to display.
     * Must be an array containing any of the following values:
     * `Topic`, `Project`, `Task`.
     * Only the types listed in the array will be shown.
     */
    filter: FilteredModels[],

    /**
     * The maximum number of models to show at the same time.
     */
    maxDocuments: number,

    /**
     * Search terms array used to filter the models.
     * If undefined, no search filter is applied.
     */
    search: SearchTermsArray | undefined,

    /**
     * The number of models to process in one batch.
     */
    batchSize: number,

    /**
     * The time to wait (in milliseconds) between processing batches of models.
     */
    sleepBetweenBatches: number
};