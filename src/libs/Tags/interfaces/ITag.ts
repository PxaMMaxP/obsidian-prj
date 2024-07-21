import { IDataType_ } from 'src/interfaces/DataType/IDataType';
import { IEquatable } from 'src/interfaces/DataType/IEquatable';
import { IInstanceOf } from 'src/interfaces/DataType/IInstanceOf';
import { IPrimitive } from 'src/interfaces/DataType/IPrimitive';
import { IStringConvertible } from 'src/interfaces/DataType/IStringifiable';
import { IValue } from 'src/interfaces/DataType/IValue';

/**
 * Represents a tag constructor.
 */
export interface ITag_ extends IDataType_<ITag> {
    /**
     * Initializes a new instance of a ITag class.
     * @param tag The value of the Tag.
     */
    new (tag: unknown): ITag;
}

/**
 * Represents a tag.
 */
export interface ITag
    extends IEquatable,
        IStringConvertible,
        IPrimitive,
        IInstanceOf,
        IValue<string> {
    /**
     * Gets whether the tag exists in the cache.
     * @returns Whether the tag exists in the cache.
     */
    readonly isExisting: boolean;

    /**
     * Gets the tag with a hash symbol.
     * @returns The tag with a hash symbol.
     * @remarks The tag is prefixed with a hash symbol if it doesn't already have one.
     */
    get tagWithHash(): string;

    /**
     * Converts the value of the tag to uppercase.
     * @returns The value of the tag as an uppercase string.
     */
    toUpperCase(): string;

    /**
     * Converts the value of the tag to lowercase.
     * @returns The value of the tag as a lowercase string.
     */
    toLowerCase(): string;

    /**
     * Returns the character at the specified index.
     * @param index The index of the character to return.
     * @returns The character at the specified index.
     */
    charAt(index: number): string;

    /**
     * Checks if the tag includes the specified substring.
     * @param substring The substring to search for.
     * @returns Whether the tag includes the specified substring.
     */
    includes(substring: string): boolean;

    /**
     * Return an array of elements from the tag.
     * @returns An array of elements from the tag.
     */
    getElements(): string[];

    /**
     * Creates an Obsidian tag link element.
     * @param tagLabel The label for the tag link; if not provided, the tag with a hash symbol is used.
     * @returns An Obsidian tag link element as an anchor element.
     */
    getObsidianLink(tagLabel?: string): HTMLAnchorElement;

    /**
     * Returns whether the tag starts with the specified search string.
     * @param searchString The string to search for.
     * @param position The position to start the search.
     */
    startsWith(searchString: string, position?: number): boolean;

    /**
     * Checks if the tag is below another tag within a specified number of levels in the hierarchy.
     * @param tag The tag to compare with.
     * @param levels The number of levels in the hierarchy to check. Defaults to 1.
     * @returns Whether the tag is below the specified tag within the given number of levels.
     */
    isTagAtHierarchyLevel(tag: ITag, levels?: number): boolean;
}
