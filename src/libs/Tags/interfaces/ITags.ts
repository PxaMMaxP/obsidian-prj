import { TFile } from 'obsidian';
import {
    IBaseComplexDataType_,
    IBaseComplexDataType,
} from 'src/libs/BaseComplexDataType/interfaces/IBaseComplexDataType';
import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { ITag } from './ITag';
import { TagTree } from '../types/TagTree';

/**
 * Represents a tags constructor.
 */
export interface ITags_ extends IBaseComplexDataType_ {
    new (
        tags: ITags | ITag | string | string[] | undefined | null,
        dependencies?: IDIContainer,
    ): ITags;
}

export interface ITags extends IBaseComplexDataType {
    /**
     * Gets the tags.
     */
    get values(): ITag[];

    /**
     * The specific tags.
     * - The specific tags are the tags without any redundant tags:
     * If the tags array contains `["tag1", "tag2", "tag1/subtag1", "tag1/subtag2"]`,
     * the specific tags are `["tag2", "tag1/subtag1", "tag1/subtag2"]`.
     */
    get specificTags(): ITag[];

    /**
     * Adds a tag, multiple tags or nothing to the tags array.
     * @param tag The tag or tags to add.
     * @returns Whether the tags were added.
     * @remarks When adding, new `ITag` objects are always created for each tag.
     */
    add(tag: ITags | ITag | string | string[] | undefined | null): boolean;

    /**
     * Adds one or more tags to the tags array if they don't exist.
     * @param tags The tags to add.
     * @returns Whether the tags were added.
     */
    push(...tags: ITag[]): boolean;

    /**
     * Removes a tag from the tags array.
     * @param tag The tag to remove.
     * @returns Whether the tag was removed.
     * @remarks The search is not for the specific object, but for an equal (string comparison) tag.
     */
    remove(tag: ITag): boolean;

    /**
     * Returns all tags.
     * @returns All tags as an array of strings.
     */
    toStringArray(): string[];

    /**
     * Returns all tags as a string.
     * @returns All tags as a string separated by a comma.
     */
    toString(): string;

    /**
     * Returns the number of tags.
     */
    get length(): number;

    /**
     * Checks if at least one tag in the tags array satisfies the provided testing function.
     * @param predicate The function to test each tag.
     * @returns `true` if the predicate function returns a truthy value for at least one tag; otherwise, `false`.
     */
    some(predicate: (tag: ITag) => boolean): boolean;

    /**
     * Checks if the tag includes the specified tag.
     * @param tag The tag to search for.
     * @returns Whether the tag includes the specified tag.
     */
    includes(tag: ITag): boolean;

    /**
     * Finds the index of the tag in the tags array.
     * @param tag The tag to find.
     * @returns The index of the tag in the tags array. If the tag is not found, -1 is returned.
     */
    findIndex(tag: ITag): number;

    /**
     * Returns an iterator for the TagsArray class.
     * @returns An iterator object that iterates over the tags in the array.
     */
    [Symbol.iterator](): Iterator<ITag>;

    /**
     * Returns the first tag in the tags array.
     * @returns The first tag in the tags array or `undefined` if the tags array is empty.
     */
    first(): ITag | undefined;

    /**
     * Returns the last tag in the tags array.
     * @returns The last tag in the tags array or `undefined` if the tags array is empty.
     */
    last(): ITag | undefined;

    /**
     * Creates a tag tree from an array of tags.
     * @returns The tag tree.
     */
    getTagTree(): TagTree;

    /**
     * Loads tags from a file.
     * @param file The file to load the tags from.
     * @remarks Any existing tags in the class are deleted in the process.
     * @returns Whether the tags were loaded.
     */
    loadTagsFromFile(file: TFile | undefined): boolean;
}
