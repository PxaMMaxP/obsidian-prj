import { CachedMetadata, TFile } from 'obsidian';
import API from 'src/classes/API';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { Inject, resolve } from 'ts-injex';
import KanbanMarkdownGenerator from './KanbanMarkdownGenerator';
import { KanbanBoard } from './KanbanModels';
import KanbanParser from './KanbanParser';
import type { IStatusType_ } from '../StatusType/interfaces/IStatusType';

/**
 * The KanbanSync class is responsible for synchronizing the Kanban board with a regular Prj file.
 */
export default class KanbanSync {
    @Inject('IStatusType_')
    private readonly _IStatusType: IStatusType_;
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('KanbanSync'))
    private readonly _logger?: ILogger;

    @Inject('IMetadataCache')
    private readonly _IMetadataCache!: IMetadataCache;
    private readonly _kanbanFile: TFile;
    private readonly _kanbanMetadata: CachedMetadata | undefined;
    /**
     * The sync mode of the KanbanSync.
     * - 'in': The sync mode is 'in' if the sync is triggered by a change in a Prj file.
     * - 'out': The sync mode is 'out' if the sync is triggered by a change in the Kanban file.
     */
    private readonly _syncMode: 'in' | 'out' = 'out';
    private _kanbankBoard: KanbanBoard | undefined;
    private readonly _changedFile: TFile | undefined;

    /**
     * Creates an instance of the KanbanSync class.
     * @param kanbanFile The kanban file.
     * @param [changedFile] The changed corresponding Prj file (optional).
     */
    constructor(kanbanFile: TFile, changedFile?: TFile) {
        this._kanbanFile = kanbanFile;

        this._kanbanMetadata =
            this._IMetadataCache.getEntry(kanbanFile)?.metadata;
        this._logger?.trace(`KanbanSync:`, this._kanbanMetadata);

        if (!changedFile) {
            this._syncMode = 'out';
        } else {
            this._changedFile = changedFile;
            this._syncMode = 'in';
        }
    }

    /**
     * Loads the kanban file and parses it.
     */
    private async loadKanbanFile(): Promise<void> {
        const kanbanParser = new KanbanParser(this._kanbanFile);
        this._kanbankBoard = await kanbanParser.parse();
    }

    /**
     * Synchronizes the kanban file with other files based on the sync mode.
     * If the sync mode is 'out', it syncs the files linked to the kanban.
     */
    public async sync(): Promise<void> {
        await this.loadKanbanFile();

        if (this._syncMode === 'out') {
            this._logger?.debug(
                `Syncing files linked to kanban ${this._kanbanFile.path}`,
            );
            this.syncFiles();
        } else {
            this._logger?.debug(
                `Syncing kanban ${this._kanbanFile.path} with changed file ${this._changedFile?.path}`,
            );
            await this.syncKanban();
        }
    }

    /**
     * Synchronizes the Kanban board by moving a file to a new position based on its status.
     * If the file's status has changed, it finds the corresponding heading for the new state
     * and moves the file to the appropriate position within the Kanban board.
     * @returns A Promise that resolves once the Kanban synchronization is complete.
     */
    private async syncKanban(): Promise<void> {
        if (!this._changedFile) return;
        const card = this._kanbankBoard?.getCardItemPerFile(this._changedFile);

        if (!card) {
            this._logger?.warn(
                `Could not find card for file '${this._changedFile.path}'`,
            );

            return;
        }

        if (!this._kanbankBoard) {
            this._logger?.warn(
                `Could not find kanban board for file '${this._changedFile.path}'`,
            );

            return;
        }

        const newHeadingState = API.prjTaskManagementModel.getCorospondingModel(
            this._changedFile,
        )?.data.status?.value;

        if (!newHeadingState) {
            this._logger?.warn(
                `Could not find status for file '${this._changedFile.path}'`,
            );

            return;
        }

        this._kanbankBoard.moveCardToStatus(card, newHeadingState);

        // Only save the file if the Kanban board has changed
        if (this._kanbankBoard.kanbanChanged) {
            const kanbanMarkdownGenerator = new KanbanMarkdownGenerator(
                this._kanbankBoard,
                this._kanbanFile,
            );
            const newContent = kanbanMarkdownGenerator.generateMarkdownFile();
            await kanbanMarkdownGenerator.saveFile(newContent, false);
        }
    }

    /**
     * Synchronizes the files based on the loaded Kanban board.
     */
    private syncFiles(): void {
        // Iterate over all valid statuses
        this._IStatusType.types.forEach((status) => {
            const cardItem = this._kanbankBoard?.getCardsPerStatus(status);

            if (!cardItem) {
                return;
            }

            cardItem.forEach((card) => {
                const file = card.linkedFile;

                if (!file) {
                    return;
                }

                const model =
                    API.prjTaskManagementModel.getCorospondingModel(file);

                if (model) {
                    model.startTransaction();

                    if (!model.data.title) {
                        // If the title is not set,
                        // the file is a new file and the title and tags should be set
                        model.data.title = file.basename;

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
        const metadataCache = resolve<IMetadataCache>('IMetadataCache');

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
     * @param file - The file for which to retrieve the linked Kanban files.
     * @returns An array of TFile objects representing the linked Kanban files.
     */
    public static getLinkedKanbanFiles(file: TFile): TFile[] {
        const metadataCache = resolve<IMetadataCache>('IMetadataCache');
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
