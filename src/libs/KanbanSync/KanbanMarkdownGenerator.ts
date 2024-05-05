import Logging from 'src/classes/Logging';
import { KanbanBoard, KanbanCard } from './KanbanModels';
import Global from 'src/classes/Global';
import { ArchivedString, CompletedString } from './KanbanTypes';
import { TFile } from 'obsidian';

export default class KanbanMarkdownGenerator {
    private logger = Logging.getLogger('KanbanMarkdownGenerator');
    private _global = Global.getInstance();
    private _kanbanBoard: KanbanBoard;
    private _file: TFile;
    private _path: string;

    constructor(kanbanBoard: KanbanBoard, file: TFile) {
        this._kanbanBoard = kanbanBoard;
        this._file = file;
        this._path = this._file.path;
    }

    public saveFile(content: string, onlyLog = false): void {
        if (onlyLog) {
            this.logger.debug(
                `Would save file ${this._file.path} with content: \n${content}`,
            );

            return;
        } else {
            this._global.app.vault.modify(this._file, content);

            this.logger.debug(`Saved file ${this._file.path}`);
        }
    }

    public generateMarkdownFile(): string {
        return (
            this.generateFrontmatter() +
            '\n' +
            this.generateMarkdownContent() +
            '\n' +
            this.generateKanbanSettings() +
            '\n'
        );
    }

    private generateFrontmatter(): string {
        return '---\n' + this._kanbanBoard.contentFrontmatter + '\n---\n';
    }

    private generateMarkdownContent(): string {
        const cards = this._kanbanBoard.cards.map((card) =>
            this.generateCardMarkdown(card),
        );

        return cards.join('\n');
    }

    private generateCardMarkdown(card: KanbanCard): string {
        const seperator = card.status === ArchivedString ? '\n***\n\n' : '\n';

        const heading = `## ${card.title} \n\n`;

        const completed = card.completed ? CompletedString + '\n' : '';

        let items: string[] = [];

        if (card.items && card.items.length > 0) {
            items = card.items.map((item) => {
                let link = item.rawContent;

                if (item.linkedFile) {
                    const linktext =
                        this._global.app.metadataCache.fileToLinktext(
                            item.linkedFile,
                            this._path,
                        );
                    link = `[[${linktext}]]`;
                }

                return `- [${item.checked ? 'x' : ' '}] ${link}`;
            });
        }

        const itemList = items.join('\n') + '\n';

        return seperator + heading + completed + itemList;
    }

    private generateKanbanSettings(): string {
        return this._kanbanBoard.contentKanbanSettings;
    }
}
