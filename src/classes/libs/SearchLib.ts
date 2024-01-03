// Note: SearchLib class

export default class SearchLib {

    /**
     * Parses the search text into an array of objects that represent the search terms
     * @param searchText The search text to parse
     * @returns An array of objects with the following properties:
     * - term: The search term
     * - negate: Whether the term should be negated
     * - isOperator: Whether the term is an operator
     */
    static parseSearchText(searchText: string): SearchTermsArray {
        searchText = searchText.toLowerCase();

        // Check if the search text contains quotes: If not, return the search text as a single term (no complex search logic)
        if (!searchText.includes('"')) {
            return [{ term: searchText.trim(), negate: false, isOperator: false }];
        }

        const terms = [];
        let term = '';
        let inQuotes = false;
        let negate = false;

        for (const char of searchText) {
            if (char === '"') {
                if (inQuotes) {
                    // Save the term with negation status
                    terms.push({ term: term.toLowerCase(), negate: negate, isOperator: false });
                    term = '';
                    negate = false;
                }
                inQuotes = !inQuotes;
            } else if (inQuotes) {
                term += char;
            } else if (char === ' ') {
                // Ignore spaces outside of quotes
                continue;
            } else if (['&', '|', '!'].includes(char)) {
                if (term.length > 0) {
                    terms.push({ term: term, negate: negate, isOperator: false });
                    term = '';
                    negate = false;
                }
                if (char === '!') {
                    negate = true;
                } else {
                    terms.push({ term: char, negate: false, isOperator: true });
                }
            } else {
                term += char;
            }
        }

        if (term.length > 0) {
            terms.push({ term: term, negate: negate, isOperator: false });
        }

        // Check and add the default AND operator
        if (terms.length > 1) {
            let i = 0;
            while (i < terms.length - 1) {
                if (!terms[i].isOperator && !terms[i + 1].isOperator) {
                    // Add the default AND operator between two non-operator terms
                    terms.splice(i + 1, 0, { term: '&', negate: false, isOperator: true });
                }
                i += 2; // Jump to the next pair of terms
            }

        }

        return terms;
    }

    /**
     * Applies the search logic to the given text content
     * @param terms The search terms
     * @param textContent The text content to apply the search logic to
     * @returns Whether the text content matches the search terms (true or false)
     */
    static applySearchLogic(terms: SearchTermsArray, textContent: string): boolean {
        textContent = textContent.toLowerCase();

        let result = true;

        // If only one term is present, return the result of the term
        if (terms.length === 1) {
            const termObj = terms[0];
            result = termObj.negate ? !textContent.includes(termObj.term) : textContent.includes(termObj.term);
        } else {
            for (let i = 0; i < terms.length; i += 3) {
                const termObj1 = terms[i];
                const operatorObj = terms[i + 1];
                const termObj2 = terms[i + 2];

                const term1Match = termObj1.negate ? !textContent.includes(termObj1.term) : textContent.includes(termObj1.term);
                const term2Match = termObj2 ? (termObj2.negate ? !textContent.includes(termObj2.term) : textContent.includes(termObj2.term)) : true;

                if (operatorObj.term === '&') {
                    result = result && term1Match && term2Match;
                } else if (operatorObj.term === '|') {
                    result = result && (term1Match || term2Match);
                }

                // If there is no left term, break the loop
                if (!termObj2) break;
            }
        }

        return result;
    }
}

/**
 * Represents a search term
 * @property term The search term
 * @property negate Whether the term should be negated
 * @property isOperator Whether the term is an operator
 */
export type SearchTerm = {
    term: string;
    negate: boolean;
    isOperator: boolean;
};

/**
 * Represents an array of search terms
 */
export type SearchTermsArray = Array<SearchTerm>;