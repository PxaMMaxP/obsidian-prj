/**
 * @jest-environment jsdom
 */

import IMetadataCache from 'src/interfaces/IMetadataCache';
import Tag from '../Tag';

describe('Tag', () => {
    let metadataCacheMock: IMetadataCache;

    beforeEach(() => {
        metadataCacheMock = {
            cache: [
                {
                    metadata: {
                        frontmatter: {
                            tags: ['#exampleTag'],
                        },
                    },
                },
            ],
        } as unknown as IMetadataCache;
    });

    // Constructor Tests
    test('should initialize with a string value', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.toString()).toBe('exampleTag');
    });

    // Method Tests
    test('should return the string value with toString', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.toString()).toBe('exampleTag');
    });

    test('should return the string value in uppercase with toUpperCase', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.toUpperCase()).toBe('EXAMPLETAG');
    });

    test('should return the string value in lowercase with toLowerCase', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.toLowerCase()).toBe('exampletag');
    });

    test('should return the character at a specific position with charAt', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.charAt(0)).toBe('e');
    });

    test('should check if the tag includes a specific substring with includes', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.includes('ample')).toBe(true);
        expect(tag.includes('notInTag')).toBe(false);
    });

    // Comparison Tests
    test('should compare the Tag object with a string', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.toString() == 'exampleTag').toBe(true);
    });

    test('should compare the Tag object with a object using ==', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        const equalTagString = new Tag('exampleTag', metadataCacheMock);
        expect(tag.equals(equalTagString)).toBe(true);
    });

    test('should use tag object in template literals correctly', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(`This is a tag: ${tag}`).toBe('This is a tag: exampleTag');
    });

    test('should treat Tag instances as strings in concatenation', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        const result = tag + ' is cool';
        expect(result).toBe('exampleTag is cool');
    });

    // Test `exists` property
    test('should return true if tag exists in metadata cache', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.exists).toBe(true);
    });

    test('should return false if tag does not exist in metadata cache', () => {
        const metadataCacheMockEmpty: IMetadataCache = {
            cache: [],
        } as unknown as IMetadataCache;
        const tag = new Tag('exampleTag', metadataCacheMockEmpty);
        expect(tag.exists).toBe(false);
    });

    // Test `tagWithHash` property
    test('should return tag with hash', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        const tagWithHash = tag['tagWithHash'];
        expect(tagWithHash).toBe('#exampleTag');
    });

    // Test `getObsidianLink` method
    test('should return correct obsidian link', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        const obsidianLink = tag.getObsidianLink();

        expect(obsidianLink.href.replace('http://localhost/', '')).toBe(
            '#exampleTag',
        );
        expect(obsidianLink.textContent).toBe('#exampleTag');
    });

    test('should return correct obsidian link with custom label', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        const obsidianLink = tag.getObsidianLink('Custom Label');

        expect(obsidianLink.href.replace('http://localhost/', '')).toBe(
            '#exampleTag',
        );
        expect(obsidianLink.textContent).toBe('Custom Label');
    });

    // Test `startsWith` method
    test('should return true if tag starts with a specific substring', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.startsWith('example')).toBe(true);
    });

    test('should return false if tag does not start with a specific substring', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.startsWith('notInTag')).toBe(false);
    });

    test('should return true if tag starts with a specific substring at a specific position', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.startsWith('ample', 2)).toBe(true);
    });

    test('should return false if tag does not start with a specific substring at a specific position', () => {
        const tag = new Tag('exampleTag', metadataCacheMock);
        expect(tag.startsWith('ample', 3)).toBe(false);
    });

    // Test `getElements` method
    test('should return an array of elements from the tag', () => {
        const tag = new Tag('exampleTag/subtag', metadataCacheMock);
        expect(tag.getElements()).toEqual(['exampleTag', 'subtag']);
    });
});
