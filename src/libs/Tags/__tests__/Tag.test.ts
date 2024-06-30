import Tag from '../Tag';

describe('Tag', () => {
    // Constructor Tests
    test('should initialize with a string value', () => {
        const tag = new Tag('exampleTag');
        expect(tag.toString()).toBe('exampleTag');
    });

    // Method Tests
    test('should return the string value with toString', () => {
        const tag = new Tag('exampleTag');
        expect(tag.toString()).toBe('exampleTag');
    });

    test('should return the string value in uppercase with toUpperCase', () => {
        const tag = new Tag('exampleTag');
        expect(tag.toUpperCase()).toBe('EXAMPLETAG');
    });

    test('should return the string value in lowercase with toLowerCase', () => {
        const tag = new Tag('exampleTag');
        expect(tag.toLowerCase()).toBe('exampletag');
    });

    test('should return the character at a specific position with charAt', () => {
        const tag = new Tag('exampleTag');
        expect(tag.charAt(0)).toBe('e');
    });

    test('should check if the tag includes a specific substring with includes', () => {
        const tag = new Tag('exampleTag');
        expect(tag.includes('ample')).toBe(true);
        expect(tag.includes('notInTag')).toBe(false);
    });

    // Comparison Tests
    test('should compare the Tag object with a string using ==', () => {
        const tag = new Tag('exampleTag');
        expect(tag == 'exampleTag').toBe(true);
    });

    test('should not strictly compare the Tag object with a string using ===', () => {
        const tag = new Tag('exampleTag');
        expect(tag === 'exampleTag').toBe(false);
    });

    test('should use tag object in template literals correctly', () => {
        const tag = new Tag('exampleTag');
        expect(`This is a tag: ${tag}`).toBe('This is a tag: exampleTag');
    });

    // Additional Tests
    test('should treat Tag instances as strings in concatenation', () => {
        const tag = new Tag('exampleTag');
        const result = tag + ' is cool';
        expect(result).toBe('exampleTag is cool');
    });

    test('should have the same prototype as String', () => {
        const tag = new Tag('exampleTag');
        expect(Object.getPrototypeOf(tag)).toBe(Tag.prototype);
    });
});
