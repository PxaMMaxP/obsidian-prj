import { TFile } from 'obsidian';
import BaseTypeChecker from 'src/classes/BaseTypeChecker';
import { ILogger } from 'src/interfaces/ILogger';
import IMetadataCache from 'src/interfaces/IMetadataCache';
import { ITag, ITagConstructor } from '../interfaces/ITag';
import { Tags } from '../Tags';

describe('Tags', () => {
    let mockLogger: ILogger;
    let mockMetadataCache: IMetadataCache;
    let MockTagClass: typeof BaseTypeChecker & ITagConstructor;

    beforeEach(() => {
        mockLogger = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            debug: jest.fn(),
        };

        mockMetadataCache = {
            getEntry: jest.fn(),
        } as unknown as IMetadataCache;

        // Manuelle Erstellung der Mock-Klasse
        class MockTag implements ITag {
            value: string;
            metadataCache: IMetadataCache;

            constructor(value: string, metadataCache: IMetadataCache) {
                this.value = value;
                this.metadataCache = metadataCache;
            }
            exists: boolean;

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

            valueOf(): string {
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
                throw new Error('Method not implemented.');
            }

            getObsidianLink(tagLabel?: string): HTMLAnchorElement {
                throw new Error('Method not implemented.');
            }
        }

        MockTagClass = MockTag as unknown as typeof BaseTypeChecker &
            ITagConstructor;
    });

    // Constructor Tests
    test('should initialize with no tags and no logger', () => {
        const tagsArray = new Tags(undefined, mockMetadataCache, MockTagClass);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    test('should initialize with a single tag', () => {
        const tagsArray = new Tags('tag1', mockMetadataCache, MockTagClass);
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
    });

    test('should initialize with an array of tags', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag2'],
            mockMetadataCache,
            MockTagClass,
        );
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should initialize with undefined tags', () => {
        const tagsArray = new Tags(
            undefined,
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    // Method Tests
    test('should add a single tag that does not exist', () => {
        const tagsArray = new Tags(
            [],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        tagsArray.add('tag1');
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
    });

    test('should not add a single tag that already exists', () => {
        const tagsArray = new Tags(
            ['tag1'],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        tagsArray.add('tag1');
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);

        expect(mockLogger.warn).toHaveBeenCalledWith(
            "Tag 'tag1' already exists.",
        );
    });

    test('should add multiple tags', () => {
        const tagsArray = new Tags(
            [],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        tagsArray.add(['tag1', 'tag2']);
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should not add existing tags when adding multiple tags', () => {
        const tagsArray = new Tags(
            ['tag1'],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        tagsArray.add(['tag1', 'tag2']);
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);

        expect(mockLogger.warn).toHaveBeenCalledWith(
            "Tag 'tag1' already exists.",
        );
    });

    test('should log a warning when adding undefined tags', () => {
        const tagsArray = new Tags(
            [],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        tagsArray.add(undefined);
        expect(mockLogger.warn).toHaveBeenCalledWith('No tags added.');
    });

    test('should remove an existing tag', () => {
        const tagsArray = new Tags(
            ['tag1'],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        tagsArray.remove(tagsArray.values[0]);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    test('should log a warning when removing a non-existing tag', () => {
        const tagsArray = new Tags(
            ['tag1'],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );

        const nonExistingTag = new (MockTagClass as ITagConstructor)(
            'tag2',
            mockMetadataCache,
        );
        tagsArray.remove(nonExistingTag);
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        expect(mockLogger.warn).toHaveBeenCalledWith("Tag 'tag2' not found.");
    });

    test('should return all tags', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag2'],
            mockMetadataCache,
            MockTagClass,
        );
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
    });

    test('should return all tags as a comma-separated string', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag2'],
            mockMetadataCache,
            MockTagClass,
        );
        expect(tagsArray.toString()).toBe('tag1, tag2');
    });

    test('should return the correct number of tags', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag2'],
            mockMetadataCache,
            MockTagClass,
        );
        expect(tagsArray.length).toBe(2);
    });

    test('should iterate over all tags', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag2'],
            mockMetadataCache,
            MockTagClass,
        );
        const tags: string[] = [];

        for (const tag of tagsArray) {
            tags.push(tag.toString());
        }
        expect(tags).toEqual(['tag1', 'tag2']);
    });

    // Additional Tests
    test('should not add duplicate tags when initialized with an array containing duplicates', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag1', 'tag2'],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should handle removing a tag from an empty array gracefully', () => {
        const tagsArray = new Tags(
            [],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );

        const tagToRemove = new (MockTagClass as ITagConstructor)(
            'tag1',
            mockMetadataCache,
        );
        tagsArray.remove(tagToRemove);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(tagsArray.length).toBe(0);
        expect(mockLogger.warn).toHaveBeenCalledWith("Tag 'tag1' not found.");
    });

    test('should not log when adding a tag without a logger', () => {
        const tagsArray = new Tags(['tag1'], mockMetadataCache, MockTagClass);
        tagsArray.add('tag1');
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        // Since no logger is provided, there should be no logs
    });

    test('should not log when removing a non-existing tag without a logger', () => {
        const tagsArray = new Tags(['tag1'], mockMetadataCache, MockTagClass);

        const nonExistingTag = new (MockTagClass as ITagConstructor)(
            'tag2',
            mockMetadataCache,
        );
        tagsArray.remove(nonExistingTag);
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        // Since no logger is provided, there should be no logs
    });

    // Tests for specificTags property
    test('should return specific tags', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag1/subtag1', 'tag2'],
            mockMetadataCache,
            MockTagClass,
        );

        expect(tagsArray.specificTags.map((tag) => tag.toString())).toEqual([
            'tag1/subtag1',
            'tag2',
        ]);
    });

    // Tests for getTagTree method
    test('should return tag tree', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag1/subtag1', 'tag2'],
            mockMetadataCache,
            MockTagClass,
        );

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

        const tagsArray = new Tags(
            [],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        const result = tagsArray.loadTagsFromFile(mockFile);
        expect(result).toBe(true);
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
    });

    test('should log warning if no metadata in file', () => {
        const mockFile = { path: 'test.md' } as TFile;
        mockMetadataCache.getEntry = jest.fn().mockReturnValue(null);

        const tagsArray = new Tags(
            [],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        const result = tagsArray.loadTagsFromFile(mockFile);
        expect(result).toBe(false);
        expect(tagsArray.toStringArray()).toEqual([]);

        expect(mockLogger.warn).toHaveBeenCalledWith(
            'No metadata found in the file.',
        );
    });

    test('should log warning if no file provided', () => {
        const tagsArray = new Tags(
            [],
            mockMetadataCache,
            MockTagClass,
            mockLogger,
        );
        const result = tagsArray.loadTagsFromFile(undefined);
        expect(result).toBe(false);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(mockLogger.warn).toHaveBeenCalledWith('No file provided.');
    });
});
