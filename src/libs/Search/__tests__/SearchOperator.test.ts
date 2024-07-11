import SearchElement from '../SearchElement';
import SearchOperator from '../SearchOperator';

describe('SearchOperator', () => {
    let searchOperator: SearchOperator;

    beforeEach(() => {
        searchOperator = new SearchOperator('&');
    });

    test('should initialize with correct operator value', () => {
        expect(searchOperator.operator).toBe('&');
    });

    test('should set operator value correctly', () => {
        searchOperator.operator = '|';
        expect(searchOperator.operator).toBe('|');
    });

    test('isOperator should return true', () => {
        expect(searchOperator.isOperator).toBe(true);
    });

    test('should initialize with operator type', () => {
        const orOperator = new SearchOperator('|');
        expect(orOperator.operator).toBe('|');
    });

    test('should inherit from SearchElement', () => {
        expect(searchOperator).toBeInstanceOf(SearchElement);
    });

    test('should handle negated value correctly', () => {
        searchOperator.negated = true;
        expect(searchOperator.negated).toBe(true);
    });
});
