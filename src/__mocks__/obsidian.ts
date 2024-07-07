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
