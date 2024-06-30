import { ILogger } from 'src/interfaces/ILogger';
import { TagsArray } from '../TagsArray';

describe('TagsArray', () => {
    let mockLogger: ILogger;

    beforeEach(() => {
        mockLogger = {
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            trace: jest.fn(),
            debug: jest.fn(),
        };
    });

    // Constructor Tests
    test('should initialize with no tags and no logger', () => {
        const tagsArray = new TagsArray();
        expect(tagsArray.getAll()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    test('should initialize with a single tag', () => {
        const tagsArray = new TagsArray('tag1');
        expect(tagsArray.getAll()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
    });

    test('should initialize with an array of tags', () => {
        const tagsArray = new TagsArray(['tag1', 'tag2']);
        expect(tagsArray.getAll()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should initialize with undefined tags', () => {
        const tagsArray = new TagsArray(undefined, mockLogger);
        expect(tagsArray.getAll()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    // Method Tests
    test('should add a single tag that does not exist', () => {
        const tagsArray = new TagsArray([], mockLogger);
        tagsArray.add('tag1');
        expect(tagsArray.getAll()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
    });

    test('should not add a single tag that already exists', () => {
        const tagsArray = new TagsArray(['tag1'], mockLogger);
        tagsArray.add('tag1');
        expect(tagsArray.getAll()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);

        expect(mockLogger.warn).toHaveBeenCalledWith(
            "Tag 'tag1' already exists.",
        );
    });

    test('should add multiple tags', () => {
        const tagsArray = new TagsArray([], mockLogger);
        tagsArray.add(['tag1', 'tag2']);
        expect(tagsArray.getAll()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should not add existing tags when adding multiple tags', () => {
        const tagsArray = new TagsArray(['tag1'], mockLogger);
        tagsArray.add(['tag1', 'tag2']);
        expect(tagsArray.getAll()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);

        expect(mockLogger.warn).toHaveBeenCalledWith(
            "Tag 'tag1' already exists.",
        );
    });

    test('should log a warning when adding undefined tags', () => {
        const tagsArray = new TagsArray([], mockLogger);
        tagsArray.add(undefined);
        expect(mockLogger.warn).toHaveBeenCalledWith('No tags to add.');
    });

    test('should remove an existing tag', () => {
        const tagsArray = new TagsArray(['tag1'], mockLogger);
        tagsArray.remove('tag1');
        expect(tagsArray.getAll()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    test('should log a warning when removing a non-existing tag', () => {
        const tagsArray = new TagsArray(['tag1'], mockLogger);
        tagsArray.remove('tag2');
        expect(tagsArray.getAll()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        expect(mockLogger.warn).toHaveBeenCalledWith("Tag 'tag2' not found.");
    });

    test('should return all tags', () => {
        const tagsArray = new TagsArray(['tag1', 'tag2']);
        expect(tagsArray.getAll()).toEqual(['tag1', 'tag2']);
    });

    test('should return all tags as a comma-separated string', () => {
        const tagsArray = new TagsArray(['tag1', 'tag2']);
        expect(tagsArray.toString()).toBe('tag1, tag2');
    });

    test('should return the correct number of tags', () => {
        const tagsArray = new TagsArray(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should iterate over all tags', () => {
        const tagsArray = new TagsArray(['tag1', 'tag2']);
        const tags: string[] = [];

        for (const tag of tagsArray) {
            tags.push(tag);
        }
        expect(tags).toEqual(['tag1', 'tag2']);
    });

    // Additional Tests
    test('should not add duplicate tags when initialized with an array containing duplicates', () => {
        const tagsArray = new TagsArray(['tag1', 'tag1', 'tag2'], mockLogger);
        expect(tagsArray.getAll()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should handle removing a tag from an empty array gracefully', () => {
        const tagsArray = new TagsArray([], mockLogger);
        tagsArray.remove('tag1');
        expect(tagsArray.getAll()).toEqual([]);
        expect(tagsArray.length).toBe(0);
        expect(mockLogger.warn).toHaveBeenCalledWith("Tag 'tag1' not found.");
    });

    test('should not log when adding a tag without a logger', () => {
        const tagsArray = new TagsArray(['tag1']);
        tagsArray.add('tag1');
        expect(tagsArray.getAll()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        // Since no logger is provided, there should be no logs
    });

    test('should not log when removing a non-existing tag without a logger', () => {
        const tagsArray = new TagsArray(['tag1']);
        tagsArray.remove('tag2');
        expect(tagsArray.getAll()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        // Since no logger is provided, there should be no logs
    });
});
