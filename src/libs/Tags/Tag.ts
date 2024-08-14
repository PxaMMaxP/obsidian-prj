import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { Inject } from 'ts-injex';
import { Register } from 'ts-injex';
import type { ITag, ITag_ } from './interfaces/ITag';

/**
 * Represents a tag.
 */
/**
 * Class for the markdown block processor.
 */
@ImplementsStatic<ITag_>()
@Register('ITag_')
export class Tag implements ITag {
    /**
     * The tag.
     */
    private _tag: string;

    /**
     * Sets the tag.
     * @param value The value of the tag.
     * @remarks If the tag is prefixed with a hash symbol, the symbol is removed.
     */
    private set value(value: unknown) {
        if (typeof value !== 'string') {
            value = '';
        } else {
            this._tag = value?.startsWith('#') ? value.slice(1) : value || '';
        }
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
    @Inject('IMetadataCache')
    private readonly _IMetadataCache: IMetadataCache;

    /**
     * Gets the tag prefixed with a hash symbol.
     */
    public get tagWithHash(): string {
        return `#${this._tag}`;
    }

    /**
     * Whether the tag exists in the cache.
     */
    private _isExisting: boolean | undefined = undefined;

    /**
     * Gets whether the tag exists in the cache.
     * @remarks Lazy loading is used to check if the tag exists in the cache.
     */
    public get isExisting(): boolean {
        if (this._isExisting === undefined) {
            const existFile = this._IMetadataCache.cache.find((file) => {
                const tags = file.metadata?.frontmatter?.tags;

                if (typeof tags === 'string') {
                    return tags === this.tagWithHash;
                } else if (Array.isArray(tags)) {
                    return tags.includes(this.tagWithHash);
                }

                return false;
            });

            this._isExisting = existFile ? true : false;
        }

        return this._isExisting;
    }

    /**
     * Creates a new instance of the Tag class.
     * @param value The value of the tag.
     */
    constructor(value: unknown) {
        if (typeof value === 'string') {
            this.value = value;
        } else {
            this.value = '';
        }
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
     * Checks if another tag is equal to this one based on the tag string.
     * @param other The other tag to compare.
     * @returns Whether the tags are equal.
     */
    public equals(other: ITag): boolean {
        const t = other.toString();

        return this.value === t;
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
     * Checks if the tag is below another tag within a specified number of levels in the hierarchy.
     * @param tag The tag to compare with.
     * @param levels The number of levels in the hierarchy to check. Defaults to 1.
     * @returns Whether the tag is below the specified tag within the given number of levels.
     */
    public isTagAtHierarchyLevel(tag: ITag, levels = 1): boolean {
        const thisElements = this.getElements();
        const tagElements = tag.getElements();

        // Check if the hierarchy level is valid
        if (levels < 1) {
            return false;
        }

        // Check if the number of elements in the tag is sufficient for the comparison
        if (tagElements.length + levels > thisElements.length) {
            return false;
        }

        // Compare the relevant parts of the hierarchy
        const start = thisElements.length - levels - tagElements.length;

        for (let i = 0; i < tagElements.length; i++) {
            if (thisElements[start + i] !== tagElements[i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Overrides the toString method to return the string representation of the tag.
     * @returns The string representation of the tag.
     */
    toString(): string {
        return this.value;
    }

    /**
     * Overrides the valueOf method to return the primitive string value.
     * @returns The primitive string value of the tag.
     */
    primitiveOf(): string {
        return this.value;
    }

    /**
     * Checks if the object is an instance of the type.
     * @param obj The object to check.
     * @returns Whether the object is an instance of the type.
     */
    [Symbol.hasInstance](obj: unknown): boolean {
        return obj instanceof Tag;
    }
}
