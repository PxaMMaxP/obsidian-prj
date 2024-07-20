import SearchElement from '../SearchElement';
import SearchTerm from '../SearchTerm';

describe('SearchTerm', () => {
    let searchTerm: SearchTerm;

    beforeEach(() => {
        searchTerm = new SearchTerm('testTerm');
    });

    test('should initialize with correct term value', () => {
        expect(searchTerm.term).toBe('testTerm');
    });

    test('should set term value correctly', () => {
        searchTerm.term = 'newTerm';
        expect(searchTerm.term).toBe('newTerm');
    });

    test('isOperator should return false', () => {
        expect(searchTerm.isOperator).toBe(false);
    });

    test('should initialize with term value', () => {
        const newSearchTerm = new SearchTerm('anotherTerm');
        expect(newSearchTerm.term).toBe('anotherTerm');
    });

    test('should inherit from SearchElement', () => {
        expect(searchTerm).toBeInstanceOf(SearchElement);
    });

    test('should handle negated value correctly', () => {
        searchTerm.isNegated = true;
        expect(searchTerm.isNegated).toBe(true);
    });
});
