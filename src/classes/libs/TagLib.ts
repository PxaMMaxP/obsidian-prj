// Note: TagLib class

import { DvAPIInterface } from "obsidian-dataview/lib/typings/api";
import Global from 'src/classes/global';
import { App } from 'obsidian';

export default class TagLib {
    dv: DvAPIInterface = Global.getInstance().dv;
    app: App = Global.getInstance().app;

    /**
     * Checks if the tag is a valid tag array
     * @param tag The tag array to check
     * @returns Whether the tag is a valid tag array
     */
    isValidTag(tag: Array<string>): boolean {
        return tag && tag.length > 0;
    }

    /**
     * Returns the valid tags array from the given tag/s
     * @param tags The tag/s to return the valid tags array from
     * @returns The valid tags array
     */
    getValidTags(tags: string | Array<string>): Array<string> {
        let validTags: Array<string> = [];

        if (tags) {
            validTags = Array.from(tags)
        }

        return validTags;
    }

    /**
     * Removes redundant tags from the given tag array
     * @param tags The tag array to remove redundant tags from
     * @returns The tag array without redundant tags
     */
    removeRedundantTags(tags: Array<string>): Array<string> {
        let cleanedTags: Array<string> = [];
        if (this.isValidTag(tags)) {
            cleanedTags = tags.filter(tag =>
                !tags.some(otherTag => otherTag !== tag && otherTag.startsWith(tag + "/"))
            );
        }
        return cleanedTags;
    }

    /**
     * Creates an Obsidian Tag Link as an HTML Element
     * @param tag The tag to create the link for
     * @returns The Obsidian Tag Link as an HTML Element or a span element if no tag is given
     */
    createObsidianTagLink(tag: string): HTMLAnchorElement | HTMLSpanElement {
        if (!tag) {
            const span = document.createElement('span');
            span.textContent = ``;
            return span;
        }
        const obsidianLink = document.createElement('a');
        obsidianLink.href = `#${tag}`;
        obsidianLink.classList.add('tag');
        obsidianLink.target = '_blank';
        obsidianLink.rel = 'noopener';
        obsidianLink.textContent = `#${tag}`;

        return obsidianLink;
    }

    generateTagList(tags: Array<string>): DocumentFragment {
        const container = document.createDocumentFragment();
        const rawTagsLinkList = tags.map(tag => this.createObsidianTagLink(tag));

        rawTagsLinkList.forEach((tagLinkElement, index) => {
            try {
                container.appendChild(tagLinkElement);
            } catch (error) {
                console.log("An error occurred while appending the tag link element: ", error);
            }


            if (index < rawTagsLinkList.length - 1) {
                const divider = document.createElement('div');
                divider.id = "tagDivider";

                const br = document.createElement('br');
                divider.appendChild(br);

                container.appendChild(divider);
            }
        });

        return container;
    }

    existTag(tag: string): boolean {
        if (!tag.startsWith('#')) {
            tag = `#${tag}`;
        }

        const existFile = this.dv.pages(tag, '').first();

        return existFile ? true : false;
    }
}