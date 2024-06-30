/**
 * Represents a tag.
 * @remarks The class extends the String class and provides additional methods to work with tags.
 */
export default class Tag extends String {
    /**
     * Creates a new instance of the Tag class.
     * @param value The value of the tag.
     */
    constructor(value: string) {
        super(value);
        Object.setPrototypeOf(this, Tag.prototype);
    }

    /**
     * Converts the value of the tag to uppercase.
     * @returns The value of the tag as an uppercase string.
     */
    public toUpperCase(): string {
        return this.toString().toUpperCase();
    }

    /**
     * Converts the value of the tag to lowercase.
     * @returns The value of the tag as a lowercase string.
     */
    public toLowerCase(): string {
        return this.toString().toLowerCase();
    }

    /**
     * Returns the character at the specified index.
     * @param index The index of the character to return.
     * @returns The character at the specified index.
     */
    public charAt(index: number): string {
        return this.toString().charAt(index);
    }

    /**
     * Checks if the tag includes the specified substring.
     * @param substring The substring to search for.
     * @returns Whether the tag includes the specified substring.
     */
    public includes(substring: string): boolean {
        return this.toString().includes(substring);
    }
}
