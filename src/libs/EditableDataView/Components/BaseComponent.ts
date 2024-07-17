import { Component, Platform, setIcon } from 'obsidian';
import Global from 'src/classes/Global';

/**
 * A cursor position.
 * @remarks - The cursor position can be a number, 'start' or 'end'.
 */
export type CursorPosition = number | 'start' | 'end';

/**
 * The base class for all components that should be editable.
 */
export default abstract class BaseComponent {
    /**
     * The main container of the component.
     */
    public get container(): HTMLDivElement {
        return this._shippingContainer;
    }
    protected _component: Component;
    public thenCallback: ((container: HTMLDivElement) => void) | undefined;

    /**
     * If `true`, the component will be created to allow editing.
     * @remarks Create a configuration option for this property in the child class.
     */
    protected abstract _editabilityEnabled: boolean;
    //#region HTML Elements
    private _shippingContainer: HTMLDivElement;
    /**
     * The container that holds the input elements.
     * @remarks Has the CSS classes `editable-data-view` & `data-input-container`.
     */
    protected _dataInputContainer: HTMLElement;
    /**
     * The container that holds the elements which show the data in `not-edit` mode.
     * @remarks Has the CSS classes `editable-data-view` & `presentation-container`.
     */
    protected _presentationContainer: HTMLElement;
    private _buttonContainer: HTMLElement;
    private _editButton: HTMLButtonElement;
    private _cancelButton: HTMLButtonElement | undefined = undefined;
    private _saveButton: HTMLButtonElement | undefined = undefined;
    //#endregion
    //#region Callbacks
    /**
     * This callback is called when the user clicks on the `edit` button.
     * The `dataInputContainer` is visible and the `presentationContainer` is hidden.
     * Fill the `dataInputContainer` with the input elements.
     */
    abstract onEnableEditCallback: () => void;
    /**
     * This callback is called when the user clicks on the `cancel` button or
     * after the `saveChanges`-methode is clicked.
     * The `dataInputContainer` is hidden and the `presentationContainer` is visible.
     */
    abstract onDisableEditCallback: () => void;
    /**
     * This callback is called when the user clicks on the `save` button.
     * The `dataInputContainer` is hidden and the `presentationContainer` is visible.
     * The changes should be saved and the `presentationContainer` should be filled with the new data.
     */
    abstract onSaveCallback: () => Promise<void>;
    /**
     * This callback is called when the user clicks on the `edit` button for the first time.
     * The `dataInputContainer` is visible and the `presentationContainer` is hidden.
     * Fill the `dataInputContainer` with the input elements.
     */
    abstract onFirstEdit: () => void;
    /**
     * This callback is called when the component is finalized.
     * The `dataInputContainer` is hidden and the `presentationContainer` is visible.
     * Fill the `presentationContainer` with the data.
     * @remarks Don't fill the `dataInputContainer` with the input elements!
     * @remarks The configuration of the component is finished when the `onFinalize`-callback is called.
     */
    abstract onFinalize: () => void;
    //#endregion

    /**
     * Creates a new instance of the base component.
     * @param component The component that should be created.
     */
    constructor(component: Component) {
        this._component = component;
        this._shippingContainer = document.createElement('div');

        this._shippingContainer.classList.add(
            'editable-data-view',
            'container',
        );
    }

    /**
     * Creates the base structure of the component.
     * @param editabilityEnabled If `true`, the component will be created to allow editing.
     * @tutorial Run this methode in the `finalize`-methode of the child class before creating your elements.
     */
    protected createBaseStructure(
        editabilityEnabled: boolean = this._editabilityEnabled,
    ): void {
        this._presentationContainer = document.createElement('div');

        this._presentationContainer.classList.add(
            'editable-data-view',
            'presentation-container',
        );
        this._shippingContainer.appendChild(this._presentationContainer);

        if (
            editabilityEnabled &&
            (Platform.isMobile ? Global.getInstance().settings.mobile : true)
        ) {
            this._buttonContainer = document.createElement('div');

            this._buttonContainer.classList.add(
                'editable-data-view',
                'button-container',
            );
            this.createEditButton();
            this._shippingContainer.appendChild(this._buttonContainer);
        }
    }

    /**
     * Creates the `edit` button and adds it to the `buttonContainer`.
     */
    private createEditButton(): void {
        this._editButton = document.createElement('button');
        this._buttonContainer.appendChild(this._editButton);
        this._editButton.classList.add('editable-data-view');
        this._editButton.classList.add('button');
        setIcon(this._editButton, 'pen');

        this._component.registerDomEvent(this._editButton, 'click', () =>
            this.enableEditMode(),
        );
    }

