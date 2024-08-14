import { TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { Inject } from 'ts-injex';
import { Register } from 'ts-injex';
import type { ITag, ITag_ } from './interfaces/ITag';
import { ITags, ITags_ } from './interfaces/ITags';
import { TagTree } from './types/TagTree';

/**
 * Represents an array of tags.
 * @remarks - The class provides methods to add, remove, and get tags.
 * - The class also provides a method to convert all tags to a string.
 * - The class also takes care of any conversions so that an array of tags is always made available.
 */
@ImplementsStatic<ITags_>()
@Register('ITags_')
export class Tags implements ITags {
    /**
     * The dependency injection token for the `ITag` interface.
     */
    @Inject('ITag_')
    private readonly _ITag: ITag_;

    /**
     * The metadata cache.
     */
    @Inject('IMetadataCache')
    private readonly _IMetadataCache: IMetadataCache;

    /**
     * The logger to use for logging messages.
     * If not provided, no messages will be logged.
     */
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('Tags'), false)
    private readonly _logger?: ILogger;

    /**
     * The tags array.
     */
    private _tags: ITag[] = [];

    /**
     * Gets the tags.
     */
    get value(): ITag[] {
        return this._tags;
    }

    /**
     * Sets the tags.
     */
    set value(value: unknown) {
        this._tags = this.normalizeToTags(value);
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
     */
    constructor(tags: unknown) {
        this.add(tags);
    }

    /**
     * Creates a tag from a tag value.
     * @param tagValue The tag value.
     * @returns The created tag.
     */
    private createTag(tagValue: string | null | undefined): ITag {
        return new this._ITag(tagValue);
    }

    /**
     * Adds a tag, multiple tags or nothing to the tags array.
     * @param tag The tag or tags to add.
     * @returns Whether the tags were added.
     * @remarks When adding, new `ITag` objects are always created for each tag.
     */
    public add(tag: unknown): boolean {
        return this.push(...this.normalizeToTags(tag));
    }

    /**
     * Normalizes different input types to an array of ITag-Objects.
     * @param tag The input tag(s) to normalize.
     * @returns An array of ITag-Objects.
     */
    private normalizeToTags(tag: unknown): ITag[] {
        if (tag instanceof Tags) {
            return tag.primitiveOf().map((t) => this.createTag(t));
        } else if (tag instanceof this._ITag) {
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
                this._logger?.warn(`Tag '${tag.value}' already exists.`);
            }
        });

        if (added) {
            this.invalidateSpecificTags();
        } else {
            this._logger?.trace('No tags added.');
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
            this._logger?.warn(`Tag '${tag}' not found.`);

            return false;
        }
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
    public includes(tag: ITag | ITags): boolean {
        if (tag instanceof Tags) {
            return tag.value.every((t) => this.includes(t));
        } else {
            return this._tags.some((existingTag) => existingTag.equals(tag));
        }
    }

    /**
     * Checks if any of the tags in the instance's tags array are below any of the tags in the provided tags array within a specified number of levels in the hierarchy.
     * @param tags The tags to compare with.
     * @param levels The number of levels in the hierarchy to check. Defaults to 1.
     * @returns Whether any tag from the instance's tags array is below any tag in the provided tags array within the given number of levels.
     */
    public areTagsAtHierarchyLevel(tags: ITags, levels = 1): boolean {
        if (tags.value == null) return false;

        const _tagsToCheck = tags.value;

        return this._tags.some((tagToBeChecked) =>
            _tagsToCheck.some((tagToCheck) =>
                tagToBeChecked.isTagAtHierarchyLevel(tagToCheck, levels),
            ),
        );
    }

    /**
     * Checks if any of the tags in `tags` is a **substring** of any tag in the instance's tags array
     * @param tags The tags to check as substrings
     * @returns Whether any tag from `tags` is a **substring** of any tag in the instance's tags array
     */
    public contains(tags: ITags): boolean {
        const _tagsToCheck = tags.primitiveOf();

        return _tagsToCheck.some((tagToCheck) =>
            this._tags.some((tagToBeChecked) =>
                tagToBeChecked.value?.includes(tagToCheck),
            ),
        );
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
            /**
             * Returns the next tag in the tags array.
             * @returns The next tag in the tags array.
             */
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
            const cache = this._IMetadataCache.getEntry(file);

            if (cache?.metadata?.frontmatter) {
                return this.add(cache.metadata.frontmatter.tags);
            } else {
                this._logger?.warn('No metadata found in the file.');

                return false;
            }
        } else {
            this._logger?.warn('No file provided.');

            return false;
        }
    }

    /**
     * Checks if the object is an instance of the ITags interface.
     * @param obj The object to check.
     * @returns Whether the object is an instance of the ITags interface.
     */
    public isInstanceOfTags(obj: unknown): obj is ITags {
        return obj instanceof Tags;
    }

    /**
     * Returns all tags as a string.
     * @returns All tags as a string separated by a comma.
     */
    toString(): string {
        return this._tags.join(', ');
    }

    /**
     * Returns all tags as an array of strings.
     * @returns All tags as an array of strings.
     */
    primitiveOf(): string[] {
        return this._tags.map((tag) => tag.toString());
    }
    /**
     * Checks if the object is an instance of the Tags class.
     * @param obj The object to check.
     * @returns Whether the object is an instance of the Tags class.
     */
    [Symbol.hasInstance](obj: unknown): boolean {
        return obj instanceof Tags;
    }
}
