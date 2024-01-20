import { App, CachedMetadata, TFile } from 'obsidian';
import Global from 'src/classes/Global';
import Logging from 'src/classes/Logging';
import { StaticPrjTaskManagementModel } from 'src/models/StaticHelper/StaticPrjTaskManagementModel';
import PrjTypes, { Status } from 'src/types/PrjTypes';

export default class KanbanSync {
    private logger = Logging.getLogger('KanbanSync');
    private _metadataCache = Global.getInstance().metadataCache;
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
        this.logger.debug(`KanbanSync:`, this._kanbanMetadata);

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
        let fileToChange: File | undefined;
        let oldState: Status | undefined;
        const headings: Heading[] = [];

        /**
         * Get all headings with valid status and find the changed file.
         */
        this._structedKanbanHeading?.forEach((heading) => {
            const status: Status | undefined =
                PrjTypes.getValidStatusFromLanguage(heading.title);

            if (!status) {
                return;
            }

            const headingWithStatus = {
                title: status,
                startLine: heading.startLine,
                endLine: heading.endLine,
                files: [],
            };
            headings.push(headingWithStatus);

            heading.files?.forEach((file) => {
                if (file.file.path === this._changedFile?.path) {
                    oldState = status;
                    fileToChange = file;
                }
            });
        });

        if (fileToChange) {
            this._structedKanban = new StructedKanban(this._kanbanFile);

            const newHeadingState =
                StaticPrjTaskManagementModel.getCorospondingModel(
                    fileToChange.file,
                )?.data.status;

            // Find the corresponding heading for the new state
            const newHeading = headings.find((heading) => {
                return heading.title === newHeadingState;
            });

            // If the state is the same, do nothing
            if (newHeadingState === oldState) return;

            if (!newHeading || !newHeadingState) {
                return;
            }

            let newLine: number = newHeading?.startLine + 1 ?? 0;

            if (newHeading.endLine === 'end') {
                newHeading.endLine = Number.MAX_SAFE_INTEGER;
            }

            this._kanbanMetadata?.listItems?.forEach((listItem) => {
                if (
                    listItem.position.start.line >= newHeading.startLine &&
                    newHeading.endLine &&
                    newHeading.endLine !== 'end' &&
                    listItem.position.start.line <= newHeading.endLine &&
                    newLine <= listItem.position.start.line
                ) {
                    this.logger.debug('newLine set to: ', newLine);
                    newLine = listItem.position.start.line + 1;
                }
            });

            await this._structedKanban.loadFileAsLines();

            this._structedKanban.moveLine(fileToChange.line, newLine);

            await this._structedKanban.saveLinesToFile();
        }
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

                model?.changeStatus(status);
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
    private _content: string[];

    constructor(file: TFile) {
        this._file = file;
    }

    public async loadFileAsLines(): Promise<void> {
        this._content = (await this._app.vault.read(this._file)).split('\n');
    }

    public async saveLinesToFile(): Promise<void> {
        await this._app.vault.modify(this._file, this._content.join('\n'));
    }

    public moveLine(fromLine: number, toLine: number): void {
        const lines = this._content;

        if (
            fromLine < 0 ||
            fromLine >= lines.length ||
            toLine < 0 ||
            toLine > lines.length
        ) {
            this.logger.warn('Zeilennummer außerhalb des gültigen Bereichs');

            return;
        }

        // Remove the line from the array
        const [removedLine] = lines.splice(fromLine, 1);

        // If the line was moved down, the line number must be reduced by one
        if (fromLine < toLine) {
            toLine--;
        }

        // Insert the line at the new position
        lines.splice(toLine, 0, removedLine);

        this._content = lines;
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
