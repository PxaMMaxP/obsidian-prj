import { TFile, App } from 'obsidian';
import Global from 'src/classes/Global';
import Logging from 'src/classes/Logging';
import PrjTypes from 'src/types/PrjTypes';
import { KanbanBoard, KanbanList, KanbanCard } from './KanbanModels';

/**
 *
 */
export default class KanbanParser {
    private logger = Logging.getLogger('KanbanParser');
    private _file: TFile;
    private _app: App = Global.getInstance().app;

    private _fileLoaded = false;
    private _contentFrontmatter: string;
    private _contentMarkdown: string;
    private _contentKanbanSettings: string;

    private _board: KanbanBoard;

    /**
     *
     * @param file
     */
    constructor(file: TFile) {
        this._file = file;
    }

    /**
     * Loads the file content and separates frontmatter, markdown content, and kanban settings.
     * @returns True if the file was loaded successfully, false otherwise.
     */
    private async loadFile(): Promise<boolean> {
        const content = await this._app.vault.read(this._file);

        const regex =
            /^---\n+([\s\S]*?)\n+---\n([\s\S]*)\n(%% kanban:settings[\s\S]*%%)$/m;
        const matches = content.match(regex);

        if (matches && matches.length === 4) {
            this._contentFrontmatter = matches[1];
            this._contentMarkdown = matches[2];
            this._contentKanbanSettings = matches[3];

            this.logger.trace(
                `Separated frontmatter, markdown content and kanban settings for file ${this._file.path}`,
            );
            this._fileLoaded = true;

            return true;
        } else {
            this.logger.error(
                `Could not separate frontmatter,markdown content and kanban settings for file ${this._file.path}`,
            );

            return false;
        }
    }

    /**
     * Parses the kanban board from the file content.
     * @returns The parsed kanban board or undefined if the file could not be loaded.
     */
    public async parse(): Promise<KanbanBoard | undefined> {
        if (!this._fileLoaded) {
            const loaded = await this.loadFile();

            if (!loaded) {
                return undefined;
            }
        }

        this._board = new KanbanBoard(
            this._contentFrontmatter,
            this._contentMarkdown,
            this._contentKanbanSettings,
        );

        return this.parseLists();
    }

    /**
     * Parses the cards and their items from the markdown content.
     * @returns The parsed kanban board.
     */
    private async parseLists(): Promise<KanbanBoard> {
        const regex = /^##\s(.+)((?:\n(?!##|\*\*\*|%%).*)*)/gm;
        const matches = this._contentMarkdown.matchAll(regex);

        for (const match of matches) {
            const title = match[1].trim();
            const content = match[2];

            const status =
                title === 'Archiv'
                    ? 'Archiv'
                    : PrjTypes.getValidStatusFromLanguage(title);

            if (!status) {
                this.logger.error(
                    `Skipping heading '${title}' as it is not a valid status or 'Archiv'`,
                );
                continue;
            }

            this.logger.trace(`Found heading '${title}' as status '${status}'`);

            const list = new KanbanList(title, status, content);
            await this.parseCards(list);
            this._board.addList(list);
        }

        return this._board;
    }

    /**
     * Parses the list items from the markdown content of a card.
     * @param list The card to parse the list items from.
     */
    private async parseCards(list: KanbanList): Promise<void> {
        const regex = /^- \[(x| )\]\s(\[\[(.+)\]\])(?:(?:\n(?!-).*)*)/gm;
        const matches = list.rawContent.matchAll(regex);

        for (const match of matches) {
            const checked = match[1] === 'x';
            const itemContent = match[2];
            const linkedFilePath = match[3];

            const linkedFile = this._app.metadataCache.getFirstLinkpathDest(
                linkedFilePath,
                this._file.path,
            );

            if (!linkedFile) {
                this.logger.warn(
                    `No file found for list item '${itemContent}' linked to '${linkedFilePath}`,
                );
            } else {
                this.logger.trace(
                    `Found list item '${itemContent}' linked to '${linkedFile.path}'`,
                );
            }

            const card = new KanbanCard(checked, linkedFile, itemContent);
            list.addCard(card);
        }
    }
}
