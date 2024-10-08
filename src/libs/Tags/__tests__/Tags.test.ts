import { TFile } from 'obsidian';
import MockLogger, { MockLogger_ } from 'src/__mocks__/ILogger.mock';
import IMetadataCache from 'src/interfaces/IMetadataCache';
import { TSinjex } from 'ts-injex';
import { ITag, ITag_ } from '../interfaces/ITag';
import { Tags } from '../Tags';

describe('Tags', () => {
    let mockMetadataCache: IMetadataCache;
    let MockTagClass: ITag_;

    beforeEach(() => {
        mockMetadataCache = {
            getEntry: jest.fn(),
        } as unknown as IMetadataCache;

        // Manuelle Erstellung der Mock-Klasse
        class MockTag implements ITag {
            value: string;
            metadataCache: IMetadataCache;

            constructor(value: string) {
                this.value = value;
            }
            [Symbol.toStringTag](): string {
                return this.value;
            }
            [Symbol.toPrimitive](
                hint?: 'string' | 'number' | 'default',
            ): string | string[] {
                return this.value;
            }
            [Symbol.hasInstance](obj: unknown): boolean {
                return obj instanceof MockTag;
            }
            isExisting: boolean;

            toString() {
                return this.value;
            }

            getElements() {
                return this.value.split('/');
            }

            equals(other: ITag) {
                return other.toString() === this.value;
            }

            startsWith(str: string) {
                return this.value.startsWith(str);
            }

            static isInstanceOf(obj: unknown): obj is ITag {
                return obj instanceof MockTag;
            }

            primitiveOf(): string {
                return this.value;
            }

            get tagWithHash(): string {
                throw new Error('Method not implemented.');
            }

            toUpperCase(): string {
                throw new Error('Method not implemented.');
            }

            toLowerCase(): string {
                throw new Error('Method not implemented.');
            }

            charAt(index: number): string {
                throw new Error('Method not implemented.');
            }

            includes(substring: string): boolean {
                return this.value.includes(substring);
            }

            isTagAtHierarchyLevel(tag: ITag, levels = 1): boolean {
                const thisElements = this.getElements();
                const tagElements = tag.getElements();

                // Check if the hierarchy level is valid
                if (levels < 1) {
                    return false;
                }

                // Check if the number of elements in the tag is sufficient for the comparison
                if (tagElements.length + levels > thisElements.length) {
                    return false;
                }

                // Compare the relevant parts of the hierarchy
                const start = thisElements.length - levels - tagElements.length;

                for (let i = 0; i < tagElements.length; i++) {
                    if (thisElements[start + i] !== tagElements[i]) {
                        return false;
                    }
                }

                return true;
            }

            getObsidianLink(tagLabel?: string): HTMLAnchorElement {
                throw new Error('Method not implemented.');
            }
        }

        MockTagClass = MockTag as unknown as ITag_;

        TSinjex.getInstance().register('IMetadataCache', mockMetadataCache);
        TSinjex.getInstance().register('ITag_', MockTagClass);
        TSinjex.getInstance().register('ILogger_', MockLogger_);
    });

    // Constructor Tests
    test('should initialize with no tags and no logger', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(undefined);
        expect(tagsArray.primitiveOf()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    test('should initialize with a single tag', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags('tag1');
        expect(tagsArray.primitiveOf()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
    });

    test('should initialize with an array of tags', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1', 'tag2']);
        expect(tagsArray.primitiveOf()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should initialize with undefined tags', () => {
        const tagsArray = new Tags(undefined);
        expect(tagsArray.primitiveOf()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    // Method Tests
    test('should add a single tag that does not exist', () => {
        const tagsArray = new Tags([]);
        tagsArray.add('tag1');
        expect(tagsArray.primitiveOf()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
    });

    test('should not add a single tag that already exists', () => {
        const tagsArray = new Tags(['tag1']);
        tagsArray.add('tag1');
        expect(tagsArray.primitiveOf()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);

        expect(MockLogger.warn).toHaveBeenCalledWith(
            "Tag 'tag1' already exists.",
        );
    });

    test('should add multiple tags', () => {
        const tagsArray = new Tags([]);
        tagsArray.add(['tag1', 'tag2']);
        expect(tagsArray.primitiveOf()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should not add existing tags when adding multiple tags', () => {
        const tagsArray = new Tags(['tag1']);
        tagsArray.add(['tag1', 'tag2']);
        expect(tagsArray.primitiveOf()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);

        expect(MockLogger.warn).toHaveBeenCalledWith(
            "Tag 'tag1' already exists.",
        );
    });

    test('should log a warning when adding undefined tags', () => {
        const tagsArray = new Tags([]);
        tagsArray.add(undefined);
        expect(MockLogger.trace).toHaveBeenCalledWith('No tags added.');
    });

    test('should remove an existing tag', () => {
        const tagsArray = new Tags(['tag1']);
        tagsArray.remove(tagsArray.value[0]);
        expect(tagsArray.primitiveOf()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    test('should log a warning when removing a non-existing tag', () => {
        const tagsArray = new Tags(['tag1']);

        const nonExistingTag = new MockTagClass('tag2');
        tagsArray.remove(nonExistingTag);
        expect(tagsArray.primitiveOf()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        expect(MockLogger.warn).toHaveBeenCalledWith("Tag 'tag2' not found.");
    });

    test('should return all tags', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1', 'tag2']);
        expect(tagsArray.primitiveOf()).toEqual(['tag1', 'tag2']);
    });

    test('should return all tags as a comma-separated string', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1', 'tag2']);
        expect(tagsArray.toString()).toBe('tag1, tag2');
    });

    test('should return the correct number of tags', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should iterate over all tags', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1', 'tag2']);
        const tags: string[] = [];

        for (const tag of tagsArray) {
            tags.push(tag.toString());
        }
        expect(tags).toEqual(['tag1', 'tag2']);
    });

    // Additional Tests
    test('should not add duplicate tags when initialized with an array containing duplicates', () => {
        const tagsArray = new Tags(['tag1', 'tag1', 'tag2']);
        expect(tagsArray.primitiveOf()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should handle removing a tag from an empty array gracefully', () => {
        const tagsArray = new Tags([]);

        const tagToRemove = new MockTagClass('tag1');
        tagsArray.remove(tagToRemove);
        expect(tagsArray.primitiveOf()).toEqual([]);
        expect(tagsArray.length).toBe(0);
        expect(MockLogger.warn).toHaveBeenCalledWith("Tag 'tag1' not found.");
    });

    test('should not log when adding a tag without a logger', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1']);
        tagsArray.add('tag1');
        expect(tagsArray.primitiveOf()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        // Since no logger is provided, there should be no logs
    });

    test('should not log when removing a non-existing tag without a logger', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1']);

        const nonExistingTag = new MockTagClass('tag2');
        tagsArray.remove(nonExistingTag);
        expect(tagsArray.primitiveOf()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        // Since no logger is provided, there should be no logs
    });

    // Tests for specificTags property
    test('should return specific tags', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1', 'tag1/subtag1', 'tag2']);

        expect(tagsArray.specificTags.map((tag) => tag.toString())).toEqual([
            'tag1/subtag1',
            'tag2',
        ]);
    });

    // Tests for getTagTree method
    test('should return tag tree', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1', 'tag1/subtag1', 'tag2']);

        const expectedTree = {
            tag1: {
                subtag1: {},
            },
            tag2: {},
        };
        expect(tagsArray.getTagTree()).toEqual(expectedTree);
    });

    // Tests for loadTagsFromFile method
    test('should load tags from file', () => {
        const mockFile = { path: 'test.md' } as TFile;

        mockMetadataCache.getEntry = jest.fn().mockReturnValue({
            metadata: {
                frontmatter: {
                    tags: ['tag1', 'tag2'],
                },
            },
        });

        const tagsArray = new Tags([]);
        const result = tagsArray.loadTagsFromFile(mockFile);
        expect(result).toBe(true);
        expect(tagsArray.primitiveOf()).toEqual(['tag1', 'tag2']);
    });

    test('should log warning if no metadata in file', () => {
        const mockFile = { path: 'test.md' } as TFile;
        mockMetadataCache.getEntry = jest.fn().mockReturnValue(null);

        const tagsArray = new Tags([]);
        const result = tagsArray.loadTagsFromFile(mockFile);
        expect(result).toBe(false);
        expect(tagsArray.primitiveOf()).toEqual([]);

        expect(MockLogger.warn).toHaveBeenCalledWith(
            'No metadata found in the file.',
        );
    });

    test('should log warning if no file provided', () => {
        const tagsArray = new Tags([]);
        const result = tagsArray.loadTagsFromFile(undefined);
        expect(result).toBe(false);
        expect(tagsArray.primitiveOf()).toEqual([]);
        expect(MockLogger.warn).toHaveBeenCalledWith('No file provided.');
    });

    // Test `first()` and `last()` methods
    test('should return the first tag', () => {
        const tagsArray = new Tags(['tag1', 'tag2']);
        expect(tagsArray.first()?.toString()).toBe('tag1');
    });

    test('should return undefined as first tag', () => {
        const tagsArray = new Tags(undefined);
        expect(tagsArray.first()).toBe(undefined);
    });

    test('should return the last tag', () => {
        const tagsArray = new Tags(['tag1', 'tag2']);
        expect(tagsArray.last()?.toString()).toBe('tag2');
    });

    test('should return undefined as last tag', () => {
        const tagsArray = new Tags(undefined);
        expect(tagsArray.last()).toBe(undefined);
    });

    test('should return true when tag exists in the tags array', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1', 'tag2']);
        const tagToCheck = new MockTagClass('tag1');
        expect(tagsArray.includes(tagToCheck)).toBe(true);
    });

    // Test when a single tag exists in the tags array
    test('should return true when a single tag exists in the tags array', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1']);
        const tagToCheck = new MockTagClass('tag1');
        expect(tagsArray.includes(tagToCheck)).toBe(true);
    });

    // Test when a single tag does not exist in the tags array
    test('should return false when a single tag does not exist in the tags array', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1']);
        const tagToCheck = new MockTagClass('tag2');
        expect(tagsArray.includes(tagToCheck)).toBe(false);
    });

    // Test when the tag partially matches an existing tag
    test('should return true when a tag partially matches an existing tag', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1/part']);
        const tagToCheck = new MockTagClass('tag1');
        expect(tagsArray.includes(tagToCheck)).toBe(false);
    });

    // Test when the tag does not match any part of existing tags
    test('should return false when the tag does not match any part of existing tags', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags(['tag1/part']);
        const tagToCheck = new MockTagClass('tag2');
        expect(tagsArray.includes(tagToCheck)).toBe(false);
    });

    // Test when the tag array is empty
    test('should return false when the tags array is empty', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const tagsArray = new Tags([]);
        const tagToCheck = new MockTagClass('tag1');
        expect(tagsArray.includes(tagToCheck)).toBe(false);
    });

    // Test when checking a complex tag that contains multiple tags
    test('should return true when all tags in a complex tag exist in the tags array', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const complexTag = new Tags(['tag1', 'tag2']);
        const tagsArray = new Tags(['tag1', 'tag2']);
        expect(tagsArray.includes(complexTag)).toBe(true);
    });

    // Test when checking a complex tag where not all tags exist in the tags array
    test('should return false when not all tags in a complex tag exist in the tags array', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const complexTag = new Tags(['tag1', 'tag2']);
        const tagsArray = new Tags(['tag1']);
        expect(tagsArray.includes(complexTag)).toBe(false);
    });

    // Test when checking a complex tag with empty tags array
    test('should return false when checking a complex tag with an empty tags array', () => {
        TSinjex.getInstance().register('ILogger_', undefined);

        const complexTag = new Tags(['tag1', 'tag2']);
        const tagsArray = new Tags([]);
        expect(tagsArray.includes(complexTag)).toBe(false);
    });

    // Tests for contains method
    test('should return true if any tag in the given tags is a substring of any tag in the instance', () => {
        const tagsArray = new Tags(['tag1/part1', 'tag2']);
        const tagsToCheck = new Tags(['part1']);
        expect(tagsArray.contains(tagsToCheck)).toBe(true);
    });

    test('should return false if no tag in the given tags is a substring of any tag in the instance', () => {
        const tagsArray = new Tags(['tag1/part1', 'tag2']);
        const tagsToCheck = new Tags(['part2']);
        expect(tagsArray.contains(tagsToCheck)).toBe(false);
    });

    test('should return true if multiple tags in the given tags are substrings of any tag in the instance', () => {
        const tagsArray = new Tags(['tag1/part1', 'tag2/part2']);
        const tagsToCheck = new Tags(['part1', 'part2']);
        expect(tagsArray.contains(tagsToCheck)).toBe(true);
    });

    test('should return true if a tag in the given tags is a substring of a tag in the instance', () => {
        const tagsArray = new Tags(['tag1/part1']);
        const tagsToCheck = new Tags(['tag1']);
        expect(tagsArray.contains(tagsToCheck)).toBe(true);
    });

    test('should return false if the tags array is empty', () => {
        const tagsArray = new Tags([]);
        const tagsToCheck = new Tags(['tag1']);
        expect(tagsArray.contains(tagsToCheck)).toBe(false);
    });

    test('should return false if the given tags are empty', () => {
        const tagsArray = new Tags(['tag1']);
        const tagsToCheck = new Tags([]);
        expect(tagsArray.contains(tagsToCheck)).toBe(false);
    });

    test('should return false if both the instance and given tags arrays are empty', () => {
        const tagsArray = new Tags([]);
        const tagsToCheck = new Tags([]);
        expect(tagsArray.contains(tagsToCheck)).toBe(false);
    });

    // Tests for `areTagsAtHierarchyLevel` method
    test('should return true if a tag in the given tags is directly below a tag in the instance', () => {
        const tagsArray = new Tags(['Tag1/Tag2']);
        const tagsToCheck = new Tags(['Tag1']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck)).toBe(true);
    });

    test('should return false if no tag in the given tags is directly below a tag in the instance', () => {
        const tagsArray = new Tags(['Tag1/Tag2']);
        const tagsToCheck = new Tags(['Tag3']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck)).toBe(false);
    });

    test('should return false if a tag in the given tags is two levels below a tag in the instance', () => {
        const tagsArray = new Tags(['Tag1/Tag2/Tag3']);
        const tagsToCheck = new Tags(['Tag1']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck)).toBe(false);
    });

    test('should return true if multiple tags in the given tags are directly below tags in the instance', () => {
        const tagsArray = new Tags(['Tag1/Tag2', 'Tag3/Tag4']);
        const tagsToCheck = new Tags(['Tag1', 'Tag3']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck)).toBe(true);
    });

    test('should return false if the instance tags array is empty', () => {
        const tagsArray = new Tags([]);
        const tagsToCheck = new Tags(['Tag1']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck)).toBe(false);
    });

    test('should return false if the given tags array is empty', () => {
        const tagsArray = new Tags(['Tag1/Tag2']);
        const tagsToCheck = new Tags([]);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck)).toBe(false);
    });

    test('should return false if both the instance and given tags arrays are empty', () => {
        const tagsArray = new Tags([]);
        const tagsToCheck = new Tags([]);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck)).toBe(false);
    });

    test('should return true if a tag in the given tags matches exactly with a tag in the instance at the next hierarchy level', () => {
        const tagsArray = new Tags(['Tag1/Tag2']);
        const tagsToCheck = new Tags(['Tag1']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck)).toBe(true);
    });

    test('should return false if a tag in the given tags is a substring but not at the next hierarchy level', () => {
        const tagsArray = new Tags(['Tag1/Tag2/Tag3']);
        const tagsToCheck = new Tags(['Tag1']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck)).toBe(false);
    });

    test('should return true if any tag in the given tags is directly below a tag in the instance with special characters', () => {
        const tagsArray = new Tags(['Tag1/Tag-2']);
        const tagsToCheck = new Tags(['Tag1']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck)).toBe(true);
    });

    test('should return true if any tag is directly below another tag at the specified hierarchy level', () => {
        const tagsArray = new Tags(['Tag1/Tag2', 'Tag3/Tag4']);
        const tagsToCheck = new Tags(['Tag1', 'Tag3']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck, 1)).toBe(true);
    });

    test('should return false if no tag is directly below another tag at the specified hierarchy level', () => {
        const tagsArray = new Tags(['Tag1/Tag2', 'Tag3/Tag4']);
        const tagsToCheck = new Tags(['Tag5']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck, 1)).toBe(false);
    });

    test('should return true if any tag is two levels below another tag when checking for two levels', () => {
        const tagsArray = new Tags(['Tag1/Tag2/Tag3', 'Tag4/Tag5/Tag6']);
        const tagsToCheck = new Tags(['Tag1', 'Tag4']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck, 2)).toBe(true);
    });

    test('should return false if no tag is two levels below another tag when checking for two levels', () => {
        const tagsArray = new Tags(['Tag1/Tag2', 'Tag3/Tag4']);
        const tagsToCheck = new Tags(['Tag1', 'Tag3']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck, 2)).toBe(false);
    });

    test('should return false if levels parameter is 0', () => {
        const tagsArray = new Tags(['Tag1/Tag2/Tag3']);
        const tagsToCheck = new Tags(['Tag3']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck, 0)).toBe(false);
    });

    test('should return false if levels parameter is greater than or equal to the number of elements in the tag', () => {
        const tagsArray = new Tags(['Tag1']);
        const tagsToCheck = new Tags(['Tag1']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck, 1)).toBe(false);
    });

    test('should return true if any tag is exactly the specified levels below another tag', () => {
        const tagsArray = new Tags(['Tag1/Tag2/Tag3', 'Tag4/Tag5/Tag6']);
        const tagsToCheck = new Tags(['Tag1', 'Tag4']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck, 2)).toBe(true);
    });

    test('should return false if no tag is exactly the specified levels below another tag', () => {
        const tagsArray = new Tags(['Tag1/Tag2/Tag3/Tag4']);
        const tagsToCheck = new Tags(['Tag1']);
        expect(tagsArray.areTagsAtHierarchyLevel(tagsToCheck, 2)).toBe(false);
    });
});
