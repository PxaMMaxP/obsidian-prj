// Note: TagLib class

import Global from 'src/classes/Global';

/**
 * Represents a hierarchical tree structure for tags.
 */
export type TagTree = {
    [tag: string]: TagTree;
};

export default class Tags {
    /**
     * Checks if the tag is a valid tag array
     * @param tag The tag array to check
     * @returns Whether the tag is a valid tag array
     */
    static isValidTag(tag: Array<string>): boolean {
        return tag && tag.length > 0;
    }

    /**
     * Returns the valid tags array from the given tag/s
     * @param tags The tag/s to return the valid tags array from
     * @returns The valid tags array
     */
    static getValidTags(
        tags: string | Array<string> | undefined,
    ): Array<string> {
        let formattedTags: string[] = [];

        if (tags && typeof tags === 'string') {
            formattedTags = [tags];
        } else if (Array.isArray(tags)) {
            formattedTags = [...tags];
        }

        return formattedTags;
    }

    /**
     * Creates an Obsidian tag link element.
     *
     * @param tagLabel - The label for the tag.
     * @param tag - The tag value.
     * @returns The created HTML anchor element.
     */
    static createObsidianTagLink(
        tagLabel: string,
        tag: string,
    ): HTMLAnchorElement {
        const obsidianLink = document.createElement('a');
        obsidianLink.href = `#${tag}`;
        obsidianLink.classList.add('tag');
        obsidianLink.target = '_blank';
        obsidianLink.rel = 'noopener';
        obsidianLink.textContent = `${tagLabel}`;

        return obsidianLink;
    }

    /**
     * Filters out the non specific tags from the given tags array
     * @param tags The tags array to filter out the non specific tags from
     * @returns The tags array without the non specific tags
     * @example removeRedundantTags(["tag1", "tag2", "tag1/subtag1", "tag1/subtag2"]) => ["tag2", "tag1/subtag1", "tag1/subtag2"]
     */
    static filterOutNonSpecificTags(tags: Array<string>): Array<string> {
        let cleanedTags: Array<string> = [];

        if (this.isValidTag(tags)) {
            cleanedTags = tags.filter(
                (tag) =>
                    !tags.some(
                        (otherTag) =>
                            otherTag !== tag && otherTag.startsWith(tag + '/'),
                    ),
            );
        }

        return cleanedTags;
    }

    /**
     * Checks if the given tag exists in the metadata cache
     * @param tag The tag to check
     * @returns Whether the tag exists in the metadata cache
     */
    static existTag(tag: string): boolean {
        const metadataCache = Global.getInstance().metadataCache;

        if (!tag.startsWith('#')) {
            tag = `#${tag}`;
        }

        const existFile = metadataCache.cache.find((file) => {
            const tags = file.metadata?.frontmatter?.tags;

            if (typeof tags === 'string') {
                return tags === tag;
            } else if (Array.isArray(tags)) {
                return tags.includes(tag);
            }

            return false;
        });

        return existFile ? true : false;
    }

    /**
     * Creates a tag tree from an array of tags.
     * @param tags - The array of tags.
     * @returns The tag tree.
     */
    static createTagTree(tags: Array<string>): TagTree {
        const tagTree: TagTree = {};

        tags.forEach((tag) => {
            const parts = tag.split('/');
            let currentLevel = tagTree;

            parts.forEach((part) => {
                if (!currentLevel[part]) {
                    currentLevel[part] = {};
                }
                currentLevel = currentLevel[part];
            });
        });

        return tagTree;
    }

    /**
     * Returns an array of tag elements extracted from the given tag string.
     * @param tag - The tag string to extract tag elements from.
     * @returns An array of tag elements.
     */
    static getTagElements(tag: string) {
        if (!tag || typeof tag !== 'string') return [];
        const tags = tag.split('/');

        return tags;
    }
}
