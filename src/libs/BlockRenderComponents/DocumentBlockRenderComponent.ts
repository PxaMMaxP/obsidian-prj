import { MarkdownRenderChild, MarkdownRenderer, TFile, setIcon } from "obsidian";
import { ProcessorSettings } from "../MarkdownBlockProcessor";
import { DocumentModel } from "src/models/DocumentModel";
import Global from "src/classes/Global";
import Table, { Row, RowsState, TableHeader } from "../Table";
import Helper from "../Helper";
import EditableDataView from "../EditableDataView/EditableDataView";
import Lng from "src/classes/Lng";
import RedrawableBlockRenderComponent from "./RedrawableBlockRenderComponent";
import Search, { SearchTermsArray } from "../Search";

export default class DocumentBlockRenderComponent implements RedrawableBlockRenderComponent {
    private global = Global.getInstance();
    private logger = this.global.logger;
    private metadataCache = this.global.metadataCache.Cache;
    private fileCache = this.global.fileCache;
    private processorSettings: ProcessorSettings;
    private component: MarkdownRenderChild;
    private settings: {
        tags: string | string[],
        docSymbol: string,
        hideDocSymbol: string,
        clusterSymbol: string,
        noneDocSymbol: string,
        filter: FilteredDocument[],
        maxDocuments: number,
        search: SearchTermsArray | undefined
    }
        = {
            tags: "",
            docSymbol: this.global.settings.documentSettings.symbol,
            hideDocSymbol: this.global.settings.documentSettings.hideSymbol,
            clusterSymbol: this.global.settings.documentSettings.clusterSymbol,
            noneDocSymbol: "diamond",
            filter: ["Documents"],
            maxDocuments: this.global.settings.defaultMaxShow,
            search: undefined
        };
    private documents: DocumentModel[];
    private headerContainer: HTMLElement;
    private tableContainer: HTMLElement;
    private table: Table;
    private tableHeaders: TableHeader[] = [
        { text: Lng.gt("DocumentType"), headerClass: [], columnClass: ["main-document-symbol", "font-medium"] },
        { text: Lng.gt("Date"), headerClass: [], columnClass: ["font-xsmall"] },
        { text: Lng.gt("Subject"), headerClass: [], columnClass: [] },
        { text: Lng.gt("SendRecip"), headerClass: [], columnClass: ["font-xsmall"] },
        { text: Lng.gt("Content"), headerClass: [], columnClass: ["font-xsmall"] },
        { text: Lng.gt("DeliveryDate"), headerClass: [], columnClass: ["font-xsmall"] },
        { text: Lng.gt("Tags"), headerClass: [], columnClass: ["tags"] }
    ];

    constructor(settings: ProcessorSettings) {
        this.processorSettings = settings;
        this.component = new MarkdownRenderChild(this.processorSettings.container);
        this.parseSettings();
    }

    public async build(): Promise<void> {
        const startTime = Date.now();

        await this.draw();

        const endTime = Date.now();
        this.logger.debug(`Build Documents (for ${this.documents.length} Docs.) runs for ${endTime - startTime}ms`);
    }

    public async redraw(): Promise<void> {
        const startTime = Date.now();
        this.processorSettings.container.innerHTML = "";
        await this.draw();
        const endTime = Date.now();
        this.logger.debug(`Redraw Documents (for ${this.documents.length} Docs.) runs for ${endTime - startTime}ms`);
    }

    private async draw(): Promise<void> {
        const documentsPromise = this.getDocuments();
        this.documents = (await documentsPromise);

        this.headerContainer = document.createElement('div');
        this.processorSettings.container.appendChild(this.headerContainer);
        this.headerContainer.classList.add('header-container');
        this.buildHeader();

        this.tableContainer = document.createElement('div');
        this.processorSettings.container.appendChild(this.tableContainer);
        this.tableContainer.classList.add('table-container');
        await this.buildTable();

        this.logger.debug(`${this.documents.length} Documents found.`);
        //this.documents = this.documents.splice(0, 200);
        DocumentModel.sortDocumentsByDateDesc(this.documents);

        await this.addDocumentsToTable(50, 50);
    }

