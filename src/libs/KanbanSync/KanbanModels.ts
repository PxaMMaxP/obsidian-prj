import { TFile } from 'obsidian';
import { Logging } from 'src/classes/Logging';
import { CompletedString, KanbanStatus } from './KanbanTypes';

/**
 * Represents a kanban board.
 * Contains the *raw* frontmatter, markdown content, and kanban settings of the board.
 * Also contains the Lists that are part of the board.
 */
export class KanbanBoard {
    private readonly _logger = Logging.getLogger('ParsedKanban');

    /**
     * Contains all lists that are part of the board.
     */
    public lists: KanbanList[] = [];

    private _hasKanbanChanged = false;
    /**
     * Returns whether the kanban board has changed.
     */
    public get kanbanChanged(): boolean {
        return this._hasKanbanChanged;
    }

    private readonly _contentFrontmatter: string;
    /**
     * Returns the *raw* frontmatter of the board.
     */
    public get contentFrontmatter(): string {
        return this._contentFrontmatter;
    }

    private readonly _contentMarkdown: string;
    /**
     * Returns the *raw* markdown content of the board.
     */
    public get contentMarkdown(): string {
        return this._contentMarkdown;
    }

    private readonly _contentKanbanSettings: string;
    /**
     * Returns the *raw* kanban settings of the board.
     */
    public get contentKanbanSettings(): string {
        return this._contentKanbanSettings;
    }

    /**
     * Creates a new instance of the KanbanBoard.
     * @param contentFrontmatter The *raw* frontmatter of the board.
     * @param contentMarkdown The *raw* markdown content of the board.
     * @param contentKanbanSettings The *raw* kanban settings of the board.
     */
    constructor(
        contentFrontmatter: string,
        contentMarkdown: string,
        contentKanbanSettings: string,
    ) {
        this._contentFrontmatter = contentFrontmatter;
        this._contentMarkdown = contentMarkdown;
        this._contentKanbanSettings = contentKanbanSettings;

        this._logger.trace(
            `Created new KanbanBoard with contentFrontmatter '${contentFrontmatter}', contentMarkdown '${contentMarkdown}', and contentKanbanSettings '${contentKanbanSettings}'`,
        );
    }

    /**
     * Adds a new card to the board.
     * @param list The card to add.
     */
    public addList(list: KanbanList): void {
        this.lists.push(list);

        this._logger.trace(
            `Added new List with title '${list.title}' and status '${list.status}'`,
        );
    }

    /**
     * Returns the status of the file.
     * @param file The file to get the status for.
     * @returns The status of the file or undefined if the file is not part of the board.
     */
    public getStatusPerFile(file: TFile): KanbanStatus | undefined {
        const cardItem = this.getCardItemPerFile(file);

        if (cardItem) {
            return this.getStatusPerCard(cardItem);
        }
    }

    /**
     * Returns the status of the card item.
     * @param card The card item to get the status for.
     * @returns The status of the card item or undefined if the item is not part of the board.
     */
    public getStatusPerCard(card: KanbanCard): KanbanStatus | undefined {
        for (const listedCard of this.lists) {
            if (listedCard.items) {
                if (listedCard.items.includes(card)) {
                    return listedCard.status;
                }
            }
        }

        return undefined;
    }

    /**
     * Returns the card that is linked to the given file.
     * @param file The file to get the card for.
     * @returns The card that is linked to the given file or undefined if the file is not part of the board.
     */
    public getCardItemPerFile(file: TFile): KanbanCard | undefined {
        for (const listedCard of this.lists) {
            if (listedCard.items) {
                for (const item of listedCard.items) {
                    if (item.linkedFile === file) {
                        return item;
                    }
                }
            }
        }

        return undefined;
    }

    /**
     * Returns all cards that are part of the given status.
     * @param status The status of the cards to return.
     * @returns All cards that are part of the given status.
     */
    public getCardsPerStatus(status: KanbanStatus): KanbanCard[] {
        const items: KanbanCard[] = [];

        for (const card of this.lists) {
            if (card.status === status && card.items) {
                items.push(...card.items);
            }
        }

        return items;
    }

