import { ILogger } from 'src/interfaces/ILogger';
import { TagTree } from 'src/types/TagTree';
import { TFile } from 'obsidian';
import IMetadataCache from 'src/interfaces/IMetadataCache';
import { ITag } from './interfaces/ITag';
import { ITagFactory } from './interfaces/ITagFactory';
import { ITags } from './interfaces/ITags';

/**
 * Represents an array of tags.
 * @remarks - The class provides methods to add, remove, and get tags.
 * - The class also provides a method to convert all tags to a string.
 * - The class also takes care of any conversions so that an array of tags is always made available.
 */
export class Tags implements ITags {
    /**
     * The tag factory for the `ITag` interface.
     */
    private _iTagFactory: ITagFactory;

    /**
     * The metadata cache.
     */
    private _metadataCache: IMetadataCache;

    /**
     * The logger to use for logging messages.
     * If not provided, no messages will be logged.
     */
    private logger: ILogger | undefined = undefined;

    /**
     * Only the specific tags.
     * @remarks - Is lazy loaded.
     */
    private _specificTags: Tags | undefined = undefined;

    /**
     * The specific tags.
     * - The specific tags are the tags without any redundant tags:
     * If the tags array contains `["tag1", "tag2", "tag1/subtag1", "tag1/subtag2"]`,
     * the specific tags are `["tag2", "tag1/subtag1", "tag1/subtag2"]`.
     */
    public get specificTags(): Tags {
        if (!this._specificTags) {
            this._specificTags = new Tags(
                undefined,
                this._metadataCache,
                this._iTagFactory,
                this.logger,
            );

            this._tags.forEach((tag) => {
                if (
                    !this._tags.some(
                        (existingTag) =>
                            existingTag !== tag &&
                            existingTag.startsWith(tag + '/'),
                    )
                ) {
                    this._specificTags?.push(tag.toString());
                }
            });
        }

        return this._specificTags;
    }

    /**
     * The tags array.
     */
    private _tags: ITag[] = [];

    /**
     * Creates a new instance of the TagsArray class.
     * @param tags The tags to use for the creation. Can be a string, an array of strings, or undefined.
     * @param metadataCache The metadata cache.
     * @param tagFactory The tag factory for the `ITag` interface.
     * @param logger The logger to use for logging messages.
     */
    constructor(
        tags: string | string[] | undefined,
        metadataCache: IMetadataCache,
        tagFactory: ITagFactory,
        logger?: ILogger,
    ) {
        this._metadataCache = metadataCache;
        this._iTagFactory = tagFactory;
        this.logger = logger;
        this._tags = [];

        this.add(tags);
    }

    /**
     * Adds a tag, multiple tags or nothing to the tags array.
     * @param tag The tag or tags to add.
     * @returns Whether the tags were added.
     */
    public add(tag: string | string[] | undefined): boolean {
        if (typeof tag === 'string') {
            this.push(tag);

            return true;
        } else if (Array.isArray(tag)) {
            this.push(...tag);

            return true;
        } else {
            this.logger?.warn('No tags to add.');

            return false;
        }
    }

    /**
     * Adds one or more tags to the tags array if they don't exist.
     * @param tags The tags to add.
     * @returns Whether the tags were added.
     */
    public push(...tags: string[]): boolean {
        tags.forEach((tag) => {
            if (
                !this._tags.some(
                    (existingTag) => existingTag.toString() === tag,
                )
            ) {
                this._tags.push(
                    this._iTagFactory.create(tag, this._metadataCache),
                );

                return true;
            } else {
                this.logger?.warn(`Tag '${tag}' already exists.`);

                return false;
            }
        });

        return false;
    }

    /**
     * Removes a tag from the tags array.
     * @param tag The tag to remove.
     * @returns Whether the tag was removed.
     */
    public remove(tag: string): boolean {
        const index = this._tags.findIndex(
            (existingTag) => existingTag.toString() === tag,
        );

        if (index !== -1) {
            this._tags.splice(index, 1);

            return true;
        } else {
            this.logger?.warn(`Tag '${tag}' not found.`);

            return false;
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

    /**
     * Creates a tag tree from an array of tags.
     * @returns The tag tree.
     */
    public getTagTree(): TagTree {
        const tagTree: TagTree = {};

        this._tags.forEach((tag) => {
            let currentTree = tagTree;

            tag.getElements().forEach((element) => {
                if (!currentTree[element]) {
                    currentTree[element] = {};
                }

                currentTree = currentTree[element];
            });
        });

        return tagTree;
    }

    /**
     * Loads tags from a file.
     * @param file The file to load the tags from.
     * @remarks Any existing tags in the class are deleted in the process.
     * @returns Whether the tags were loaded.
     */
    public loadTagsFromFile(file: TFile | undefined): boolean {
        this._tags = [];

        if (file) {
            const cache = this._metadataCache.getEntry(file);

            if (
                cache &&
                cache.metadata &&
                cache.metadata.frontmatter &&
                cache.metadata.frontmatter.tags
            ) {
                if (Array.isArray(cache.metadata.frontmatter.tags)) {
                    this.push(...cache.metadata.frontmatter.tags);
                } else {
                    this.push(cache.metadata.frontmatter.tags);
                }
            } else {
                this.logger?.warn('No tags found in the file.');

                return false;
            }
        } else {
            this.logger?.warn('No file provided.');

            return false;
        }

        return true;
    }
}
