import { TFile } from 'obsidian';
import MockLogger, { MockLogger_ } from 'src/__mocks__/ILogger.mock';
import IMetadataCache from 'src/interfaces/IMetadataCache';
import BaseComplexDataType from 'src/libs/BaseComplexDataType/BaseComplexDataType';
import {
    IBaseComplexDataType,
    IBaseComplexDataTypeSymbol,
} from 'src/libs/BaseComplexDataType/interfaces/IBaseComplexDataType';
import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { ITag, ITag_ } from '../interfaces/ITag';
import { Tags } from '../Tags';

describe('Tags', () => {
    let mockMetadataCache: IMetadataCache;
    let MockTagClass: ITag_;
    let dependencies: IDIContainer;
    let dependenciesWithoutLogger: IDIContainer;

    beforeEach(() => {
        mockMetadataCache = {
            getEntry: jest.fn(),
        } as unknown as IMetadataCache;

        // Manuelle Erstellung der Mock-Klasse
        class MockTag implements ITag, IBaseComplexDataType {
            value: string;
            metadataCache: IMetadataCache;

            constructor(value: string, metadataCache: IMetadataCache) {
                this.value = value;
                this.metadataCache = metadataCache;
            }
            [IBaseComplexDataTypeSymbol] = true;
            getFrontmatterObject():
                | Record<string, unknown>
                | Array<unknown>
                | string
                | null
                | undefined {
                throw new Error('Method not implemented.');
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

        MockTagClass = MockTag as unknown as typeof BaseComplexDataType & ITag_;

        dependencies = {
            register<T>(identifier: string, dependency: T): void {
                throw new Error('Method not implemented.');
            },
            resolve<T>(identifier: string): T {
                let dependency: T;

                switch (identifier) {
                    case 'IMetadataCache':
                        dependency = mockMetadataCache as unknown as T;
                        break;
                    case 'ITag':
                        dependency = MockTagClass as unknown as T;
                        break;
                    case 'ILogger_':
                        dependency = MockLogger_ as unknown as T;
                        break;
                    default:
                        throw new Error(`Dependency ${identifier} not found`);
                }

                return dependency as T;
            },
        };

        dependenciesWithoutLogger = {
            register<T>(identifier: string, dependency: T): void {
                throw new Error('Method not implemented.');
            },
            resolve<T>(identifier: string): T {
                let dependency: T;

                switch (identifier) {
                    case 'IMetadataCache':
                        dependency = mockMetadataCache as unknown as T;
                        break;
                    case 'ITag':
                        dependency = MockTagClass as unknown as T;
                        break;
                    case 'ILogger_':
                        dependency = undefined as unknown as T;
                        break;
                    default:
                        throw new Error(`Dependency ${identifier} not found`);
                }

                return dependency as T;
            },
        };
    });

    // Constructor Tests
    test('should initialize with no tags and no logger', () => {
        const tagsArray = new Tags(undefined, dependenciesWithoutLogger);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    test('should initialize with a single tag', () => {
        const tagsArray = new Tags('tag1', dependenciesWithoutLogger);
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
    });

    test('should initialize with an array of tags', () => {
        const tagsArray = new Tags(['tag1', 'tag2'], dependenciesWithoutLogger);
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should initialize with undefined tags', () => {
        const tagsArray = new Tags(undefined, dependencies);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    // Method Tests
    test('should add a single tag that does not exist', () => {
        const tagsArray = new Tags([], dependencies);
        tagsArray.add('tag1');
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
    });

    test('should not add a single tag that already exists', () => {
        const tagsArray = new Tags(['tag1'], dependencies);
        tagsArray.add('tag1');
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);

        expect(MockLogger.warn).toHaveBeenCalledWith(
            "Tag 'tag1' already exists.",
        );
    });

    test('should add multiple tags', () => {
        const tagsArray = new Tags([], dependencies);
        tagsArray.add(['tag1', 'tag2']);
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should not add existing tags when adding multiple tags', () => {
        const tagsArray = new Tags(['tag1'], dependencies);
        tagsArray.add(['tag1', 'tag2']);
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);

        expect(MockLogger.warn).toHaveBeenCalledWith(
            "Tag 'tag1' already exists.",
        );
    });

    test('should log a warning when adding undefined tags', () => {
        const tagsArray = new Tags([], dependencies);
        tagsArray.add(undefined);
        expect(MockLogger.warn).toHaveBeenCalledWith('No tags added.');
    });

    test('should remove an existing tag', () => {
        const tagsArray = new Tags(['tag1'], dependencies);
        tagsArray.remove(tagsArray.values[0]);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(tagsArray.length).toBe(0);
    });

    test('should log a warning when removing a non-existing tag', () => {
        const tagsArray = new Tags(['tag1'], dependencies);

        const nonExistingTag = new MockTagClass('tag2', dependencies);
        tagsArray.remove(nonExistingTag);
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        expect(MockLogger.warn).toHaveBeenCalledWith("Tag 'tag2' not found.");
    });

    test('should return all tags', () => {
        const tagsArray = new Tags(['tag1', 'tag2'], dependenciesWithoutLogger);
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
    });

    test('should return all tags as a comma-separated string', () => {
        const tagsArray = new Tags(['tag1', 'tag2'], dependenciesWithoutLogger);
        expect(tagsArray.toString()).toBe('tag1, tag2');
    });

    test('should return the correct number of tags', () => {
        const tagsArray = new Tags(['tag1', 'tag2'], dependenciesWithoutLogger);
        expect(tagsArray.length).toBe(2);
    });

    test('should iterate over all tags', () => {
        const tagsArray = new Tags(['tag1', 'tag2'], dependenciesWithoutLogger);
        const tags: string[] = [];

        for (const tag of tagsArray) {
            tags.push(tag.toString());
        }
        expect(tags).toEqual(['tag1', 'tag2']);
    });

    // Additional Tests
    test('should not add duplicate tags when initialized with an array containing duplicates', () => {
        const tagsArray = new Tags(['tag1', 'tag1', 'tag2'], dependencies);
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
        expect(tagsArray.length).toBe(2);
    });

    test('should handle removing a tag from an empty array gracefully', () => {
        const tagsArray = new Tags([], dependencies);

        const tagToRemove = new MockTagClass('tag1', dependencies);
        tagsArray.remove(tagToRemove);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(tagsArray.length).toBe(0);
        expect(MockLogger.warn).toHaveBeenCalledWith("Tag 'tag1' not found.");
    });

    test('should not log when adding a tag without a logger', () => {
        const tagsArray = new Tags(['tag1'], dependenciesWithoutLogger);
        tagsArray.add('tag1');
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        // Since no logger is provided, there should be no logs
    });

    test('should not log when removing a non-existing tag without a logger', () => {
        const tagsArray = new Tags(['tag1'], dependenciesWithoutLogger);

        const nonExistingTag = new MockTagClass('tag2', dependencies);
        tagsArray.remove(nonExistingTag);
        expect(tagsArray.toStringArray()).toEqual(['tag1']);
        expect(tagsArray.length).toBe(1);
        // Since no logger is provided, there should be no logs
    });

    // Tests for specificTags property
    test('should return specific tags', () => {
        const tagsArray = new Tags(
            ['tag1', 'tag1/subtag1', 'tag2'],
            dependenciesWithoutLogger,
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
            dependenciesWithoutLogger,
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

        const tagsArray = new Tags([], dependencies);
        const result = tagsArray.loadTagsFromFile(mockFile);
        expect(result).toBe(true);
        expect(tagsArray.toStringArray()).toEqual(['tag1', 'tag2']);
    });

    test('should log warning if no metadata in file', () => {
        const mockFile = { path: 'test.md' } as TFile;
        mockMetadataCache.getEntry = jest.fn().mockReturnValue(null);

        const tagsArray = new Tags([], dependencies);
        const result = tagsArray.loadTagsFromFile(mockFile);
        expect(result).toBe(false);
        expect(tagsArray.toStringArray()).toEqual([]);

        expect(MockLogger.warn).toHaveBeenCalledWith(
            'No metadata found in the file.',
        );
    });

    test('should log warning if no file provided', () => {
        const tagsArray = new Tags([], dependencies);
        const result = tagsArray.loadTagsFromFile(undefined);
        expect(result).toBe(false);
        expect(tagsArray.toStringArray()).toEqual([]);
        expect(MockLogger.warn).toHaveBeenCalledWith('No file provided.');
    });

    // Test `first()` and `last()` methods
    test('should return the first tag', () => {
        const tagsArray = new Tags(['tag1', 'tag2'], dependencies);
        expect(tagsArray.first()?.toString()).toBe('tag1');
    });

    test('should return undefined as first tag', () => {
        const tagsArray = new Tags(undefined, dependencies);
        expect(tagsArray.first()).toBe(undefined);
    });

    test('should return the last tag', () => {
        const tagsArray = new Tags(['tag1', 'tag2'], dependencies);
        expect(tagsArray.last()?.toString()).toBe('tag2');
    });

    test('should return undefined as last tag', () => {
        const tagsArray = new Tags(undefined, dependencies);
        expect(tagsArray.last()).toBe(undefined);
    });
});
