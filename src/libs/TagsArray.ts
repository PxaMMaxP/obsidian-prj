import { ILogger } from 'src/interfaces/ILogger';

/**
 * Represents an array of tags.
 * @remarks - The class provides methods to add, remove, and get tags.
 * - The class also provides a method to convert all tags to a string.
 * - The class also takes care of any conversions so that an array of tags is always made available.
 */
export class TagsArray {
    /**
     * The logger to use for logging messages.
     * If not provided, no messages will be logged.
     */
    private logger: ILogger | undefined;

    /**
     * The tags array.
     */
    private _tags: string[];

    /**
     * Creates a new instance of the TagsArray class.
     * @param tags The tags to use for the creation. Can be a string, an array of strings, or undefined.
     */
    constructor(tags?: string | string[] | undefined, logger?: ILogger) {
        this.logger = logger ?? undefined;

        if (typeof tags === 'string') {
            this._tags = [tags];
        } else if (Array.isArray(tags)) {
            this._tags = tags;
        } else {
            this._tags = [];
        }
    }

    /**
     * Adds a tag, multiple tags or nothing to the tags array.
     * @param tag The tag to add.
     */
    public add(tag: string | string[] | undefined): void {
        if (typeof tag === 'string') {
            this._add(tag);
        } else if (Array.isArray(tag)) {
            tag.forEach((t) => {
                this._add(t);
            });
        } else {
            this.logger?.warn('No tags to add.');
        }
    }

    /**
     * Adds a tag to the tags array if it doesn't exist.
     * @param tag The tag to add.
     */
    private _add(tag: string): void {
        if (!this._tags.includes(tag)) {
            this._tags.push(tag);
        } else {
            this.logger?.warn(`Tag '${tag}' already exists.`);
        }
    }

    /**
     * Removes a tag from the tags array.
     * @param tag The tag to remove.
     */
    remove(tag: string): void {
        const index = this._tags.indexOf(tag);

        if (index !== -1) {
            this._tags.splice(index, 1);
        } else {
            this.logger?.warn(`Tag '${tag}' not found.`);
        }
    }

    /**
     * Returns all tags.
     * @returns All tags as an array of strings.
     */
    public getAll(): string[] {
        return this._tags;
    }

    /**
     * Returns all tags as a string.
     * @returns All tags as a string separated by a comma.
     */
    public toString(): string {
        return this._tags.join(', ');
    }

    /**
     * Returns the number of tags.
     */
    get length(): number {
        return this._tags.length;
    }

    /**
     * Returns an iterator for the TagsArray class.
     * @returns An iterator object that iterates over the tags in the array.
     */
    [Symbol.iterator](): Iterator<string> {
        let index = 0;

        return {
            next: (): IteratorResult<string> => {
                if (index < this._tags.length) {
                    return { value: this._tags[index++], done: false };
                } else {
                    return { done: true, value: undefined };
                }
            },
        };
    }
}
