import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import {
    ISettingRow,
    ISettingRowFluentApi,
    SettingConfigurator,
} from 'src/libs/Settings/interfaces/ISettingRow';
import { CallbackError, MissingCallbackError } from './Exceptions';
import {
    IShouldOpenCallback,
    IOpenCallback,
    ICloseCallback,
} from '../types/IModalCallbacks';

/**
 * Static interface for the Modal interface.
 * @see {@link IModal} for the instance interface.
 */
export interface IModal_ {
    /**
     * Creates a new Modal.
     * @see {@link IModal}
     */
    new (): IModal;
}

/**
 * Instance interface for the Modal interface.
 * @see {@link IModal_} for the static interface.
 */
export interface IModal extends IDIComponent, IModalFluentApi {
    /**
     * The content of the modal.
     */
    get content(): HTMLElement;

    /**
     * Gets the unique class name of the draggable element.
     */
    get draggableClassName(): string | undefined;

    /**
     * The results of the modal.
     */
    get result(): Record<string, unknown>;
}

export interface IModalFluentApi {
    /**
     * Opens the modal.
     * @throws {MissingCallbackError} If the `onOpen` callback is missing.
     * @throws {CallbackError} If an error occurs in the `shouldOpen` callback.
     * @throws {CallbackError} If an error occurs in the `onOpen` callback.
     */
    open(): void;

    /**
     * Closes the modal.
     * @throws {CallbackError} If an error occurs in the `onClose` callback.
     */
    close(): void;

    /**
     * Gets whether the modal required fields are filled.
     */
    get isRequiredFullfilled(): boolean;

    /**
     * Sets the before open callback.
     * You can use this to check if the modal can be opened.
     * If the callback returns false, the modal won't be opened.
     * @param shouldOpen The callback to set.
     * @remarks **Optional**
     * @returns This instance.
     */
    setShouldOpen(shouldOpen: IShouldOpenCallback): IModalFluentApi;

    /**
     * Sets the on open callback.
     * Will be called when the modal is opened.
     * @param onOpen The callback to set.
     * @returns This instance.
     */
    setOnOpen(onOpen: IOpenCallback): IModalFluentApi;

    /**
     * Sets the on close callback.
     * Will be called when the modal is closed.
     * @param onClose The callback to set.
     * @remarks **Optional**
     * @returns This instance.
     */
    setOnClose(onClose: ICloseCallback): IModalFluentApi;

    /**
     * Sets the title of the modal.
     * @param title The title to set.
     * @returns This instance.
     */
    setTitle(title: string): IModalFluentApi;

    /**
     * Appends content to the modal content.
     * @param content The content to append.
     * @returns This instance.
     */
    setContent(content: DocumentFragment): IModalFluentApi;

    /**
     * Sets the draggable state of the modal.
     * @param isDraggable Whether the modal should be draggable.
     * @returns This instance.
     */
    setDraggableEnabled(isDraggable: boolean): IModalFluentApi;

    /**
     * Sets whether the background should be dimmed.
     * @param willDimBackground Whether the background should be dimmed.
     * @returns This instance.
     */
    setBackgroundDimmed(willDimBackground: boolean): IModalFluentApi;

    /**
     * Adds a setting row to the modal.
     * @param configure The configurator function to configure the setting row.
     * @returns This instance.
     * @see {@link ISettingRowFluentApi}
     * @see {@link ISettingRow}
     */
    addSettingRow(configure: SettingConfigurator): IModalFluentApi;

    /**
     * Method for modifying the modal.
     * @param callback The callback function, which will be called.
     * @returns This instance.
     */
    then(
        callback: (modal: IModal & IModalFluentApi) => unknown,
    ): IModalFluentApi;
}
