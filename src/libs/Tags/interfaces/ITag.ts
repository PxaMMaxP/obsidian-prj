/* eslint-disable @typescript-eslint/ban-types */

import BaseComplexDataType from 'src/classes/BaseComplexDataType';
import IMetadataCache from 'src/interfaces/IMetadataCache';

/**
 * Represents a ITag dependencie container.
 */
export interface ITagDependencies {
    metadataCache: IMetadataCache;
}

/**
 * Represents a tag constructor.
 */
export type TagConstructorType = typeof BaseComplexDataType & ITagConstructor;

/**
 * Represents a tag constructor.
 */
export interface ITagConstructor {
    new (value: string, dependencies?: ITagDependencies): ITag;
}

/**
 * Represents a tag.
 */
export interface ITag extends BaseComplexDataType {
    /**
     * Gets whether the tag exists in the cache.
     * @returns Whether the tag exists in the cache.
     */
    readonly exists: boolean;

    /**
     * Gets the tag.
     */
    get value(): string;

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
     * Overrides the valueOf method to return the primitive string value.
     * @returns The primitive string value of the tag.
     */
    valueOf(): string;

    /**
     * Overrides the toString method to return the string representation of the tag.
     * @returns The string representation of the tag.
     */
    toString(): string;

    /**
     * Checks if another tag is equal to this one based on the tag string.
     * @param other The other tag to compare.
     * @returns Whether the tags are equal.
     */
    equals(other: ITag): boolean;

    /**
     * Returns whether the tag starts with the specified search string.
     * @param searchString The string to search for.
     * @param position The position to start the search.
     */
    startsWith(searchString: string, position?: number): boolean;
}
