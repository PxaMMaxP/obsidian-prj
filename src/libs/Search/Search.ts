import { ISearch_ } from './interfaces/ISearch';
import SearchParser from './SearchParser';
import SearchQuery from './SearchQuery';

/**
 * Represents a search operation.
 */
const search_: ISearch_ = class Search {
    private readonly _searchQueryText: string;
    private _searchQuery: SearchQuery | undefined;

    /**
     * Creates a new instance of the Search class.
     * @param searchQueryText The search query text.
     */
    constructor(searchQueryText: string) {
        this._searchQueryText = searchQueryText;
    }

    /**
     * Parses the search query text.
     */
    public parse(): void {
        this._searchQuery = SearchParser.parse(this._searchQueryText);
    }

    /**
     * Applies the search logic to the given text.
     * @param text The text to apply the search logic to.
     * @returns True if the text matches the search query, false otherwise.
     */
    public applySearchLogic(text: string): boolean {
        if (!this._searchQuery) {
            this.parse();
        }

        return this._searchQuery?.matches(text) ?? false;
    }
};

export { search_ as Search };
