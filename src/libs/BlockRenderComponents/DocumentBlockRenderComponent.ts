import { MarkdownRenderChild, MarkdownRenderer, TFile, setIcon } from "obsidian";
import { ProcessorSettings } from "../MarkdownBlockProcessor";
import { DocumentModel } from "src/models/DocumentModel";
import Global from "src/classes/Global";
import Table, { Row, TableHeader } from "../Table";
import Helper from "../Helper";
import EditableDataView from "../EditableDataView/EditableDataView";
import Lng from "src/classes/Lng";
import RedrawableBlockRenderComponent from "./RedrawableBlockRenderComponent";

export default class DocumentBlockRenderComponent implements RedrawableBlockRenderComponent {
    private global = Global.getInstance();
    private logger = this.global.logger;
    private metadataCache = this.global.metadataCache.Cache;
    private fileCache = this.global.fileCache;
    private processorSettings: ProcessorSettings;
    private component: MarkdownRenderChild;
    private settings: { tags: string | string[] } = { tags: "" };
    private documents: DocumentModel[];
    private headerContainer: HTMLElement;
    private tableContainer: HTMLElement;
    private table: Table;
    private tableHeaders: TableHeader[] = [
        { text: Lng.gt("DocumentType"), headerClass: [], columnClass: [] },
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
        this.processorSettings.container.innerHTML = "";
        await this.draw();
    }

    private async draw(): Promise<void> {
        const documentsPromise = this.getDocuments();

        this.headerContainer = document.createElement('div');
        this.processorSettings.container.appendChild(this.headerContainer);

        this.tableContainer = document.createElement('div');
        this.processorSettings.container.appendChild(this.tableContainer);
        await this.buildTable();

        this.documents = (await documentsPromise);
        this.logger.debug(`${this.documents.length} Documents found.`);
        this.documents = this.documents.splice(0, 200);
        DocumentModel.sortDocumentsByDateDesc(this.documents);

        await this.addDocumentsToTable(50, 50);
    }

    private async buildTable(): Promise<void> {
        this.table = new Table(this.tableHeaders, "document-table", undefined);
        this.tableContainer.appendChild(this.table.data.table);
    }

