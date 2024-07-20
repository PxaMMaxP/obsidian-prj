import SearchElement from './SearchElement';
import SearchOperator from './SearchOperator';
import SearchTerm from './SearchTerm';

/**
 * Class representing a search query.
 * This class is used to store and manage a collection of search elements.
 */
export default class SearchQuery {
    private readonly _elements: SearchElement[] = [];

    /**
     * Adds a search element to the query.
     * @param element The search element to add.
     */
    public addElement(element: SearchElement): void {
        this._elements.push(element);
    }

    /**
     * Gets the collection of search elements.
     * @returns An array of search elements.
     */
    public getElements(): SearchElement[] {
        return this._elements;
    }

    /**
     * Determines if the query matches the given text.
     * @param text The text to test.
     * @returns True if the query matches the text; otherwise, false.
     */
    public matches(text: string): boolean {
        if (this._elements.length === 0) {
            return false;
        }

        text = text.toLowerCase();

        // First: test the terms
        const termResults: boolean[] = this._elements
            .filter((element) => !element.isOperator)
            .map((element) => {
                const term = element as SearchTerm;
                const termMatch = text.includes(term.term.toLowerCase());

                return term.isNegated ? !termMatch : termMatch;
            });

        // Second: test the operators
        let result = termResults[0];
        let termIndex = 1;

        for (let i = 1; i < this._elements.length; i++) {
            const element = this._elements[i];

            if (element.isOperator) {
                const operator = element as SearchOperator;
                const nextTermResult = termResults[termIndex++];

                if (operator.isNegated) {
                    if (operator.operator === '&') {
                        result = result && !nextTermResult;
                    } else if (operator.operator === '|') {
                        result = result || !nextTermResult;
                    }
                } else {
                    if (operator.operator === '&') {
                        result = result && nextTermResult;
                    } else if (operator.operator === '|') {
                        result = result || nextTermResult;
                    }
                }
            }
        }

        return result;
    }
}
