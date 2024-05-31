import SearchOperator from './SearchOperator';
import {
    SearchOperators,
    SearchOperatorType,
    SearchQuotes,
    SearchQuoteType,
} from './SearchOperatorTypes';
import SearchQuery from './SearchQuery';
import SearchTerm from './SearchTerm';

/**
 * Class responsible for parsing a search string into a SearchQuery.
 */
export default class SearchParser {
    /**
     * Parses the given search text into a SearchQuery object.
     * @param {string} searchText - The search text to parse.
     * @returns {SearchQuery} A SearchQuery object containing the parsed search elements.
     */
    public static parse(searchText: string): SearchQuery {
        const query = new SearchQuery();
        let openQuote = false;
        let term = '';
        let escapeNextChar = false;

        // Iterate over each character in the search text
        for (const char of searchText) {
            if (char === '\\') {
                // Escape the next character
                escapeNextChar = true;
                continue;
            }

            if (!escapeNextChar && this.isQuote(char)) {
                openQuote = !openQuote;

                // Add the term if the quote is closed and the term is not empty
                if (!this.isTermEmpty(term)) {
                    term = this.addTerm(query, term);
                }
            } else if (openQuote) {
                // Add the character to the term if inside a quote
                term += char;
            } else if (this.isOperator(char)) {
                // Add the Operator to the query
                const previousSearchElement = query.getElements().slice(-1)[0];

                // Check for consecutive operators
                if (
                    previousSearchElement instanceof SearchOperator &&
                    ((previousSearchElement.operator !== '!' && char !== '!') ||
                        (previousSearchElement.operator === '!' &&
                            char === '!'))
                ) {
                    throw new Error('Consecutive operators are not allowed');
                }

                this.addOperator(query, char as SearchOperatorType);
            } else if (char === ' ') {
                // Spaces outside quotation marks separate terms
                if (!this.isTermEmpty(term)) {
                    term = this.addTerm(query, term);
                }
            } else {
                term += char;
            }

            escapeNextChar = false;
        }

        // Check for unmatched quotes
        if (openQuote) {
            throw new Error('Unmatched quote');
        }

        // Add the final term to the query
        if (!this.isTermEmpty(term)) {
            term = this.addTerm(query, term);
        }

        // Add default AND operators between search terms if no operators are specified
        this.handleDefaultOperator(query);

        // Combine negations with search terms and remove negation operators
        this.combineNegationsAndElements(query);

        return query;
    }

    /**
     * Adds default AND operators between search terms if no operators are specified.
     * @param {SearchQuery} query The SearchQuery object to add operators to.
     */
    private static handleDefaultOperator(query: SearchQuery): void {
        const searchElements = query.getElements();

        for (let i = 0; i < searchElements.length - 1; i++) {
            const currentElement = searchElements[i];
            const nextElement = searchElements[i + 1];

            if (
                currentElement instanceof SearchTerm &&
                nextElement instanceof SearchTerm
            ) {
                // Add an AND operator between search terms
                searchElements.splice(i + 1, 0, new SearchOperator('&'));
                i++; // Skip the next element to avoid adding multiple operators
            }
        }
    }

    /**
     * Combines negations with search terms and removes negation operators.
     * @param {SearchQuery} query The SearchQuery object to process.
     */
    private static combineNegationsAndElements(query: SearchQuery): void {
        const searchElements = query.getElements();

        for (let i = 0; i < searchElements.length - 1; i++) {
            const currentElement = searchElements[i];
            const nextElement = searchElements[i + 1];

            if (
                currentElement instanceof SearchOperator &&
                currentElement.operator === '!'
            ) {
                // remove the negation operator
                searchElements.splice(i, 1);
                // add the negation to the next element
                nextElement.negated = true;
            }
        }
    }

    /**
     * Checks if the term is empty.
     * @param term The term to check.
     * @returns True if the term is empty, false otherwise.
     */
    private static isTermEmpty(term: string): boolean {
        return term.trim() === '';
    }

    /**
     * Adds a search term to the query.
     * @param {SearchQuery} query The SearchQuery object to add the term to.
     * @param {string} term The term to add.
     * @returns {string} An empty string.
     */
    private static addTerm(query: SearchQuery, term: string): string {
        const searchTerm = new SearchTerm(term);
        query.addElement(searchTerm);

        return '';
    }

    /**
     * Adds a search operator to the query.
     * @param {SearchQuery} query The SearchQuery object to add the operator to.
     * @param {SearchOperatorType} operator The operator to add.
     */
    private static addOperator(
        query: SearchQuery,
        operator: SearchOperatorType,
    ): void {
        const searchOperator = new SearchOperator(operator);
        query.addElement(searchOperator);
    }

    /**
     * Checks if the character is a search operator.
     * @param {string} char - The character to check.
     * @returns {boolean} True if the character is a search operator, false otherwise.
     */
    private static isOperator(char: string): boolean {
        return SearchOperators.includes(char as SearchOperatorType);
    }

    /**
     * Checks if the character is a quote.
     * @param {string} char The character to check.
     * @returns {boolean} True if the character is a quote, false otherwise.
     */
    private static isQuote(char: string): boolean {
        return SearchQuotes.includes(char as SearchQuoteType);
    }
}
