import SearchElement from './SearchElement';

/**
 * Class representing a search term.
 * This class extends the SearchElement class and is used to handle terms in a search query.
 */
export default class SearchTerm extends SearchElement {
    /**
     * Constructs a new SearchTerm with the given term.
     * @param term - The search term value.
     */
    constructor(term: string) {
        super(term);
    }

    /**
     * Gets the term value of the search element.
     */
    public get term(): string {
        return this._value;
    }

    /**
     * Sets the term value of the search element.
     * @param value - The new term value to be set.
     */
    public set term(value: string) {
        this._value = value;
    }

    /**
     * Determines if the element is an operator.
     * This method overrides the abstract method in the base class.
     */
    public get isOperator(): boolean {
        return false;
    }
}
