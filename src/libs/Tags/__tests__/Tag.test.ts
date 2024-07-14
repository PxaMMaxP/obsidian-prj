/**
 * @jest-environment jsdom
 */

import IMetadataCache from 'src/interfaces/IMetadataCache';
import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { Tag } from '../Tag';

describe('Tag', () => {
    let metadataCacheMock: IMetadataCache;
    let dependencies: IDIContainer;

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

        dependencies = {
            register<T>(identifier: string, dependency: T): void {
                throw new Error('Method not implemented.');
            },
            resolve<T>(identifier: string): T {
                let dependency: T;

                switch (identifier) {
                    case 'IMetadataCache':
                        dependency = metadataCacheMock as unknown as T;
                        break;
                    default:
                        throw new Error(`Dependency ${identifier} not found`);
                }

                return dependency as T;
            },
        };
    });

    // Constructor Tests
    test('should initialize with a string value without hash', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.toString()).toBe('exampleTag');
    });

    test('should initialize with a string value with hash', () => {
        const tag = new Tag('#exampleTag', dependencies);
        expect(tag.toString()).toBe('exampleTag');
    });

    // Method Tests
    test('should return the string value with toString', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.toString()).toBe('exampleTag');
    });

    test('should return the primitive string value with valueOf', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.valueOf()).toBe('exampleTag');
    });

    test('should return the string value in uppercase with toUpperCase', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.toUpperCase()).toBe('EXAMPLETAG');
    });

    test('should return the string value in lowercase with toLowerCase', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.toLowerCase()).toBe('exampletag');
    });

    test('should return the character at a specific position with charAt', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.charAt(0)).toBe('e');
    });

    test('should check if the tag includes a specific substring with includes', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.includes('ample')).toBe(true);
        expect(tag.includes('notInTag')).toBe(false);
    });

    // Comparison Tests
    test('should compare the Tag object with a string', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.toString() == 'exampleTag').toBe(true);
    });

    test('should compare the Tag object with an object using ==', () => {
        const tag = new Tag('exampleTag', dependencies);
        const equalTagString = new Tag('exampleTag', dependencies);
        expect(tag.equals(equalTagString)).toBe(true);
    });

    test('should use tag object in template literals correctly', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(`This is a tag: ${tag}`).toBe('This is a tag: exampleTag');
    });

    test('should treat Tag instances as strings in concatenation', () => {
        const tag = new Tag('exampleTag', dependencies);
        const result = tag + ' is cool';
        expect(result).toBe('exampleTag is cool');
    });

    // Test `exists` property
    test('should return true if tag exists in metadata cache', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.exists).toBe(true);
    });

    test('should return false if tag does not exist in metadata cache', () => {
        const metadataCacheMockEmpty: IMetadataCache = {
            cache: [],
        } as unknown as IMetadataCache;

        const dependenciesEmpty: IDIContainer = {
            register<T>(identifier: string, dependency: T): void {
                throw new Error('Method not implemented.');
            },
            resolve<T>(identifier: string, necessary = true): T {
                return metadataCacheMockEmpty as T;
            },
        };
        const tag = new Tag('exampleTag', dependenciesEmpty);
        expect(tag.exists).toBe(false);
    });

    test('should cache the existence check result', () => {
        const tag = new Tag('exampleTag', dependencies);
        // Initial call should set the _exists value
        expect(tag.exists).toBe(true);

        // Manually set the _exists property to undefined to simulate a cache reset
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tag as any)._exists = undefined;

        // Modify the cache to check if the cached value is used
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (metadataCacheMock as any).cache = [];
        expect(tag.exists).toBe(false);
    });

    // Test `tagWithHash` property
    test('should return tag with hash', () => {
        const tag = new Tag('exampleTag', dependencies);
        const tagWithHash = tag['tagWithHash'];
        expect(tagWithHash).toBe('#exampleTag');
    });

    // Test `getObsidianLink` method
    test('should return correct obsidian link', () => {
        const tag = new Tag('exampleTag', dependencies);
        const obsidianLink = tag.getObsidianLink();

        expect(obsidianLink.href.replace('http://localhost/', '')).toBe(
            '#exampleTag',
        );
        expect(obsidianLink.textContent).toBe('#exampleTag');
    });

    test('should return correct obsidian link with custom label', () => {
        const tag = new Tag('exampleTag', dependencies);
        const obsidianLink = tag.getObsidianLink('Custom Label');

        expect(obsidianLink.href.replace('http://localhost/', '')).toBe(
            '#exampleTag',
        );
        expect(obsidianLink.textContent).toBe('Custom Label');
    });

    // Test `startsWith` method
    test('should return true if tag starts with a specific substring', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.startsWith('example')).toBe(true);
    });

    test('should return false if tag does not start with a specific substring', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.startsWith('notInTag')).toBe(false);
    });

    test('should return true if tag starts with a specific substring at a specific position', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.startsWith('ample', 2)).toBe(true);
    });

    test('should return false if tag does not start with a specific substring at a specific position', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(tag.startsWith('ample', 3)).toBe(false);
    });

    // Test `getElements` method
    test('should return an array of elements from the tag', () => {
        const tag = new Tag('exampleTag/subtag', dependencies);
        expect(tag.getElements()).toEqual(['exampleTag', 'subtag']);
    });

    // Test `isInstanceOfTag` method
    test('should return true if object is instance of Tag', () => {
        const tag = new Tag('exampleTag', dependencies);
        expect(Tag.isInstanceOf(tag)).toBe(true);
    });

    test('should return false if object is not instance of Tag', () => {
        expect(Tag.isInstanceOf({})).toBe(false);
    });

    // Tests for `isTagAtHierarchyLevel` method

    test('should return true if the tag is directly below another tag at the specified hierarchy level', () => {
        const tag = new Tag('Tag1/Tag2', dependencies);
        const parentTag = new Tag('Tag1', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 1)).toBe(true);
    });

    test('should return false if the tag is not directly below another tag at the specified hierarchy level', () => {
        const tag = new Tag('Tag1/Tag2', dependencies);
        const parentTag = new Tag('Tag3', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 1)).toBe(false);
    });

    test('should return false if the tag is two levels below another tag when checking for one level', () => {
        const tag = new Tag('Tag1/Tag2/Tag3', dependencies);
        const parentTag = new Tag('Tag1', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 1)).toBe(false);
    });

    test('should return true if the tag is two levels below another tag when checking for two levels', () => {
        const tag = new Tag('Tag1/Tag2/Tag3', dependencies);
        const parentTag = new Tag('Tag1', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 2)).toBe(true);
    });

    test('should return false if the levels parameter is less than 1', () => {
        const tag = new Tag('Tag1/Tag2', dependencies);
        const parentTag = new Tag('Tag1', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 0)).toBe(false);
    });

    test('should return false if the levels parameter is greater than or equal to the number of elements in the tag', () => {
        const tag = new Tag('Tag1', dependencies);
        const parentTag = new Tag('Tag1', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 1)).toBe(false);
    });

    test('should return true if the tag is exactly the specified levels below another tag', () => {
        const tag = new Tag('Tag1/Tag2/Tag3', dependencies);
        const parentTag = new Tag('Tag1', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 2)).toBe(true);
    });

    test('should return false if the tag is not exactly the specified levels below another tag', () => {
        const tag = new Tag('Tag1/Tag2/Tag3/Tag4', dependencies);
        const parentTag = new Tag('Tag1', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 2)).toBe(false);
    });

    test('should return false if levels parameter is 0', () => {
        const tag = new Tag('Tag1/Tag2/Tag3', dependencies);
        const targetTag = new Tag('Tag3', dependencies);
        expect(tag.isTagAtHierarchyLevel(targetTag, 0)).toBe(false);
    });

    test('should return true if the tag is one level below another tag', () => {
        const tag = new Tag('Tag1/Tag2/Tag3', dependencies);
        const targetTag = new Tag('Tag2', dependencies);
        expect(tag.isTagAtHierarchyLevel(targetTag, 1)).toBe(true);
    });

    test('should return true if the tag is two levels below another tag', () => {
        const tag = new Tag('Tag1/Tag2/Tag3', dependencies);
        const targetTag = new Tag('Tag1', dependencies);
        expect(tag.isTagAtHierarchyLevel(targetTag, 2)).toBe(true);
    });

    test('should return true if the tag is directly below another tag at the specified hierarchy level', () => {
        const tag = new Tag('A/B/C/D', dependencies);
        const parentTag = new Tag('A/B/C', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 1)).toBe(true);
    });

    test('should return false if the tag is two levels below another tag when checking for one level', () => {
        const tag = new Tag('A/B/C/D/E', dependencies);
        const parentTag = new Tag('A/B/C', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 1)).toBe(false);
    });

    test('should return true if the tag is two levels below another tag when checking for two levels', () => {
        const tag = new Tag('A/B/C/D', dependencies);
        const parentTag = new Tag('A/B', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 2)).toBe(true);
    });

    test('should return false if the levels parameter is less than 1', () => {
        const tag = new Tag('A/B/C/D', dependencies);
        const parentTag = new Tag('A/B/C', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 0)).toBe(false);
    });

    test('should return false if the levels parameter is greater than or equal to the number of elements in the tag', () => {
        const tag = new Tag('A/B', dependencies);
        const parentTag = new Tag('A/B', dependencies);
        expect(tag.isTagAtHierarchyLevel(parentTag, 1)).toBe(false);
    });
});