    /**
     * Moves the card to the given status.
     * @param card The card to move.
     * @param status The status to move the card to.
     * @remarks If the card is already in the given status, the move is skipped.
     */
    public moveCardToStatus(card: KanbanCard, status: KanbanStatus): void {
        const currentStatus = this.getStatusPerCard(card);

        if (currentStatus === status) {
            this._logger.trace(
                `Item is already in status '${status}', skipping move`,
            );

            return;
        }

        for (const listedCard of this.lists) {
            if (listedCard.items) {
                const index = listedCard.items.indexOf(card);

                if (index !== -1) {
                    listedCard.removeCard(card);

                    for (const newCard of this.lists) {
                        if (newCard.status === status) {
                            newCard.addCard(card);
                            this._hasKanbanChanged = true;

                            return;
                        }
                    }
                }
            }
        }
    }

    /**
     * Adds the card to the list which has the given status.
     * @param card The item to add.
     * @param status The status to add the item to.
     */
    public addCardToStatus(card: KanbanCard, status: KanbanStatus): void {
        for (const listedCard of this.lists) {
            if (listedCard.status === status) {
                listedCard.addCard(card);
                this._hasKanbanChanged = true;

                return;
            }
        }
    }
}

/**
 * Represents a List on a kanban board.
 * Contains the title, the status, and the cards that are part of the list.
 */
export class KanbanList {
    private readonly _logger = Logging.getLogger('KanbanCard');

    /**
     * The type of the list.
     */
    public get type(): 'list' {
        return 'list';
    }
    private readonly _status: KanbanStatus;
    /**
     * The status of the list.
     */
    public get status(): KanbanStatus {
        return this._status;
    }
    private readonly _title: string;
    /**
     * The title of the list.
     */
    public get title(): string {
        return this._title;
    }
    public items?: KanbanCard[];

    private readonly _rawContent: string;
    /**
     * The raw content of the list.
     */
    public get rawContent(): string {
        return this._rawContent;
    }

    private readonly _isCompleted: boolean;
    /**
     * Returns whether the list is completed.
     */
    public get isCompleted(): boolean {
        return this._isCompleted;
    }

    /**
     * Creates a new instance of the Kanban List.
     * @param title The title of the list.
     * @param status The status of the list.
     * @param content The raw content of the list.
     */
    constructor(title: string, status: KanbanStatus, content: string) {
        this._title = title;
        this._status = status;
        this._rawContent = content;

        // Search for the keyword '**Fertiggestellt**' in the content to determine if the card is completed.
        if (content.contains(CompletedString)) {
            this._isCompleted = true;
        } else {
            this._isCompleted = false;
        }

        this._logger.trace(
            `Created new Kanban List with title '${title}' and status '${status}'`,
        );
    }

    /**
     * Adds a new Card to the kanban list.
     * @param card The card to add.
     * @remarks If the card is completed, the card item is checked.
     */
    public addCard(card: KanbanCard): void {
        if (!this.items) {
            this.items = [];
        }

        if (this.isCompleted) {
            card.isChecked = true;
        } else {
            card.isChecked = false;
        }

        this.items.push(card);

        this._logger.trace(
            `Added new Kanban Card with checked '${card.isChecked}', linkedFile '${card.linkedFile}', and rawContent '${card.rawContent}'`,
        );
    }

    /**
     * Removes a card from the list.
     * @param card The card to remove.
     */
    public removeCard(card: KanbanCard): void {
        if (this.items) {
            const index = this.items.indexOf(card);

            if (index !== -1) {
                this.items.splice(index, 1);
            }
        }
    }
}

/**
 * Represents a list item - Card - belonging to a kanban list.
 * Cotains the checked state of the card, the linked file, and the raw content of the card.
 * @remarks If the linked file is null, the list item is not linked to a file.
 */
export class KanbanCard {
    private readonly _logger = Logging.getLogger('KanbanCardItem');

    /**
     * The type of the card.
     */
    public get type(): 'card' {
        return 'card';
    }
    public isChecked: boolean;

    private readonly _linkedFile: TFile | null;
    /**
     * The linked file of the card.
     */
    public get linkedFile(): TFile | null {
        return this._linkedFile;
    }

    private readonly _rawContent: string;
    /**
     * The raw content of the card.
     */
    public get rawContent(): string {
        return this._rawContent;
    }

    /**
     * Creates a new instance of the KanbanCardItem.
     * @param checked The checked state of the card.
     * @param linkedFile The linked file of the card.
     * @param content The raw content of the card.
     */
    constructor(
        checked: boolean | null,
        linkedFile: TFile | null,
        content: string,
    ) {
        this.isChecked = checked || false;
        this._linkedFile = linkedFile;
        this._rawContent = content;

        this._logger.trace(
            `Created new KanbanCardItem with checked '${checked}', linkedFile '${linkedFile}', and content '${content}'`,
        );
    }
}