    private async buildHeader(): Promise<void> {
        const blockControle = document.createElement('div');
        this.headerContainer.appendChild(blockControle);
        blockControle.classList.add('block-controle');

        // Refresh Button
        const refreshButton = document.createElement('a');
        blockControle.appendChild(refreshButton);
        refreshButton.classList.add('refresh-button');
        refreshButton.title = Lng.gt("Refresh");
        refreshButton.href = "#";
        setIcon(refreshButton, "refresh-cw");
        this.component.registerDomEvent(refreshButton, 'click', async (event: MouseEvent) => {
            event.preventDefault();
            this.redraw();
        });

        // Other Header Items
        const headerFilterDocs = document.createElement('div');
        this.headerContainer.appendChild(headerFilterDocs);
        headerFilterDocs.classList.add('header-item');
        headerFilterDocs.classList.add('filter-symbols');
        const filterLabelContainer = document.createElement('div');
        headerFilterDocs.appendChild(filterLabelContainer);
        const filterLabel = document.createElement('span');
        filterLabelContainer.appendChild(filterLabel);
        filterLabel.classList.add('filter-symbol');
        filterLabel.textContent = Lng.gt("Filter");
        this.createFilterButton(headerFilterDocs, "Documents", this.settings.docSymbol);
        this.createFilterButton(headerFilterDocs, "HideDocuments", this.settings.hideDocSymbol);
        this.createFilterButton(headerFilterDocs, "Cluster", this.settings.clusterSymbol);
        this.createMaxDocumentsInput(headerFilterDocs);
        this.createSearchInput(headerFilterDocs);
    }

