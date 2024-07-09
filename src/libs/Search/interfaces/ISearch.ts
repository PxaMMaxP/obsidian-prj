/**
 * Interface for {@link ISearch} Constructor.
 */
export interface ISearch_ {
    new (searchQueryText: string): ISearch;
}

/**
 * Interface for Search.
 * @see {@link ISearch_}
 */
export interface ISearch {
    /**
     * Parses the search query text.
     */
    parse(): void;
    /**
     * Applies the search logic to the given text.
     * @param text The text to apply the search logic to.
     * @returns True if the text matches the search query, false otherwise.
     */
    applySearchLogic(text: string): boolean;
}