    /**
     * Creates the `save` and `cancel` buttons and the `input` container and adds them to the `buttonContainer`.
     */
    private createComponentsForEdit(): void {
        this._dataInputContainer = document.createElement('div');

        this._dataInputContainer.classList.add(
            'editable-data-view',
            'data-input-container',
            'hidden',
        );

        this._shippingContainer.insertBefore(
            this._dataInputContainer,
            this._presentationContainer,
        );

        this._cancelButton = document.createElement('button');
        this._buttonContainer.insertAfter(this._cancelButton, this._editButton);
        this._cancelButton.classList.add('editable-data-view');
        this._cancelButton.classList.add('button');
        this._cancelButton.classList.add('hidden');
        setIcon(this._cancelButton, 'x');

        this._component.registerDomEvent(this._cancelButton, 'click', () =>
            this.disableEditMode(),
        );

        this._saveButton = document.createElement('button');
        this._buttonContainer.insertAfter(this._saveButton, this._cancelButton);
        this._saveButton.classList.add('editable-data-view');
        this._saveButton.classList.add('button');
        this._saveButton.classList.add('hidden');
        setIcon(this._saveButton, 'check');

        this._component.registerDomEvent(this._saveButton, 'click', () =>
            this.saveChanges(),
        );
    }

    /**
     * This method is called after the final configuration of the component.
     */
    public finalize(): void {
        this.createBaseStructure();
        this.onFinalize?.();
    }

    /**
     * This method is called when the user clicks on the `edit` button.
     * It should switch the component to edit mode and
     * create the `save` and `cancel` buttons if not already created.
     * @remarks You can call this methode to simulate a click on the `edit` button.
     */
    protected enableEditMode(): void {
        // If the `save` or the `cancel` button is not created, create them.
        if (!this._cancelButton || !this._saveButton) {
            this.createComponentsForEdit();
            this.onFirstEdit?.();
        }

        // Switch mode to Edit: hide the `edit` button and show the `save` and `cancel` buttons.
        if (this._cancelButton && this._saveButton) {
            this._presentationContainer.classList.add('hidden');
            this._dataInputContainer.classList.remove('hidden');
            this._cancelButton.classList.remove('hidden');
            this._saveButton.classList.remove('hidden');
            this._editButton.classList.add('hidden');
            this.onEnableEditCallback?.();
        }
    }

    /**
     * This method is called when the user clicks on the `cancel` button or
     * after the `saveChanges`-methode is clicked.
     * @remarks You can call this methode to simulate a click on the `cancel` button.
     */
    protected disableEditMode(): void {
        // Switch mode to View: hide the `save` and `cancel` buttons and show the `edit` button.
        if (this._cancelButton && this._saveButton) {
            this._presentationContainer.classList.remove('hidden');
            this._dataInputContainer.classList.add('hidden');
            this._cancelButton.classList.add('hidden');
            this._saveButton.classList.add('hidden');
            this._editButton.classList.remove('hidden');
            this.onDisableEditCallback?.();
        }
    }

    /**
     * This method is called when the user clicks on the `save` button.
     * @remarks You can call this methode to simulate a click on the `save` button.
     */
    protected async saveChanges(): Promise<void> {
        // Run the callback and disable edit mode.
        if (this._cancelButton && this._saveButton) {
            await this.onSaveCallback?.();
            this.disableEditMode();
        }
    }

    /**
     * You can use this method to change whatevers you want in the main container.
     * @param callback The callback to run. `container` is the main container of the component.
     * @returns The component itself.
     * @remarks You can use this method to change whatevers you want in the main container:
     * - You can add new elements to the container,
     * - change or add CSS classes,
     * - etc.
     */
    public then(callback: (container: HTMLDivElement) => void): BaseComponent {
        this.thenCallback = callback;

        return this;
    }

    /**
     * Sets the cursor position in the input element.
     * @param position Position to set the cursor to.
     * @param input The input element.
     * @remarks The position is clamped to the length of the input element.
     */
    protected setInputCursorAbsolutePosition(
        position: CursorPosition,
        input: HTMLElement,
    ): void {
        position = this.getCursorPositionNumber(position);

        const selection = window.getSelection();
        const range = document.createRange();

        if (selection && selection.rangeCount > 0) {
            const safePosition = Math.max(
                0,
                Math.min(position, input.textContent?.length ?? 0),
            );

            if (input.firstChild) {
                range.setStart(input.firstChild, safePosition);
                range.setEnd(input.firstChild, safePosition);
            }

            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    /**
     * Returns the cursor position as a number.
     * @param position Position to convert. Can be a number, 'start' or 'end'.
     * @returns The cursor position as a number.
     */
    private getCursorPositionNumber(position: CursorPosition): number {
        if (position === 'start') {
            position = 0;
        } else if (position === 'end') {
            position = Number.MAX_SAFE_INTEGER;
        }

        return position;
    }
}
