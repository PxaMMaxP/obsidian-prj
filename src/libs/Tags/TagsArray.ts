import { ILogger } from 'src/interfaces/ILogger';
import Tag from './Tag';

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
    private _tags: Tag[];

    /**
     * Creates a new instance of the TagsArray class.
     * @param tags The tags to use for the creation. Can be a string, an array of strings, or undefined.
     * @param logger The logger to use for logging messages.
     */
    constructor(tags?: string | string[], logger?: ILogger) {
        this.logger = logger ?? undefined;
        this._tags = [];

        this.add(tags);
    }

    /**
     * Adds a tag, multiple tags or nothing to the tags array.
     * @param tag The tag or tags to add.
     */
    public add(tag: string | string[] | undefined): void {
        if (typeof tag === 'string') {
            this.push(tag);
        } else if (Array.isArray(tag)) {
            this.push(...tag);
        } else {
            this.logger?.warn('No tags to add.');
        }
    }

    /**
     * Adds one or more tags to the tags array if they don't exist.
     * @param tags The tags to add.
     */
    public push(...tags: string[]): void {
        tags.forEach((tag) => {
            if (
                !this._tags.some(
                    (existingTag) => existingTag.toString() === tag,
                )
            ) {
                this._tags.push(new Tag(tag));
            } else {
                this.logger?.warn(`Tag '${tag}' already exists.`);
            }
        });
    }

    /**
     * Removes a tag from the tags array.
     * @param tag The tag to remove.
     */
    public remove(tag: string): void {
        const index = this._tags.findIndex(
            (existingTag) => existingTag.toString() === tag,
        );

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
        return this._tags.map((tag) => tag.toString());
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
    public get length(): number {
        return this._tags.length;
    }

    /**
     * Returns an iterator for the TagsArray class.
     * @returns An iterator object that iterates over the tags in the array.
     */
    public [Symbol.iterator](): Iterator<string> {
        let index = 0;

        return {
            next: (): IteratorResult<string> => {
                if (index < this._tags.length) {
                    return {
                        value: this._tags[index++].toString(),
                        done: false,
                    };
                } else {
                    return { done: true, value: undefined };
                }
            },
        };
    }
}