    private createSearchInput(container: HTMLDivElement) {
        const searchLabelContainer = document.createElement('div');
        container.appendChild(searchLabelContainer);
        searchLabelContainer.classList.add('filter-search');
        const filterLabel = document.createElement('span');
        searchLabelContainer.appendChild(filterLabel);
        filterLabel.classList.add('filter-symbol');
        filterLabel.textContent = Lng.gt("Search") + ":";

        //create SearchBox sizer
        const searchBoxSizer = document.createElement('label');
        searchLabelContainer.appendChild(searchBoxSizer);
        searchBoxSizer.classList.add('search-box-sizer');

        //create searchBox
        const searchBox = document.createElement('input');
        searchBoxSizer.appendChild(searchBox);
        searchBox.classList.add('search-box');
        searchBox.type = "text";
        searchBox.placeholder = Lng.gt("Search");
        searchBox.value = "";

        //Register input event
        this.component.registerDomEvent(searchBox, 'input', async (event: InputEvent) => {
            searchBoxSizer.dataset.value = "_" + searchBox.value + "_";
        });

        //Register Keydown Event
        this.component.registerDomEvent(searchBox, 'keydown', async (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                if (searchBox.value !== "") {
                    this.settings.search = Search.parseSearchText(searchBox.value);
                    this.onFilter();
                } else {
                    this.settings.search = undefined;
                    this.onFilter();
                }
            } else if (event.key === "Escape") {
                searchBox.value = "";
                searchBoxSizer.dataset.value = "";
                this.settings.search = undefined;
                this.onFilter();
            }
        });
    }

    private createMaxDocumentsInput(container: HTMLDivElement) {
        const batchSize = 50;

        const filterDocumentsSymbol = document.createElement('div');
        container.appendChild(filterDocumentsSymbol);
        filterDocumentsSymbol.classList.add('filter-max-symbols');
        const maxShownDocMinus = document.createElement('a');
        filterDocumentsSymbol.appendChild(maxShownDocMinus);
        maxShownDocMinus.classList.add('filter-max-symbol');
        maxShownDocMinus.title = Lng.gt("MaxShownEntrys");
        maxShownDocMinus.href = "#";
        setIcon(maxShownDocMinus, "minus");

        this.component.registerDomEvent(maxShownDocMinus, 'click', async (event: MouseEvent) => {
            if (this.settings.maxDocuments >= batchSize) {
                this.settings.maxDocuments -= batchSize;
            } else {
                this.settings.maxDocuments = 0;
            }
            maxShownNumber.textContent = this.settings.maxDocuments?.toString() ?? "999999";
            this.onFilter();
        });

        const maxShownNumber = document.createElement('span');
        filterDocumentsSymbol.appendChild(maxShownNumber);
        maxShownNumber.classList.add('filter-max-symbol');
        maxShownNumber.title = Lng.gt("MaxShownEntrys");
        maxShownNumber.textContent = this.settings.maxDocuments?.toString() ?? "999999";

        const maxShownDocPlus = document.createElement('a');
        filterDocumentsSymbol.appendChild(maxShownDocPlus);
        maxShownDocPlus.classList.add('filter-max-symbol');
        maxShownDocPlus.title = Lng.gt("MaxShownEntrys");
        maxShownDocPlus.href = "#";
        setIcon(maxShownDocPlus, "plus");

        this.component.registerDomEvent(maxShownDocPlus, 'click', async (event: MouseEvent) => {
            this.settings.maxDocuments += batchSize;
            maxShownNumber.textContent = this.settings.maxDocuments?.toString() ?? "999999";
            this.onFilter();
        });
    }

    private createFilterButton(container: HTMLDivElement, type: FilteredDocument, symbol: string) {
        const filterDocumentsSymbol = document.createElement('div');
        container.appendChild(filterDocumentsSymbol);
        const filterDoc = document.createElement('a');
        filterDocumentsSymbol.appendChild(filterDoc);
        filterDoc.classList.add('filter-symbol');
        filterDoc.title = Lng.gt(type);
        filterDoc.href = "#";
        setIcon(filterDoc, symbol);

        if (this.settings.filter.includes(type)) {
            filterDoc.classList.remove('filter-symbol-hide');
        } else {
            filterDoc.classList.add('filter-symbol-hide');
        }

        this.component.registerDomEvent(filterDoc, 'click', async (event: MouseEvent) => {
            event.preventDefault();
            if (this.settings.filter.includes(type)) {
                this.settings.filter = this.settings.filter.filter(v => v !== type);
                filterDoc.classList.add('filter-symbol-hide');
            } else {
                this.settings.filter.push(type);
                filterDoc.classList.remove('filter-symbol-hide');
            }
            this.onFilter();
        });
    }

    private async onFilter() {
        const startTime = Date.now();

        this.headerContainer.addClass('disable');
        const batchSize = 50;
        const sleepBetweenBatches = 50;
        let sleepPromise = Promise.resolve();
        const documentsLength = this.documents.length;
        const rows: RowsState[] = [];
        let visibleRows = 0;

        for (let i = 0; i < documentsLength; i++) {
            const document = this.documents[i];

            const rowUid = this.getUID(document);
            let hide = this.getHideState(document, 99999);
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

        this.headerContainer.removeClass('disable');

        const endTime = Date.now();
        this.logger.debug(`Filter Documents (for ${this.documents.length} Docs.) runs for ${endTime - startTime}ms`);

    }

    private getHideState(document: DocumentModel, maxVisibleRows: number | undefined): boolean {
        let hide = true;

        if (this.settings.search) {
            const text = document.toString();
            const searchResult = Search.applySearchLogic(this.settings.search, text);
            return !searchResult;
        }

        if (maxVisibleRows && maxVisibleRows > 0) {
            const rowStats = this.table.getRowStats();
            if (rowStats.visibleRows >= maxVisibleRows) {
                return true;
            }
        }

        if (hide && this.settings.filter.includes("Documents")) {
            if (document.data.hide !== true && document.data.subType !== "Cluster") {
                hide = false
            }
        }
        if (hide && this.settings.filter.includes("Cluster")) {
            if (document.data.subType === "Cluster") {
                hide = false
            }
        }
        if (hide && this.settings.filter.includes("HideDocuments")) {
            if (document.data.hide === true) {
                hide = false
            }
        }

        return hide;
    }

    private async buildTable(): Promise<void> {
        this.table = new Table(this.tableHeaders, "document-table", undefined);
        this.tableContainer.appendChild(this.table.data.table);
    }

    private async addDocumentsToTable(batchSize = 50, sleepBetweenBatches = 50): Promise<void> {
        let sleepPromise = Promise.resolve();
        const documentsLength = this.documents.length;
        const rows: Row[] = [];

        for (let i = 0; i < documentsLength; i++) {
            const document = this.documents[i];
            const row = await this.generateTableRow(document);
            rows.push(row);

            if ((i !== 0 && i % batchSize === 0) || i === documentsLength - 1) {
                await sleepPromise;
                this.table.addRows(rows);
                rows.length = 0;
                sleepPromise = Helper.sleep(sleepBetweenBatches);
            }
        }
    }

    private async generateTableRow(documentModel: DocumentModel): Promise<Row> {
        const rowClassList: string[] = [];
        const rowData: DocumentFragment[] = [];
        const rowUid = this.getUID(documentModel);

        // Row 0 -- Metadata Link
        const metadataLink = document.createDocumentFragment();
        rowData.push(metadataLink);
        this.createCellMetadatalink(metadataLink, documentModel);

        // Row 1 -- Date
        const date = document.createDocumentFragment();
        rowData.push(date);
        this.createCellDate(date, documentModel);

        // Row 2 -- File Link
        const fileLink = document.createDocumentFragment();
        rowData.push(fileLink);
        this.createCellFileLink(fileLink, documentModel);

        // Row 3 -- Sender Recipient
        const senderRecipient = this.createCellSenderRecipient(documentModel);
        rowData.push(senderRecipient);

        // Row 4 -- Summary & Related Files
        const summaryRelatedFiles = document.createDocumentFragment();
        rowData.push(summaryRelatedFiles);
        this.createCellSummary(documentModel, summaryRelatedFiles);
        this.createRelatedFilesList(documentModel, summaryRelatedFiles);

        // Row 5 -- Date of delivery
        const deliveryDate = document.createDocumentFragment();
        rowData.push(deliveryDate);
        this.createCellDeliveryDate(deliveryDate, documentModel);

        // Row 6 -- Tags
        const tags = document.createDocumentFragment();
        rowData.push(tags);
        this.createCellTags(documentModel, tags);

        const hide = this.getHideState(documentModel, this.settings.maxDocuments);

        const row = {
            rowUid,
            rowData,
            rowClassList,
            hidden: hide
        };
        return row;
    }


    private createCellDeliveryDate(deliveryDate: DocumentFragment, documentModel: DocumentModel, documentBlock: DocumentBlockRenderComponent = this) {
        new EditableDataView(deliveryDate, documentBlock.component)
            .addDate(date => date
                .setValue(documentModel.data.dateOfDelivery ?? "na")
                .setTitle("Date of delivery")
                .enableEditability()
                .setFormator((value: string) => Helper.formatDate(value, documentBlock.global.settings.dateFormat))
                .onSave((value: string) => {
                    documentModel.data.dateOfDelivery = value;
                    return Promise.resolve();
                })
            );
    }

    private createCellMetadatalink(metadataLink: DocumentFragment, documentModel: DocumentModel, documentBlock: DocumentBlockRenderComponent = this) {
        new EditableDataView(metadataLink, documentBlock.component)
            .addLink(link => link
                .setValue(documentModel.file.path)
                .setTitle("Open metadata file")
                .setLinkType("file")
                .setFormator((value: string) => {
                    const icon = document.createDocumentFragment();
                    let iconString = "x-circle";
                    if (documentModel.data.hide === true) {
                        iconString = documentBlock.settings.hideDocSymbol;
                    } else {
                        if (documentModel.data.subType === "Cluster") {
                            iconString = documentBlock.settings.clusterSymbol;
                        } else {
                            iconString = documentBlock.settings.docSymbol;
                        }
                    }
                    setIcon(icon as unknown as HTMLDivElement, iconString);
                    return { href: `${value}`, text: `${value}`, html: icon };
                }
                ));
    }

    private createCellDate(date: DocumentFragment, documentModel: DocumentModel, documentBlock: DocumentBlockRenderComponent = this) {
        new EditableDataView(date, documentBlock.component)
            .addDate(date => date
                .setValue(documentModel.data.date ?? "na")
                .setTitle("Document Date")
                .enableEditability()
                .setFormator((value: string) => Helper.formatDate(value, documentBlock.global.settings.dateFormat))
                .onSave((value: string) => {
                    documentModel.data.date = value;
                    return Promise.resolve();
                })
            );
    }

    private createCellFileLink(fileLink: DocumentFragment, documentModel: DocumentModel, editability = true, documentBlock: DocumentBlockRenderComponent = this) {
        new EditableDataView(fileLink, documentBlock.component)
            .addLink(link => {
                link.setValue(documentModel.data.title ?? "")
                    .setTitle("Open metadata file")
                    .setLinkType("file")
                    .setFormator((value: string) => {
                        const baseFileData = Helper.extractDataFromWikilink(documentModel.data.file);
                        const baseFile = documentBlock.fileCache.findFileByName(baseFileData.filename ?? "");
                        let baseFilePath = baseFileData.filename ?? "";
                        if (baseFile && baseFile instanceof TFile) {
                            baseFilePath = baseFile.path;
                        }
                        let docFragment: DocumentFragment | undefined = undefined;
                        if (Helper.isPossiblyMarkdown(value)) {
                            docFragment = document.createDocumentFragment();
                            const div = document.createElement('div');
                            MarkdownRenderer.render(documentBlock.global.app, value ?? "", div, "", documentBlock.component);
                            docFragment.appendChild(div);
                        }
                        return { href: `${baseFilePath}`, text: `${value}`, html: docFragment };
                    });
                if (editability) {
                    link.enableEditability()
                        .onSave((value: string) => {
                            documentModel.data.title = value;
                            return Promise.resolve();
                        });
                }
            });
    }

    private createCellSummary(documentModel: DocumentModel, summaryRelatedFiles: DocumentFragment, documentBlock: DocumentBlockRenderComponent = this) {
        const description = documentModel.getDescription();
        new EditableDataView(summaryRelatedFiles, documentBlock.component)
            .addTextarea(textarea => textarea
                .setValue(description)
                .setTitle("Summary")
                .enableEditability()
                .setRenderMarkdown()
                .onSave((value: string) => {
                    documentModel.data.description = value;
                    return Promise.resolve();
                })
            );
    }

    private createRelatedFilesList(documentModel: DocumentModel, relatedFilesList: DocumentFragment, documentBlock: DocumentBlockRenderComponent = this) {
        const relatedFiles = documentModel.relatedFiles;
        if (!relatedFiles || relatedFiles.length === 0) return;
        const container = document.createElement('div');
        relatedFilesList.appendChild(container);
        container.classList.add('related-files-container');

        const breakLine = document.createElement('hr');
        container.appendChild(breakLine);
        breakLine.classList.add('related-files-breakline');

        const list = document.createElement('ul');
        container.appendChild(list);
        list.classList.add('related-files-list');

        relatedFiles.forEach(relatedFile => {
            const listEntry = document.createElement('li');
            list.append(listEntry);

            const gridContainer = document.createElement('div');
            listEntry.appendChild(gridContainer);
            gridContainer.classList.add('grid-container');

            const iconContainer = document.createElement('span');
            gridContainer.append(iconContainer)
            iconContainer.classList.add('icon-container');
            const inputOutputState = relatedFile.getInputOutputState();
            //Input, Output or default icon
            let listIconString = documentBlock.settings.noneDocSymbol;
            if (inputOutputState === "Input") {
                listIconString = "corner-left-down";
            } else if (inputOutputState === "Output") {
                listIconString = "corner-right-up";
            }
            setIcon(iconContainer, listIconString);

            //Metadata File Link
            const metadataContainer = document.createElement('span');
            gridContainer.append(metadataContainer)
            metadataContainer.classList.add('metadata-file-container');
            const metadataFragment = document.createDocumentFragment();
            documentBlock.createCellMetadatalink(metadataFragment, relatedFile);
            metadataContainer.appendChild(metadataFragment);

            //Date
            const dateContainer = document.createElement('span');
            gridContainer.append(dateContainer)
            dateContainer.classList.add('date-container');
            new EditableDataView(dateContainer, documentBlock.component)
                .addDate(date => date
                    .setValue(relatedFile.data.date ?? "na")
                    .setTitle("Document Date")
                    .setFormator((value: string) => Helper.formatDate(value, documentBlock.global.settings.dateFormatShort))
                );

            const textContainer = document.createElement('span');
            gridContainer.append(textContainer)
            textContainer.classList.add('data-container');
            const linkFragment = document.createDocumentFragment();
            //Title and Link
            documentBlock.createCellFileLink(linkFragment, relatedFile, false);
            textContainer.append(linkFragment);
        });
    }

    private createCellTags(documentModel: DocumentModel, tags: DocumentFragment, documentBlock: DocumentBlockRenderComponent = this) {
        documentModel.getTags().forEach(tag => {
            new EditableDataView(tags, documentBlock.component)
                .addLink(link => link
                    .setValue(tag)
                    .setTitle("Tag")
                    .setLinkType("tag")
                    .setFormator((value: string) => {
                        return { href: `#${value}`, text: `#${value}` };
                    })
                );
        });
    }

    private createCellSenderRecipient(documentModel: DocumentModel, documentBlock: DocumentBlockRenderComponent = this): DocumentFragment {
        const senderRecipient = document.createDocumentFragment();
        const container = document.createElement('div');
        senderRecipient.appendChild(container);
        container.classList.add('senderRecipient');

        const inputOutputState = documentModel.getInputOutputState();
        const sender = documentModel.data.sender ?? null;
        const recipient = documentModel.data.recipient ?? null;

        if (sender && inputOutputState !== "Output") {
            const senderContainer = document.createElement('div');
            senderContainer.classList.add('container');

            const fromTo = document.createElement('span');
            fromTo.classList.add('fromTo');
            fromTo.textContent = Lng.gt("From");
            senderContainer.appendChild(fromTo);

            const name = document.createElement('span');
            name.classList.add('name');
            senderContainer.appendChild(name);
            documentBlock.createEDVSenderRecipient(name, sender, "Sender", (value: string) => {
                documentModel.data.sender = value;
                return Promise.resolve();
            });

            container.appendChild(senderContainer);
        }
        if (recipient && inputOutputState !== "Input") {
            const recipientContainer = document.createElement('div');
            recipientContainer.classList.add('container');

            const fromTo = document.createElement('span');
            fromTo.classList.add('fromTo');
            fromTo.textContent = Lng.gt("To");
            recipientContainer.appendChild(fromTo);

            const name = document.createElement('span');
            name.classList.add('name');
            recipientContainer.appendChild(name);
            documentBlock.createEDVSenderRecipient(name, recipient, "Recipient", (value: string) => {
                documentModel.data.recipient = value;
                return Promise.resolve();
            });

            container.appendChild(recipientContainer);
        }
        return senderRecipient;
    }

    private createEDVSenderRecipient(name: HTMLElement | DocumentFragment, value: string, title: string, onSaveCallback: (value: string) => Promise<void>, documentBlock: DocumentBlockRenderComponent = this) {
        return new EditableDataView(name, documentBlock.component)
            .addText(text => text
                .setValue(value)
                .setTitle(title)
                .enableEditability()
                .setSuggester((inputValue: string) => {
                    const suggestions = documentBlock.documents
                        .flatMap(document => [document.data.sender, document.data.recipient])
                        .filter((v): v is string => v != null)
                        .filter((v, index, self) => self.indexOf(v) === index)
                        .filter(v => v.includes(inputValue))
                        .sort()
                        .splice(0, 10);
                    return suggestions;
                })
                .onSave((newValue: string) => onSaveCallback(newValue))
            );
    }

    private parseSettings(): void {
        this.processorSettings.options.forEach(option => {
            switch (option.label) {
                case "tags":
                    if (option.value === "all") {
                        this.settings.tags = "";
                    } else if (option.value === "this") {
                        this.settings.tags = this.processorSettings?.frontmatter?.tags;
                    }
                    break;
                default:
                    break;
            }
        });
    }

    private getUID(document: DocumentModel): string {
        return Helper.generateUID(document.file.path);
    }

    private async getDocuments(): Promise<DocumentModel[]> {
        const templateFolder = this.global.settings.templateFolder;
        const allDocumentFiles = this.metadataCache.filter(file => {
            const defaultFilter = file.metadata.frontmatter?.type === "Metadata" &&
                file.file.path !== this.processorSettings.source &&
                !file.file.path.startsWith(templateFolder);
            if (this.settings.tags !== "") {
                const tagFilter = file.metadata.frontmatter?.tags?.includes(this.settings.tags);
                return defaultFilter && tagFilter;
            }
            return defaultFilter;
        });
        const documents = allDocumentFiles.map(file => new DocumentModel(file.file));
        return documents;
    }
}

type FilteredDocument = "Documents" | "HideDocuments" | "Cluster";