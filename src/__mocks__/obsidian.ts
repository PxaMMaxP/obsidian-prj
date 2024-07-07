/**
 * This file is a mock of the Obsidian API.
 */

/**
 *
 */
export class MarkdownRenderChild {
    public containerEl: HTMLElement;

    /**
     * Constructor of the `MarkdownRenderChild` class.
     * @param containerEl - This HTMLElement will be used to test whether this component is still alive.
     * It should be a child of the markdown preview sections, and when it's no longer attached
     * (for example, when it is replaced with a new version because the user edited the markdown source code),
     * this component will be unloaded.
     */
    constructor(containerEl: HTMLElement) {
        this.containerEl = containerEl;
    }

    /**
     * This function is called when the child is loaded.
     */
    onload() {
        // This method will be overwritten in the actual implementation
    }

    /**
     * This function is called when the child is unloaded.
     */
    onunload() {
        // This method will be overwritten in the actual implementation
    }
}

/**
 * @public
 */
export interface MarkdownPostProcessorContext {
    /**
     * @public
     */
    docId: string;
    /** @public */
    sourcePath: string;
    /** @public */
    frontmatter: any | null | undefined;

    /**
     * Adds a child component that will have its lifecycle managed by the renderer.
     *
     * Use this to add a dependent child to the renderer such that if the containerEl
     * of the child is ever removed, the component's unload will be called.
     * @public
     */
    addChild(child: MarkdownRenderChild): void;
    /**
     * Gets the section information of this element at this point in time.
     * Only call this function right before you need this information to get the most up-to-date version.
     * This function may also return null in many circumstances; if you use it, you must be prepared to deal with nulls.
     * @public
     */
    getSectionInfo(el: HTMLElement): MarkdownSectionInformation | null;
}

/** @public */
export interface MarkdownSectionInformation {
    /** @public */
    text: string;
    /** @public */
    lineStart: number;
    /** @public */
    lineEnd: number;
}
