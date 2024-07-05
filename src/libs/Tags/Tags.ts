import { TFile } from 'obsidian';
import BaseTypeChecker from 'src/classes/BaseTypeChecker';
import { ILogger } from 'src/interfaces/ILogger';
import IMetadataCache from 'src/interfaces/IMetadataCache';
import { ITag, ITagConstructor } from './interfaces/ITag';
import { ITags, ITagsDependencies } from './interfaces/ITags';
import { TagTree } from './types/TagTree';

/**
 * Represents an array of tags.
 * @remarks - The class provides methods to add, remove, and get tags.
 * - The class also provides a method to convert all tags to a string.
 * - The class also takes care of any conversions so that an array of tags is always made available.
 */
export default class Tags extends BaseTypeChecker implements ITags {
    /**
     * The dependency injection token for the `ITag` interface.
     */
    private _tagClass: typeof BaseTypeChecker & ITagConstructor;

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
     * The tags array.
     */
    private _tags: ITag[] = [];

    /**
     * Gets the tags.
     */
    get values(): ITag[] {
        return this._tags;
    }

    /**
     * Only the specific tags.
     * @remarks - Is lazy loaded.
     */
    private _specificTags: ITag[] | undefined = undefined;

    /**
     * The specific tags.
     * - The specific tags are the tags without any redundant tags:
     * If the tags array contains `["tag1", "tag2", "tag1/subtag1", "tag1/subtag2"]`,
     * the specific tags are `["tag2", "tag1/subtag1", "tag1/subtag2"]`.
     */
    public get specificTags(): ITag[] {
        if (!this._specificTags) {
            this._specificTags = [];

            this._tags.forEach((tag) => {
                if (
                    !this._tags.some(
                        (existingTag) =>
                            existingTag !== tag &&
                            existingTag.startsWith(tag + '/'),
                    )
                ) {
                    this._specificTags?.push(tag);
                }
            });
        }

        return this._specificTags;
    }

    /**
     * Invalidates the specific tags.
     */
    private invalidateSpecificTags(): void {
        this._specificTags = undefined;
    }

    /**
     * Creates a new instance of the TagsArray class.
     * @param tags The tags to use for the creation. Can be a string, an array of strings, or undefined.
     * @param metadataCache The metadata cache.
     * @param tagFactory The tag factory for the `ITag` interface.
     * @param logger The logger to use for logging messages.
     */
    constructor(
        tags: ITags | ITag | string | string[] | undefined | null,
        dependencies: ITagsDependencies,
    ) {
        super();
        this._metadataCache = dependencies.metadataCache;
        this._tagClass = dependencies.tagClass;
        this.logger = dependencies.logger;
        this._tags = [];

        this.add(tags);
    }

    /**
     * Creates a tag from a tag value.
     * @param tagValue The tag value.
     * @returns The created tag.
     */
    private createTag(tagValue: string): ITag {
        return new (this._tagClass as ITagConstructor)(tagValue, {
            metadataCache: this._metadataCache,
        });
    }

    /**
     * Adds a tag, multiple tags or nothing to the tags array.
     * @param tag The tag or tags to add.
     * @returns Whether the tags were added.
     * @remarks When adding, new `ITag` objects are always created for each tag.
     */
    public add(
        tag: ITags | ITag | string | string[] | undefined | null,
    ): boolean {
        return this.push(...this.normalizeToTags(tag));
    }

    /**
     * Normalizes different input types to an array of ITag-Objects.
     * @param tag The input tag(s) to normalize.
     * @returns An array of ITag-Objects.
     */
    private normalizeToTags(
        tag: ITags | ITag | string | string[] | undefined | null,
    ): ITag[] {
        if (this.isInstanceOfTags(tag)) {
            return tag.toStringArray().map((t) => this.createTag(t));
        } else if (this._tagClass.isInstanceOf(tag)) {
            return [this.createTag(tag.value)];
        } else if (Array.isArray(tag)) {
            return tag.map((t) => this.createTag(t));
        } else if (typeof tag === 'string') {
            return [this.createTag(tag)];
        }

        return [];
    }

    /**
     * Adds one or more tags to the tags array if they don't exist.
     * @param tags The tags to add.
     * @returns Whether the tags were added.
     */
    public push(...tags: ITag[]): boolean {
        let added = false;

        tags.forEach((tag) => {
            if (!this.includes(tag)) {
                this._tags.push(tag);
                added = true;
            } else {
                this.logger?.warn(`Tag '${tag.value}' already exists.`);
            }
        });

        if (added) {
            this.invalidateSpecificTags();
        } else {
            this.logger?.warn('No tags added.');
        }

        return added;
    }

    /**
     * Removes a tag from the tags array.
     * @param tag The tag to remove.
     * @returns Whether the tag was removed.
     * @remarks The search is not for the specific object, but for an equal (string comparison) tag.
     */
    public remove(tag: ITag): boolean {
        const index = this.findIndex(tag);

        if (index !== -1) {
            this._tags.splice(index, 1);
            this.invalidateSpecificTags();

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
    public toStringArray(): string[] {
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
     * Checks if at least one tag in the tags array satisfies the provided testing function.
     * @param predicate The function to test each tag.
     * @returns `true` if the predicate function returns a truthy value for at least one tag; otherwise, `false`.
     */
    public some(predicate: (tag: ITag) => boolean): boolean {
        return this._tags.some(predicate);
    }

    /**
     * Checks if the tag exists in the tags array.
     * @param tag The tag to check.
     * @returns Whether the tag exists in the tags array.
     */
    public includes(tag: ITag): boolean {
        return this._tags.some((existingTag) => existingTag.equals(tag));
    }

    /**
     * Finds the index of the tag in the tags array.
     * @param tag The tag to find.
     * @returns The index of the tag in the tags array. If the tag is not found, -1 is returned.
     */
    public findIndex(tag: ITag): number {
        return this._tags.findIndex((existingTag) => existingTag.equals(tag));
    }

    /**
     * Returns an iterator for the TagsArray class.
     * @returns An iterator object that iterates over the tags in the array.
     */
    public [Symbol.iterator](): Iterator<ITag> {
        let index = 0;

        return {
            next: (): IteratorResult<ITag> => {
                if (index < this._tags.length) {
                    return {
                        value: this._tags[index++],
                        done: false,
                    };
                } else {
                    return { done: true, value: undefined };
                }
            },
        };
    }

    /**
     * Returns the first tag in the tags array.
     * @returns The first tag in the tags array or `undefined` if the tags array is empty.
     */
    public first(): ITag | undefined {
        return this._tags[0] ?? undefined;
    }

    /**
     * Returns the last tag in the tags array.
     * @returns The last tag in the tags array or `undefined` if the tags array is empty.
     */
    public last(): ITag | undefined {
        return this._tags[this._tags.length - 1] ?? undefined;
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

            if (cache && cache.metadata && cache.metadata.frontmatter) {
                return this.add(cache.metadata.frontmatter.tags);
            } else {
                this.logger?.warn('No metadata found in the file.');

                return false;
            }
        } else {
            this.logger?.warn('No file provided.');

            return false;
        }
    }

    /**
     * Checks if the object is an instance of the ITags interface.
     * @param obj The object to check.
     */
    public isInstanceOfTags(obj: unknown): obj is ITags {
        return obj instanceof Tags;
    }
}
