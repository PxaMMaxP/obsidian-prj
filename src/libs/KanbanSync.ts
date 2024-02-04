import { App, CachedMetadata, TFile } from 'obsidian';
import Global from 'src/classes/Global';
import Logging from 'src/classes/Logging';
import { StaticPrjTaskManagementModel } from 'src/models/StaticHelper/StaticPrjTaskManagementModel';
import PrjTypes, { Status } from 'src/types/PrjTypes';
import { remark } from 'remark';
import { visit, EXIT } from 'unist-util-visit';
import { Root } from 'remark-parse/lib';
import { RootContent, ListItem, List } from 'mdast';

export default class KanbanSync {
    private logger = Logging.getLogger('KanbanSync');
    private _metadataCache = Global.getInstance().metadataCache;
    private _app: App = Global.getInstance().app;
    private _kanbanFile: TFile;
    private _kanbanMetadata: CachedMetadata | undefined;
    private _syncMode: 'in' | 'out' = 'out';
    private _structedKanbanHeading: Heading[] | undefined;
    private _structedKanban: StructedKanban | undefined;
    private _changedFile: TFile | undefined;

    /**
     * Creates an instance of the KanbanSync class.
     * @param {TFile} kanbanFile The kanban file.
     * @param {TFile} [changedFile] The changed corresponding Prj file (optional).
     */
    constructor(kanbanFile: TFile, changedFile?: TFile) {
        this._kanbanFile = kanbanFile;

        this._kanbanMetadata =
            this._metadataCache.getEntry(kanbanFile)?.metadata;
        this.logger.trace(`KanbanSync:`, this._kanbanMetadata);

        if (!changedFile) {
            this._syncMode = 'out';
        } else {
            this._changedFile = changedFile;
            this._syncMode = 'in';
        }
    }

    /**
     * Synchronizes the kanban file with other files based on the sync mode.
     * If the sync mode is 'out', it syncs the files linked to the kanban.
     */
    public async sync(): Promise<void> {
        this._structedKanbanHeading = new StructedKanbanHeadings(
            this._kanbanFile,
        ).getStructedKanban();

        if (this._syncMode === 'out') {
            this.logger.debug(
                `Syncing files linked to kanban ${this._kanbanFile.path}`,
            );
            this.syncFiles();
        } else {
            this.logger.debug(
                `Syncing kanban ${this._kanbanFile.path} with changed file ${this._changedFile?.path}`,
            );
            await this.syncKanban();
        }
    }

    /**
     * Synchronizes the Kanban board by moving a file to a new position based on its status.
     * If the file's status has changed, it finds the corresponding heading for the new state
     * and moves the file to the appropriate position within the Kanban board.
     *
     * @returns A Promise that resolves once the Kanban synchronization is complete.
     */
    private async syncKanban(): Promise<void> {
        if (!this._changedFile) return;

        const linktext = this._app.metadataCache.fileToLinktext(
            this._changedFile,
            this._kanbanFile.path,
        );
        const changedFileLink = `[[${linktext}]]`;

        let toHeading: string | undefined = undefined;

        const newHeadingState =
            StaticPrjTaskManagementModel.getCorospondingModel(this._changedFile)
                ?.data.status;

        this._structedKanbanHeading?.forEach((heading) => {
            const status: Status | undefined =
                PrjTypes.getValidStatusFromLanguage(heading.title);

            if (!status || newHeadingState !== status) {
                return;
            }

            toHeading = heading.title;
        });

        if (!toHeading) return;

        const structedKanban = new StructedKanban(this._kanbanFile);
        await structedKanban.loadFile();
        structedKanban.moveListItem(changedFileLink, toHeading);
        await structedKanban.saveFile();
    }

    /**
     * Synchronizes the files based on the structured kanban headings.
     */
    private syncFiles(): void {
        this._structedKanbanHeading?.forEach((heading) => {
            const status: Status | undefined =
                PrjTypes.getValidStatusFromLanguage(heading.title);

            if (!status || !PrjTypes.isValidStatus(status)) {
                return;
            }

            heading.files?.forEach((file) => {
                const model = StaticPrjTaskManagementModel.getCorospondingModel(
                    file.file,
                );

                if (model) {
                    model.startTransaction();

                    if (!model.data.title) {
                        // If the title is not set, the file is a new file and the title and tags should be set
                        model.data.title = file.file.basename;

                        model.data.tags =
                            this._kanbanMetadata?.frontmatter?.tags;
                    }
                    model.changeStatus(status);

                    model.finishTransaction();
                }
            });
        });
    }

