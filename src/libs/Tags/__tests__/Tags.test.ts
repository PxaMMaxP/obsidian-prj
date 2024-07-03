import { ILogger } from 'src/interfaces/ILogger';
import IMetadataCache from 'src/interfaces/IMetadataCache';

import { Tags } from '../Tags';
import { ITagFactory } from '../interfaces/ITagFactory';
import { ITag } from '../interfaces/ITag';
import { TFile } from 'obsidian';

describe('Tags', () => {
    let mockLogger: ILogger;
    let mockMetadataCache: IMetadataCache;
    let mockTagFactory: ITagFactory;

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

        mockTagFactory = {
            create: jest.fn((tag: string, metadataCache: IMetadataCache) => ({
                value: tag,
                toString: () => tag,
                getElements: () => tag.split('/'),
                equals: (other: ITag) => other.toString() === tag,
                isInstanceOfTag: (obj: unknown) => obj instanceof Tags,
                startsWith: (str: string) => tag.startsWith(str),
            })),
        } as unknown as ITagFactory;
    });

    // Constructor Tests
    test('should initialize with no tags and no logger', () => {
        const tagsArray = new Tags(
            undefined,
            mockMetadataCache,
            mockTagFactory,
        );
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    test('should initialize with a single tag', () => {
        const tagsArray = new Tags('tag1', mockMetadataCache, mockTagFactory);
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
    });

    test('should initialize with an array of tags', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag2'],
            mockMetadataCache,
            mockTagFactory,
        );
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should initialize with undefined tags', () => {
        const tagsArray = new Tags(
            undefined,
            mockMetadataCache,
            mockTagFactory,
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
            mockTagFactory,
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
            mockTagFactory,
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
            mockTagFactory,
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
            mockTagFactory,
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
            mockTagFactory,
            mockLogger,
        );
        tagsArray.add(undefined);
        expect(mockLogger.warn).toHaveBeenCalledWith('No tags added.');
    });

    test('should remove an existing tag', () => {
        const tagsArray = new Tags(
            ['tag1'],
            mockMetadataCache,
            mockTagFactory,
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
            mockTagFactory,
            mockLogger,
        );
        const nonExistingTag = mockTagFactory.create('tag2', mockMetadataCache);
        tagsArray.remove(nonExistingTag);
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        expect(mockLogger.warn).toHaveBeenCalledWith("Tag 'tag2' not found.");
    });

    test('should return all tags', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag2'],
            mockMetadataCache,
            mockTagFactory,
        );
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
    });

    test('should return all tags as a comma-separated string', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag2'],
            mockMetadataCache,
            mockTagFactory,
        );
        expect(tagsArray.toString()).toBe('tag1, tag2');
    });

    test('should return the correct number of tags', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag2'],
            mockMetadataCache,
            mockTagFactory,
        );
        expect(tagsArray.length).toBe(2);
    });

    test('should iterate over all tags', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag2'],
            mockMetadataCache,
            mockTagFactory,
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
            mockTagFactory,
            mockLogger,
        );
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should handle removing a tag from an empty array gracefully', () => {
        const tagsArray = new Tags(
            [],
            mockMetadataCache,
            mockTagFactory,
            mockLogger,
        );
        const tagToRemove = mockTagFactory.create('tag1', mockMetadataCache);
        tagsArray.remove(tagToRemove);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(tagsArray.length).toBe(0);
        expect(mockLogger.warn).toHaveBeenCalledWith("Tag 'tag1' not found.");
    });

    test('should not log when adding a tag without a logger', () => {
        const tagsArray = new Tags(['tag1'], mockMetadataCache, mockTagFactory);
        tagsArray.add('tag1');
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        // Since no logger is provided, there should be no logs
    });

    test('should not log when removing a non-existing tag without a logger', () => {
        const tagsArray = new Tags(['tag1'], mockMetadataCache, mockTagFactory);
        const nonExistingTag = mockTagFactory.create('tag2', mockMetadataCache);
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
            mockTagFactory,
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
            mockTagFactory,
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
            mockTagFactory,
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
            mockTagFactory,
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
            mockTagFactory,
            mockLogger,
        );
        const result = tagsArray.loadTagsFromFile(undefined);
        expect(result).toBe(false);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(mockLogger.warn).toHaveBeenCalledWith('No file provided.');
    });
});
