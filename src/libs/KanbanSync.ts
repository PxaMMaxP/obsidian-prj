import { CachedMetadata, TFile } from "obsidian";
import Global from "src/classes/Global";
import Logging from "src/classes/Logging";

export default class KanbanSync {
    private logger = Logging.getLogger("KanbanSync");
    private metadataCache = Global.getInstance().metadataCache;
    private kanbanFile: TFile;
    private kanbanMetadata: CachedMetadata | undefined;

    constructor(kanbanFile: TFile) {
        this.kanbanFile = kanbanFile;
        this.kanbanMetadata = this.metadataCache.getEntry(kanbanFile)?.metadata;
        this.logger.debug(`KanbanSync:`, this.kanbanMetadata);
    }

    public async sync(): Promise<void> {

    }

    public static registerEvent(): void {
        const metadataCache = Global.getInstance().metadataCache;
        metadataCache.on("prj-task-management-file-changed", (file) => {
            this.checkIfKanbanIsLinkedEvent(file);
        });

        metadataCache.on("changes-in-kanban", (file) => {
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
            if (cacheEntry?.metadata?.frontmatter?.subType === "Kanban") {
                return true;
            } else {
                return false;
            }
        });
        return kanbanFiles;
    }
}
