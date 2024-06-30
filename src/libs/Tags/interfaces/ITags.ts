import { TFile } from 'obsidian';
import { TagTree } from 'src/types/TagTree';

export interface ITags {
    /**
     * The specific tags.
     * - The specific tags are the tags without any redundant tags:
     * If the tags array contains `["tag1", "tag2", "tag1/subtag1", "tag1/subtag2"]`,
     * the specific tags are `["tag2", "tag1/subtag1", "tag1/subtag2"]`.
     */
    get specificTags(): ITags;

    /**
     * Adds a tag, multiple tags or nothing to the tags array.
     * @param tag The tag or tags to add.
     * @returns Whether the tags were added.
     */
    add(tag: string | string[] | undefined): boolean;

    /**
     * Adds one or more tags to the tags array if they don't exist.
     * @param tags The tags to add.
     * @returns Whether the tags were added.
     */
    push(...tags: string[]): boolean;

    /**
     * Removes a tag from the tags array.
     * @param tag The tag to remove.
     * @returns Whether the tag was removed.
     */
    remove(tag: string): boolean;

    /**
     * Returns all tags.
     * @returns All tags as an array of strings.
     */
    getAll(): string[];

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
     * Returns an iterator for the TagsArray class.
     * @returns An iterator object that iterates over the tags in the array.
     */
    [Symbol.iterator](): Iterator<string>;

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
