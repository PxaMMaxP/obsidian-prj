import { TFile } from 'obsidian';
import type { IApp } from 'src/interfaces/IApp';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { KanbanBoard, KanbanList } from './KanbanModels';
import { ArchivedString, CompletedString } from './KanbanTypes';
import { Inject } from '../DependencyInjection/decorators/Inject';

/**
 * Represents a markdown generator for a kanban board.
 */
export default class KanbanMarkdownGenerator {
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('KanbanMarkdownGenerator'))
    private readonly _logger?: ILogger;
    @Inject('IApp')
    private readonly _IApp: IApp;
    private readonly _kanbanBoard: KanbanBoard;
    private readonly _file: TFile;
    private readonly _path: string;

    /**
     * Creates a new instance of the markdown generator.
     * @param kanbanBoard The kanban board to generate the markdown for.
     * @param file The file to generate the markdown for.
     */
    constructor(kanbanBoard: KanbanBoard, file: TFile) {
        this._kanbanBoard = kanbanBoard;
        this._file = file;
        this._path = this._file.path;
    }

    /**
     * Saves the markdown file.
     * @param content The content to save.
     * @param onlyLog If true, the file is not saved but only logged.
     */
    public async saveFile(content: string, onlyLog = false): Promise<void> {
        if (onlyLog) {
            this._logger?.debug(
                `Would save file ${this._file.path} with content: \n${content}`,
            );

            return;
        } else {
            this._IApp.vault.modify(this._file, content);

            this._logger?.debug(
                `Saved file ${this._file.path} with content: \n${content}`,
            );
        }
    }

    /**
     * Generates the markdown file for the kanban board.
     * @returns The markdown file for the kanban board: frontmatter, markdown content, and kanban settings.
     */
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

    /**
     * Generates the frontmatter for the kanban board.
     * @returns The frontmatter for the kanban board.
     */
    private generateFrontmatter(): string {
        return '---\n' + this._kanbanBoard.contentFrontmatter + '\n---\n';
    }

    /**
     * Generates the markdown content for the kanban board.
     * @returns The markdown content for the kanban board.
     */
    private generateMarkdownContent(): string {
        const cards = this._kanbanBoard.lists.map((card) =>
            this.generateListMarkdown(card),
        );

        return cards.join('\n');
    }

    /**
     * Generates the markdown for a single List.
     * @param list The list to generate the markdown for.
     * @returns The markdown for the list.
     */
    private generateListMarkdown(list: KanbanList): string {
        const seperator = list.status === ArchivedString ? '\n***\n\n' : '\n';

        const heading = `## ${list.title} \n\n`;

        const completed = list.isCompleted ? CompletedString + '\n' : '';

        let cards: string[] = [];

        if (list.items && list.items.length > 0) {
            cards = list.items.map((item) => {
                let link = item.rawContent;

                if (item.linkedFile) {
                    const linktext = this._IApp.metadataCache.fileToLinktext(
                        item.linkedFile,
                        this._path,
                    );
                    link = `[[${linktext}]]`;
                }

                this._logger?.trace(
                    `Generating card: - [${item.isChecked ? 'x' : ' '}] ${link}`,
                );

                return `- [${item.isChecked ? 'x' : ' '}] ${link}`;
            });
        }

        const itemList = cards.join('\n') + '\n';

        return seperator + heading + completed + itemList;
    }

    /**
     * Generates the settings for the kanban board.
     * @returns The settings for the kanban board.
     */
    private generateKanbanSettings(): string {
        return this._kanbanBoard.contentKanbanSettings;
    }
}
