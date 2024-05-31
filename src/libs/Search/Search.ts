import SearchParser from './SearchParser';
import SearchQuery from './SearchQuery';

export default class Search {
    private _searchQueryText: string;
    private _searchQuery: SearchQuery | undefined;

    constructor(searchQueryText: string) {
        this._searchQueryText = searchQueryText;
    }

    public parse(): void {
        this._searchQuery = SearchParser.parse(this._searchQueryText);
    }

    public applySearchLogic(text: string): boolean {
        if (!this._searchQuery) {
            this.parse();
        }

        return this._searchQuery?.matches(text) ?? false;
    }
}
