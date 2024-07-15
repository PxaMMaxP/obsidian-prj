/**
 * This file is a mock of the Obsidian API.
 */

/**
 * Represents a `MarkdownRenderChild` class.
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

export interface MarkdownPostProcessorContext {
    docId: string;
    sourcePath: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frontmatter: any | null | undefined;

    /**
     * Adds a child component that will have its lifecycle managed by the renderer.
     *
     * Use this to add a dependent child to the renderer such that if the containerEl
     * of the child is ever removed, the component's unload will be called.
     */
    addChild(child: MarkdownRenderChild): void;
    /**
     * Gets the section information of this element at this point in time.
     * Only call this function right before you need this information to get the most up-to-date version.
     * This function may also return null in many circumstances; if you use it, you must be prepared to deal with nulls.
     */
    getSectionInfo(el: HTMLElement): MarkdownSectionInformation | null;
}

export interface MarkdownSectionInformation {
    text: string;
    lineStart: number;
    lineEnd: number;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const _moment = require('moment');

const mockMoment = jest.fn((...args) => {
    const actualMoment = _moment(...args);

    actualMoment.format = jest.fn((format: string) => {
        if (format === 'invalid-format') {
            return 'Invalid date';
        }

        return _moment(...args).format(format);
    });

    return actualMoment;
});

export { mockMoment as moment };
