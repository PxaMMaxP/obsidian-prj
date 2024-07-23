/**
 * Represents a custom modal.
 */
export interface ICustomModal {
    /**
     * Opens the modal.
     */
    open(): void;

    /**
     * Closes the modal.
     */
    close(): void;

    /**
     * Sets the title of the modal.
     * @param title The title to set.
     */
    setTitle(title: string): void;

    /**
     * Sets the content of the modal.
     * @param content The content to replace the current content with.
     */
    setContent(content: DocumentFragment): void;
}
