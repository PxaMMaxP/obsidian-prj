import { CachedMetadata, TFile } from 'obsidian';
import Global from 'src/classes/Global';
import Logging from 'src/classes/Logging';

export default class KanbanSync {
    private logger = Logging.getLogger('KanbanSync');
    private _metadataCache = Global.getInstance().metadataCache;
    private _kanbanFile: TFile;
    private _kanbanMetadata: CachedMetadata | undefined;

    constructor(kanbanFile: TFile) {
        this._kanbanFile = kanbanFile;

        this._kanbanMetadata =
            this._metadataCache.getEntry(kanbanFile)?.metadata;
        this.logger.debug(`KanbanSync:`, this._kanbanMetadata);
    }

    public async sync(): Promise<void> {}

    public static registerEvent(): void {
        const metadataCache = Global.getInstance().metadataCache;

        metadataCache.on('prj-task-management-file-changed-event', (file) => {
            this.checkIfKanbanIsLinkedEvent(file);
        });

        metadataCache.on('changes-in-kanban-event', (file) => {
            new KanbanSync(file).sync();
        });
    }

    public static checkIfKanbanIsLinkedEvent(file: TFile): void {
        const linkedFiles = this.getLinkedKanbanFiles(file);

        for (const kanbanFile of linkedFiles) {
            new KanbanSync(kanbanFile).sync();
        }
    }

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
