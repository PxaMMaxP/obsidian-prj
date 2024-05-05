import { TFile } from 'obsidian';
import Logging from 'src/classes/Logging';
import { CompletedString, KanbanStatus } from './KanbanTypes';

/**
 * Represents a kanban board.
 * Contains the *raw* frontmatter, markdown content, and kanban settings of the board.
 * Also contains the cards that are part of the board.
 */
export class KanbanBoard {
    private logger = Logging.getLogger('ParsedKanban');

    public cards: KanbanCard[] = [];

    private _kanbanChanged = false;
    /**
     * Returns whether the kanban board has changed.
     */
    public get kanbanChanged(): boolean {
        return this._kanbanChanged;
    }

    private _contentFrontmatter: string;
    /**
     * Returns the *raw* frontmatter of the board.
     */
    public get contentFrontmatter(): string {
        return this._contentFrontmatter;
    }

    private _contentMarkdown: string;
    /**
     * Returns the *raw* markdown content of the board.
     */
    public get contentMarkdown(): string {
        return this._contentMarkdown;
    }

    private _contentKanbanSettings: string;
    /**
     * Returns the *raw* kanban settings of the board.
     */
    public get contentKanbanSettings(): string {
        return this._contentKanbanSettings;
    }

    constructor(
        contentFrontmatter: string,
        contentMarkdown: string,
        contentKanbanSettings: string,
    ) {
        this._contentFrontmatter = contentFrontmatter;
        this._contentMarkdown = contentMarkdown;
        this._contentKanbanSettings = contentKanbanSettings;

        this.logger.trace(
            `Created new KanbanBoard with contentFrontmatter '${contentFrontmatter}', contentMarkdown '${contentMarkdown}', and contentKanbanSettings '${contentKanbanSettings}'`,
        );
    }

    /**
     * Adds a new card to the board.
     * @param card The card to add.
     */
    public addCard(card: KanbanCard): void {
        this.cards.push(card);

        this.logger.trace(
            `Added new KanbanCard with title '${card.title}' and status '${card.status}'`,
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
            return this.getStatusPerCardItem(cardItem);
        }
    }

    /**
     * Returns the status of the card item.
     * @param item The card item to get the status for.
     * @returns The status of the card item or undefined if the item is not part of the board.
     */
    public getStatusPerCardItem(
        item: KanbanCardItem,
    ): KanbanStatus | undefined {
        for (const card of this.cards) {
            if (card.items) {
                if (card.items.includes(item)) {
                    return card.status;
                }
            }
        }

        return undefined;
    }

    /**
     * Returns the card item that is linked to the given file.
     * @param file The file to get the card item for.
     * @returns The card item that is linked to the given file or undefined if the file is not part of the board.
     */
    public getCardItemPerFile(file: TFile): KanbanCardItem | undefined {
        for (const card of this.cards) {
            if (card.items) {
                for (const item of card.items) {
                    if (item.linkedFile === file) {
                        return item;
                    }
                }
            }
        }

        return undefined;
    }

    /**
     * Returns all items that are part of the given status.
     * @param status The status of the items to return.
     * @returns All items that are part of the given status.
     */
    public getItemsPerStatus(status: KanbanStatus): KanbanCardItem[] {
        const items: KanbanCardItem[] = [];

        for (const card of this.cards) {
            if (card.status === status && card.items) {
                items.push(...card.items);
            }
        }

        return items;
    }

    /**
     * Moves the item to the given status.
     * @param item The item to move.
     * @param status The status to move the item to.
     * @remarks If the item is already in the given status, the move is skipped.
     */
    public moveItemToStatus(item: KanbanCardItem, status: KanbanStatus): void {
        const currentStatus = this.getStatusPerCardItem(item);

        if (currentStatus === status) {
            this.logger.trace(
                `Item is already in status '${status}', skipping move`,
            );

            return;
        }

        for (const card of this.cards) {
            if (card.items) {
                const index = card.items.indexOf(item);

                if (index !== -1) {
                    card.removeCardItem(item);

                    for (const newCard of this.cards) {
                        if (newCard.status === status) {
                            newCard.addCardItem(item);
                            this._kanbanChanged = true;

                            return;
                        }
                    }
                }
            }
        }
    }

    /**
     * Adds the card item to the given status.
     * @param item The item to add.
     * @param status The status to add the item to.
     */
    public addCardItemToStatus(
        item: KanbanCardItem,
        status: KanbanStatus,
    ): void {
        for (const card of this.cards) {
            if (card.status === status) {
                card.addCardItem(item);
                this._kanbanChanged = true;

                return;
            }
        }
    }
}

/**
 * Represents a Card on a kanban board.
 * Contains the title of the card, the status of the card, and the items that are part of the card.
 */
export class KanbanCard {
    private logger = Logging.getLogger('KanbanCard');

    public get type(): 'heading' {
        return 'heading';
    }
    private _status: KanbanStatus;
    public get status(): KanbanStatus {
        return this._status;
    }
    private _title: string;
    public get title(): string {
        return this._title;
    }
    public items?: KanbanCardItem[];

    private _rawContent: string;
    public get rawContent(): string {
        return this._rawContent;
    }

    private _completed: boolean;
    public get completed(): boolean {
        return this._completed;
    }

    constructor(title: string, status: KanbanStatus, content: string) {
        this._title = title;
        this._status = status;
        this._rawContent = content;

        // Search for the keyword '**Fertiggestellt**' in the content to determine if the card is completed.
        if (content.contains(CompletedString)) {
            this._completed = true;
        } else {
            this._completed = false;
        }

        this.logger.trace(
            `Created new KanbanCard with title '${title}' and status '${status}'`,
        );
    }

    /**
     * Adds a new card item to the card.
     * @param cardItem The card item to add.
     * @remarks If the card is completed, the card item is checked.
     */
    public addCardItem(cardItem: KanbanCardItem): void {
        if (!this.items) {
            this.items = [];
        }

        if (this.completed) {
            cardItem.checked = true;
        } else {
            cardItem.checked = false;
        }

        this.items.push(cardItem);

        this.logger.trace(
            `Added new KanbanCardItem with checked '${cardItem.checked}', linkedFile '${cardItem.linkedFile}', and rawContent '${cardItem.rawContent}'`,
        );
    }

    public removeCardItem(cardItem: KanbanCardItem): void {
        if (this.items) {
            const index = this.items.indexOf(cardItem);

            if (index !== -1) {
                this.items.splice(index, 1);
            }
        }
    }
}

/**
 * Represents a list item belonging to a kanban card.
 * Cotains the checked state of the list item, the linked file, and the raw content of the list item.
 * @remarks If the linked file is null, the list item is not linked to a file.
 */
export class KanbanCardItem {
    private logger = Logging.getLogger('KanbanCardItem');

    public get type(): 'listItem' {
        return 'listItem';
    }
    public checked: boolean;

    private _linkedFile: TFile | null;
    public get linkedFile(): TFile | null {
        return this._linkedFile;
    }

    private _rawContent: string;
    public get rawContent(): string {
        return this._rawContent;
    }

    constructor(
        checked: boolean | null,
        linkedFile: TFile | null,
        content: string,
    ) {
        this.checked = checked || false;
        this._linkedFile = linkedFile;
        this._rawContent = content;

        this.logger.trace(
            `Created new KanbanCardItem with checked '${checked}', linkedFile '${linkedFile}', and content '${content}'`,
        );
    }
}