    private async addDocumentsToTable(batchSize = 5, sleepBetweenBatches = 10): Promise<void> {
        const documentsLength = this.documents.length;
        const rows: Row[] = [];

        for (let i = 0; i < documentsLength; i++) {
            const document = this.documents[i];
            const row = await this.generateTableRow(document);
            rows.push(row);

            if ((i !== 0 && i % batchSize === 0) || i === documentsLength - 1) {
                this.table.addRows(rows);
                rows.length = 0;
                await Helper.sleep(sleepBetweenBatches);
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

        // Row 5 -- Date of delivery
        const deliveryDate = document.createDocumentFragment();
        rowData.push(deliveryDate);
        this.createCellDeliveryDate(deliveryDate, documentModel);

        // Row 6 -- Tags
        const tags = document.createDocumentFragment();
        rowData.push(tags);
        this.createCellTags(documentModel, tags);

        const hide = documentModel.data.hide ?? false;

        const row = {
            rowUid,
            rowData,
            rowClassList,
            hidden: hide
        };
        return row;
    }


    private createCellDeliveryDate(deliveryDate: DocumentFragment, documentModel: DocumentModel) {
        new EditableDataView(deliveryDate, this.component)
            .addDate(date => date
                .setValue(documentModel.data.dateOfDelivery ?? "na")
                .setTitle("Date of delivery")
                .enableEditability()
                .setFormator((value: string) => Helper.formatDate(value, this.global.settings.dateFormat))
                .onSave((value: string) => {
                    documentModel.data.dateOfDelivery = value;
                    return Promise.resolve();
                })
            );
    }

    private createCellMetadatalink(metadataLink: DocumentFragment, documentModel: DocumentModel) {
        new EditableDataView(metadataLink, this.component)
            .addLink(link => link
                .setValue(documentModel.file.path)
                .setTitle("Open metadata file")
                .setLinkType("file")
                .setFormator((value: string) => {
                    const icon = document.createDocumentFragment();
                    let iconString = "x-circle";
                    if (documentModel.data.hide === true) {
                        iconString = "file-minus-2";
                    } else {
                        iconString = "file-text";
                    }
                    setIcon(icon as unknown as HTMLDivElement, iconString);
                    return { href: `${value}`, text: `${value}`, html: icon };
                }
                ));
    }

    private createCellDate(date: DocumentFragment, documentModel: DocumentModel) {
        new EditableDataView(date, this.component)
            .addDate(date => date
                .setValue(documentModel.data.date ?? "na")
                .setTitle("Document Date")
                .enableEditability()
                .setFormator((value: string) => Helper.formatDate(value, this.global.settings.dateFormat))
                .onSave((value: string) => {
                    documentModel.data.date = value;
                    return Promise.resolve();
                })
            );
    }

    private createCellFileLink(fileLink: DocumentFragment, documentModel: DocumentModel) {
        new EditableDataView(fileLink, this.component)
            .addLink(link => link
                .setValue(documentModel.data.title ?? "")
                .setTitle("Open metadata file")
                .setLinkType("file")
                .setFormator((value: string) => {
                    const baseFileData = Helper.extractDataFromWikilink(documentModel.data.file);
                    const baseFile = this.fileCache.findFileByName(baseFileData.filename ?? "");
                    let baseFilePath = baseFileData.filename ?? "";
                    if (baseFile && baseFile instanceof TFile) {
                        baseFilePath = baseFile.path;
                    }
                    let docFragment: DocumentFragment | undefined = undefined;
                    if (Helper.isPossiblyMarkdown(value)) {
                        docFragment = document.createDocumentFragment();
                        const div = document.createElement('div');
                        MarkdownRenderer.render(this.global.app, value ?? "", div, "", this.component);
                        docFragment.appendChild(div);
                    }
                    return { href: `${baseFilePath}`, text: `${value}`, html: docFragment };
                })
                .onSave((value: string) => {
                    documentModel.data.title = value;
                    return Promise.resolve();
                })
                .enableEditability()
            );
    }

    private createCellSummary(documentModel: DocumentModel, summaryRelatedFiles: DocumentFragment) {
        const description = documentModel.getDescription();
        new EditableDataView(summaryRelatedFiles, this.component)
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

    private createCellTags(documentModel: DocumentModel, tags: DocumentFragment) {
        documentModel.getTags().forEach(tag => {
            new EditableDataView(tags, this.component)
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

    private createCellSenderRecipient(documentModel: DocumentModel): DocumentFragment {
        const senderRecipient = document.createDocumentFragment();
        const container = document.createElement('div');
        senderRecipient.appendChild(container);
        container.classList.add('senderRecipient');

        const sender = documentModel.data.sender ?? null;
        const recipient = documentModel.data.recipient ?? null;
        const ownName = this.global.settings.user.name ?? null;

        if (sender && sender !== ownName) {
            const senderContainer = document.createElement('div');
            senderContainer.classList.add('container');

            const fromTo = document.createElement('span');
            fromTo.classList.add('fromTo');
            fromTo.textContent = Lng.gt("From");
            senderContainer.appendChild(fromTo);

            const name = document.createElement('span');
            name.classList.add('name');
            senderContainer.appendChild(name);
            this.createEDVSenderRecipient(name, sender, "Sender", (value: string) => {
                documentModel.data.sender = value;
                return Promise.resolve();
            });

            container.appendChild(senderContainer);
        }
        if (recipient && recipient !== ownName) {
            const recipientContainer = document.createElement('div');
            recipientContainer.classList.add('container');

            const fromTo = document.createElement('span');
            fromTo.classList.add('fromTo');
            fromTo.textContent = Lng.gt("To");
            recipientContainer.appendChild(fromTo);

            const name = document.createElement('span');
            name.classList.add('name');
            recipientContainer.appendChild(name);
            this.createEDVSenderRecipient(name, recipient, "Recipient", (value: string) => {
                documentModel.data.recipient = value;
                return Promise.resolve();
            });

            container.appendChild(recipientContainer);
        }
        return senderRecipient;
    }

    private createEDVSenderRecipient(name: HTMLElement | DocumentFragment, value: string, title: string, onSaveCallback: (value: string) => Promise<void>) {
        return new EditableDataView(name, this.component)
            .addText(text => text
                .setValue(value)
                .setTitle(title)
                .enableEditability()
                .setSuggester((inputValue: string) => {
                    const suggestions = this.documents
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
