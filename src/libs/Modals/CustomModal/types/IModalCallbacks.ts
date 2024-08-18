import { IModal } from '../interfaces/IModal';

/**
 * Type for the callback to determine if the modal should open.
 * @returns {boolean} True if the modal can be opened, otherwise false.
 */

export type IShouldOpenCallback = () => boolean;
/**
 * Type for the callback to be called when the modal is opened.
 * @param modal The modal that will be opened.
 */

export type IOpenCallback = (modal: IModal) => void;
/**
 * Type for the callback to be called when the modal is closed.
 * @param modal The modal that will be closed.
 */

export type ICloseCallback = (modal: IModal) => void;