    /**
     * Registers the event listeners for KanbanSync.
     */
    public static registerEvent(): void {
        const metadataCache = Global.getInstance().metadataCache;

        metadataCache.on('prj-task-management-file-changed-event', (file) => {
            this.checkIfKanbanIsLinkedEvent(file);
        });

        metadataCache.on('changes-in-kanban-event', (file) => {
            new KanbanSync(file).sync();
        });
    }

    /**
     * Checks if a Kanban is linked to the given file and triggers synchronization for each linked Kanban.
     * @param file - The file to check for linked Kanbans.
     */
    public static checkIfKanbanIsLinkedEvent(file: TFile): void {
        const linkedFiles = this.getLinkedKanbanFiles(file);

        for (const kanbanFile of linkedFiles) {
            new KanbanSync(kanbanFile, file).sync();
        }
    }

    /**
     * Retrieves the linked Kanban files for a given file.
     *
     * @param file - The file for which to retrieve the linked Kanban files.
     * @returns An array of TFile objects representing the linked Kanban files.
     */
    public static getLinkedKanbanFiles(file: TFile): TFile[] {
        const metadataCache = Global.getInstance().metadataCache;
        const linkedFiles = metadataCache.getBacklinks(file);

        const kanbanFiles = linkedFiles.filter((file) => {
            const cacheEntry = metadataCache.getEntry(file);

            if (cacheEntry?.metadata?.frontmatter?.subType === 'Kanban') {
                return true;
            } else {
                return false;
            }
        });

        return kanbanFiles;
    }
}

class StructedKanban {
    private logger = Logging.getLogger('StructedKanban');
    private _app: App = Global.getInstance().app;
    private _file: TFile;
    private _contentFrontmatter: string;
    private _contentMarkdown: string;

    /**
     * Creates a new instance of the KanbanSync class.
     * @param file The TFile object representing the file.
     */
    constructor(file: TFile) {
        this._file = file;
    }

    /**
     * Loads the file content and separates the frontmatter from the markdown content.
     * @returns A promise that resolves once the file is loaded and separated.
     */
    public async loadFile(): Promise<void> {
        const content = await this._app.vault.read(this._file);

        const regex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const matches = content.match(regex);

        if (matches) {
            this._contentFrontmatter = matches[1];
            this._contentMarkdown = matches[2];
        }
    }

    /**
     * Saves the file with the specified content.
     * @returns A promise that resolves when the file is saved.
     */
    public async saveFile(): Promise<void> {
        const content = `---\n${this._contentFrontmatter}\n---\n${this._contentMarkdown}`;

        await this._app.vault.modify(this._file, content);
    }

    /**
     * Moves a list item to a specified heading.
     *
     * @param itemText - The text of the list item to be moved.
     * @param toHeadingText - The text of the heading where the list item should be moved to.
     */
    public moveListItem(itemText: string, toHeadingText: string) {
        const ast = remark().parse(this._contentMarkdown);

        const listItemNode = this.getListItemByText(ast, itemText);

        const targetList = this.findOrCreateListUnderHeading(
            ast,
            toHeadingText,
        );

        if (listItemNode && targetList) {
            targetList.children.push(listItemNode);
        }

        this._contentMarkdown = this.unescapeMarkdown(remark().stringify(ast));
    }

    /**
     * Removes the escape character from escaped markdown elements.
     * @param text The text to unescape.
     * @returns The unescaped text.
     * @remarks This is a workaround for a bug in the markdown parser.
     */
    private unescapeMarkdown(text: string) {
        // Replace * with - in unordered lists
        text = text.replace(/^\*\s/gm, '- ');

        // Remove the escape character from escaped checkboxes
        text = text.replace(/\\\[([ x])\]/g, '[$1]');

        // Remove the escape character from escaped links
        text = text.replace(/\\\[\\\[(.*?)\]\]/g, '[[$1]]');

        return text;
    }

    /**
     * Retrieves a list item by searching for a specific text within the given AST.
     * @param ast The root AST node to search within.
     * @param textToFind The text to search for within the AST.
     * @returns The found list item, or undefined if not found.
     */
    private getListItemByText(ast: Root, textToFind: string) {
        let foundListItem: ListItem | undefined;
        let currentParent: ListItem | undefined;
        let curentlist: List | undefined;
        let parentList: List | undefined;

        visit(ast, (node, index, parent) => {
            if (node.type === 'list') {
                curentlist = node;
            }

            if (node.type === 'listItem') {
                currentParent = node;
            }

            if (
                node.type === 'text' &&
                node.value.includes(textToFind) &&
                currentParent
            ) {
                foundListItem = currentParent;
                parentList = curentlist;

                return EXIT;
            }
        });

        // Remove the found list item from its parent list
        if (parentList && foundListItem && Array.isArray(parentList.children)) {
            const index = parentList.children.indexOf(foundListItem);

            if (index > -1) {
                parentList.children.splice(index, 1);
            }
        }

        return foundListItem;
    }

