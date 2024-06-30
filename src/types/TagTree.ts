/**
 * Represents a hierarchical tree structure for tags.
 * @example { "tag1": { "subtag1": {}, "subtag2": {} }, "tag2": {} }
 */
export type TagTree = {
    [tag: string]: TagTree;
};
