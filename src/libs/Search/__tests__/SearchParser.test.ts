import SearchOperator from '../SearchOperator';
import SearchParser from '../SearchParser';
import SearchTerm from '../SearchTerm';

describe('SearchParser', () => {
    it('should parse a single term correctly', () => {
        const query = SearchParser.parse('term');
        const elements = query.getElements();

        expect(elements).toHaveLength(1);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).term).toBe('term');
    });

    it('should parse multiple terms with default AND operator', () => {
        const query = SearchParser.parse('term1 term2');
        const elements = query.getElements();

        expect(elements).toHaveLength(3);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect(elements[1]).toBeInstanceOf(SearchOperator);
        expect(elements[2]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).term).toBe('term1');
        expect((elements[1] as SearchOperator).operator).toBe('&');
        expect((elements[2] as SearchTerm).term).toBe('term2');
    });

    it('should parse terms with explicit operators', () => {
        const query = SearchParser.parse('term1 & term2 | term3');
        const elements = query.getElements();

        expect(elements).toHaveLength(5);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect(elements[1]).toBeInstanceOf(SearchOperator);
        expect(elements[2]).toBeInstanceOf(SearchTerm);
        expect(elements[3]).toBeInstanceOf(SearchOperator);
        expect(elements[4]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).term).toBe('term1');
        expect((elements[1] as SearchOperator).operator).toBe('&');
        expect((elements[2] as SearchTerm).term).toBe('term2');
        expect((elements[3] as SearchOperator).operator).toBe('|');
        expect((elements[4] as SearchTerm).term).toBe('term3');
    });

    it('should parse negated terms correctly', () => {
        const query = SearchParser.parse('!term1 term2');
        const elements = query.getElements();

        expect(elements).toHaveLength(3);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect(elements[1]).toBeInstanceOf(SearchOperator);
        expect(elements[2]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).negated).toBe(true);
        expect((elements[0] as SearchTerm).term).toBe('term1');
        expect((elements[1] as SearchOperator).operator).toBe('&');
        expect((elements[2] as SearchTerm).term).toBe('term2');
    });

    it('should parse quoted terms correctly', () => {
        const query = SearchParser.parse('"term1 term2" term3');
        const elements = query.getElements();

        expect(elements).toHaveLength(3);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect(elements[1]).toBeInstanceOf(SearchOperator);
        expect(elements[2]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).term).toBe('term1 term2');
        expect((elements[1] as SearchOperator).operator).toBe('&');
        expect((elements[2] as SearchTerm).term).toBe('term3');
    });

    it('should parse complex queries correctly', () => {
        const query = SearchParser.parse('"term1 term2" & term3 | !term4');
        const elements = query.getElements();

        expect(elements).toHaveLength(5);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect(elements[1]).toBeInstanceOf(SearchOperator);
        expect(elements[2]).toBeInstanceOf(SearchTerm);
        expect(elements[3]).toBeInstanceOf(SearchOperator);
        expect(elements[4]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).term).toBe('term1 term2');
        expect((elements[1] as SearchOperator).operator).toBe('&');
        expect((elements[2] as SearchTerm).term).toBe('term3');
        expect((elements[3] as SearchOperator).operator).toBe('|');
        expect((elements[4] as SearchTerm).negated).toBe(true);
        expect((elements[4] as SearchTerm).term).toBe('term4');
    });

    it('should throw an error for unmatched quotes', () => {
        expect(() => {
            SearchParser.parse('"term1 term2 term3');
        }).toThrow('Unmatched quote');
    });

    it('should throw an error for consecutive operators', () => {
        expect(() => {
            SearchParser.parse('term1 && term2');
        }).toThrow('Consecutive operators are not allowed');

        expect(() => {
            SearchParser.parse('term1 & | term2');
        }).toThrow('Consecutive operators are not allowed');

        expect(() => {
            SearchParser.parse('! !term1');
        }).toThrow('Consecutive operators are not allowed');
    });

    it('should handle search text with leading and trailing spaces', () => {
        const query = SearchParser.parse('  term1 term2  ');
        const elements = query.getElements();

        expect(elements).toHaveLength(3);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect(elements[1]).toBeInstanceOf(SearchOperator);
        expect(elements[2]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).term).toBe('term1');
        expect((elements[1] as SearchOperator).operator).toBe('&');
        expect((elements[2] as SearchTerm).term).toBe('term2');
    });

    it('should parse combinations of operators and quoted terms correctly', () => {
        const query = SearchParser.parse('"term1" & !term2');
        const elements = query.getElements();

        expect(elements).toHaveLength(3);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect(elements[1]).toBeInstanceOf(SearchOperator);
        expect(elements[2]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).term).toBe('term1');
        expect((elements[1] as SearchOperator).operator).toBe('&');
        expect((elements[2] as SearchTerm).negated).toBe(true);
        expect((elements[2] as SearchTerm).term).toBe('term2');
    });

    it('should parse combinations of negations and operators', () => {
        const query = SearchParser.parse('term1 !& term2');
        const elements = query.getElements();

        expect(elements).toHaveLength(3);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect(elements[1]).toBeInstanceOf(SearchOperator);
        expect(elements[2]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).term).toBe('term1');
        expect((elements[1] as SearchOperator).operator).toBe('&');
        expect((elements[1] as SearchOperator).negated).toBe(true);
        expect((elements[2] as SearchTerm).term).toBe('term2');
    });

    it('should handle very long single term correctly', () => {
        const longTerm = 'a'.repeat(10000); // A single very long term
        const query = SearchParser.parse(longTerm);
        const elements = query.getElements();

        expect(elements).toHaveLength(1);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).term).toBe(longTerm);
    });

    it('should handle terms with unusual characters', () => {
        const query = SearchParser.parse('term1?@# term2$%^');
        const elements = query.getElements();

        expect(elements).toHaveLength(3);
        expect(elements[0]).toBeInstanceOf(SearchTerm);
        expect(elements[1]).toBeInstanceOf(SearchOperator);
        expect(elements[2]).toBeInstanceOf(SearchTerm);
        expect((elements[0] as SearchTerm).term).toBe('term1?@#');
        expect((elements[1] as SearchOperator).operator).toBe('&');
        expect((elements[2] as SearchTerm).term).toBe('term2$%^');
    });
});
