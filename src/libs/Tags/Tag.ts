import BaseComplexDataType from 'src/classes/BaseComplexDataType';
import IMetadataCache from 'src/interfaces/IMetadataCache';
import type { ITag, ITagDependencies } from './interfaces/ITag';
import DependencyRegistry from '../DependencyRegistry';

/**
 * Represents a tag.
 * @remarks The class extends the String class and provides additional methods to work with tags.
 */

/**
 *
 */
export default class Tag extends BaseComplexDataType implements ITag {
    private _tag: string;

    /**
     * Sets the tag.
     * @param value The value of the tag.
     * @remarks If the tag is prefixed with a hash symbol, the symbol is removed.
     */
    private set value(value: string) {
        this._tag = value?.startsWith('#') ? value.slice(1) : value || '';
    }

    /**
     * Gets the tag.
     */
    public get value(): string {
        return this._tag;
    }

    /**
     * The metadata cache.
     */
    private _metadataCache: IMetadataCache;

    /**
     * Gets the tag with a hash symbol.
     * @returns The tag prefixed with a hash symbol.
     */
    public get tagWithHash(): string {
        return `#${this._tag}`;
    }

    /**
     * Whether the tag exists in the cache.
     */
    private _exists: boolean | undefined = undefined;

    /**
     * Gets whether the tag exists in the cache.
     * @returns Whether the tag exists in the cache.
     * @remarks Lazy loading is used to check if the tag exists in the cache.
     */
    public get exists(): boolean {
        if (this._exists === undefined) {
            const existFile = this._metadataCache.cache.find((file) => {
                const tags = file.metadata?.frontmatter?.tags;

                if (typeof tags === 'string') {
                    return tags === this.tagWithHash;
                } else if (Array.isArray(tags)) {
                    return tags.includes(this.tagWithHash);
                }

                return false;
            });

            this._exists = existFile ? true : false;
        }

        return this._exists;
    }

    /**
     * Creates a new instance of the Tag class.
     * @param value The value of the tag.
     * @param dependencies The dependencies of the tag; if not provided, the global dependency registry is used.
     */
    constructor(value: string, dependencies?: ITagDependencies) {
        super();

        dependencies = DependencyRegistry.isDependencyProvided(
            'ITagDependencies',
            dependencies,
        );

        this.value = value;

        this._metadataCache = dependencies.metadataCache;
    }

    /**
     * Converts the value of the tag to uppercase.
     * @returns The value of the tag as an uppercase string.
     */
    public toUpperCase(): string {
        return this.value.toUpperCase();
    }

    /**
     * Converts the value of the tag to lowercase.
     * @returns The value of the tag as a lowercase string.
     */
    public toLowerCase(): string {
        return this.value.toLowerCase();
    }

    /**
     * Returns the character at the specified index.
     * @param index The index of the character to return.
     * @returns The character at the specified index.
     */
    public charAt(index: number): string {
        return this.value.charAt(index);
    }

    /**
     * Checks if the tag includes the specified substring.
     * @param substring The substring to search for.
     * @returns Whether the tag includes the specified substring.
     */
    public includes(substring: string): boolean {
        return this.value.includes(substring);
    }

    /**
     * Return an array of elements from the tag.
     * @returns An array of elements from the tag.
     * @remarks The elements are separated by a forward slash.
     */
    public getElements(): string[] {
        return this.value.split('/');
    }

    /**
     * Creates an Obsidian tag link element.
     * @param tagLabel The label for the tag link; if not provided, the tag with a hash symbol is used.
     * @returns An Obsidian tag link element as an anchor element.
     */
    public getObsidianLink(tagLabel?: string): HTMLAnchorElement {
        const obsidianLink = document.createElement('a');
        obsidianLink.href = this.tagWithHash;
        obsidianLink.classList.add('tag');
        obsidianLink.target = '_blank';
        obsidianLink.rel = 'noopener';
        obsidianLink.textContent = `${tagLabel ?? this.tagWithHash}`;

        return obsidianLink;
    }

    /**
     * Overrides the valueOf method to return the primitive string value.
     * @returns The primitive string value of the tag.
     */
    public valueOf(): string {
        return this.value;
    }

    /**
     * Overrides the toString method to return the string representation of the tag.
     * @returns The string representation of the tag.
     */
    public toString(): string {
        return this.value;
    }

    /**
     * Checks if another tag is equal to this one based on the tag string.
     * @param other The other tag to compare.
     * @returns Whether the tags are equal.
     */
    public equals(other: ITag): boolean {
        return this.value === other.toString();
    }

    /**
     * Returns whether the tag starts with the specified search string.
     * @param searchString The string to search for.
     * @param position The position to start the search.
     * @returns Whether the tag starts with the specified search string.
     */
    startsWith(searchString: string, position?: number): boolean {
        return this.value.startsWith(searchString, position);
    }

    /**
     * Returns a frontmatter compatible object.
     * @returns The Tag as a string.
     */
    public getFrontmatterObject():
        | Record<string, unknown>
        | Array<unknown>
        | string
        | null
        | undefined {
        return this._tag.toString();
    }
}
