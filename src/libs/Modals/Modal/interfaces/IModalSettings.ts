import {
    ICloseCallback,
    IOpenCallback,
    IShouldOpenCallback,
} from '../types/IModalCallbacks';

export interface IModalSettings {
    /**
     * The title of the modal.
     * If the title is empty, the title will be a non-breaking space
     * to still serve as a drag handler.
     */
    title: string;

    /**
     * The content will be appended to the modal.
     * Any Elements added will be appended on end of the modal.
     */
    additonalContent: DocumentFragment;

    /**
     * Whether the modal should be draggable.
     */
    isDraggable: boolean;

    /**
     * Whether the background should be dimmed.
     */
    willDimBackground: boolean;

    /**
     * Called before the modal is opened.
     * @returns True if the modal can be opened, otherwise false.
     */
    shouldOpen?: IShouldOpenCallback;

    /**
     * Called when the modal is opened.
     */
    onOpen?: IOpenCallback;

    /**
     * Called when the modal is closed.
     */
    onClose?: ICloseCallback;
}