    private findOrCreateListUnderHeading(ast: Root, headingText: string) {
        let targetHeadingIndex: number | null = null;
        let nextHeadingIndex: number | null = null;
        let foundList = null;

        // Run trough the AST and find the target and the next heading
        visit(ast, (node, index) => {
            if (node.type === 'heading') {
                if (
                    node.children.some(
                        (child) =>
                            child.type === 'text' &&
                            child.value === headingText,
                    )
                ) {
                    targetHeadingIndex = index ?? null;
                } else if (
                    targetHeadingIndex !== null &&
                    nextHeadingIndex === null
                ) {
                    nextHeadingIndex = index ?? null;
                }
            }

            // If the target heading was found and the current node is a list, check if it is in the right position
            if (
                targetHeadingIndex !== null &&
                node.type === 'list' &&
                index &&
                index > targetHeadingIndex &&
                (nextHeadingIndex === null || index < nextHeadingIndex)
            ) {
                foundList = node;

                return EXIT;
            }
        });

        // If no list was found, create a new one
        if (foundList === null && targetHeadingIndex !== null) {
            const insertIndex = nextHeadingIndex ?? targetHeadingIndex + 1;

            const newList: RootContent = {
                type: 'list',
                ordered: false,
                children: [],
                spread: false,
            };

            // Append the new list after the target heading or before the next heading
            ast.children.splice(insertIndex, 0, newList);
            foundList = newList;
        }

        return foundList;
    }
}

class StructedKanbanHeadings {
    private logger = Logging.getLogger('StructedKanban');
    private _file: TFile;
    private _metadata: CachedMetadata | undefined;
    private _metadataCache = Global.getInstance().metadataCache;

    /**
     * Creates a new instance of the KanbanSync class.
     * @param file The TFile object representing the file.
     */
    constructor(file: TFile) {
        this._file = file;
        this._metadata = this._metadataCache.getEntry(file)?.metadata;
    }

    /**
     * Retrieves the structured Kanban board.
     *
     * @returns An array of Heading objects representing the structured Kanban board.
     */
    public getStructedKanban(): Heading[] {
        const headings = this.getHeadings();

        headings.forEach((heading) => {
            heading.files = this.getFilesFromHeading(heading);
        });

        return headings;
    }

    /**
     * Retrieves the files associated with a given heading.
     *
     * @param heading The heading object.
     * @returns An array of files associated with the heading.
     */
    private getFilesFromHeading(heading: Heading): File[] {
        const files: File[] = [];

        if (!heading.endLine) {
            return files;
        }

        const startLine = heading.startLine;
        const endLine = heading.endLine;
        const links = this._metadata?.links;

        if (!links) {
            return files;
        }

        links.forEach((link) => {
            if (
                link.position.start.line >= startLine &&
                (endLine === 'end' || link.position.start.line <= endLine)
            ) {
                const entry = this._metadataCache.getEntryByLink(
                    link.link,
                    this._file.path,
                );

                if (entry) {
                    files.push({
                        file: entry.file,
                        line: link.position.start.line,
                    });
                }
            }
        });

        return files;
    }

    /**
     * Retrieves the headings from the metadata.
     * @returns An array of Heading objects.
     */
    private getHeadings(): Heading[] {
        const metadataHeadings = this._metadata?.headings;

        if (!metadataHeadings) {
            return [];
        }
        const headings: Heading[] = [];
        let lastHeading: Heading | undefined;

        metadataHeadings.forEach((heading) => {
            if (lastHeading) {
                lastHeading.endLine = heading.position.start.line;
                headings.push(lastHeading);
                lastHeading = undefined;
            }

            lastHeading = {
                title: heading.heading,
                startLine: heading.position.start.line + 1,
                endLine: undefined,
            };
        });

        if (lastHeading) {
            lastHeading.endLine = 'end';
            headings.push(lastHeading);
        }

        return headings;
    }
}

/**
 * Represents a heading in a document.
 */
type Heading = {
    title: string;
    startLine: number;
    endLine: number | 'end' | undefined;
    files?: File[] | undefined;
};

/**
 * Represents a file in a heading with its associated line number.
 */
type File = {
    file: TFile;
    line: number;
};
