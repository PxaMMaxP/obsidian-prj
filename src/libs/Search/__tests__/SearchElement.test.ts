import SearchElement from '../SearchElement';

// Concrete implementation for testing purposes
class ConcreteSearchElement extends SearchElement {
    constructor(value: string, negated = false) {
        if (negated === undefined || negated === false) {
            super(value);
        } else {
            super(value, negated);
        }
    }

    get isOperator(): boolean {
        // For testing purposes always returns false
        return false;
    }
}

// Jest tests
describe('SearchElement', () => {
    let searchElement: ConcreteSearchElement;

    beforeEach(() => {
        searchElement = new ConcreteSearchElement('testValue', true);
    });

    test('should initialize with correct values', () => {
        expect(searchElement.value).toBe('testValue');
        expect(searchElement.isNegated).toBe(true);
    });

    test('should set value correctly', () => {
        searchElement.value = 'newValue';
        expect(searchElement.value).toBe('newValue');
    });

    test('should set negated correctly', () => {
        searchElement.isNegated = false;
        expect(searchElement.isNegated).toBe(false);
    });

    test('isOperator should return correct value', () => {
        expect(searchElement.isOperator).toBe(false);
    });

    test('should initialize with default negated value as false', () => {
        const defaultNegatedElement = new ConcreteSearchElement(
            'defaultTestValue',
        );
        expect(defaultNegatedElement.isNegated).toBe(false);
    });

    test('should initialize with negated value as true', () => {
        const negatedElement = new ConcreteSearchElement(
            'negatedTestValue',
            true,
        );
        expect(negatedElement.isNegated).toBe(true);
    });
});
