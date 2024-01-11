import { Component, Platform, setIcon } from "obsidian";
import Global from "src/classes/Global";


export default abstract class BaseComponent {
    public get container(): HTMLDivElement {
        return this.shippingContainer;
    }
    protected component: Component;

    /**
     * If `true`, the component will be created to allow editing.
     * @remarks Create a configuration option for this property in the child class.
     */
    protected abstract editabilityEnabled: boolean;
    //#region HTML Elements
    private shippingContainer: HTMLDivElement;
    /** 
     * The container that holds the input elements.
     * @remarks Has the CSS classes `editable-data-view` & `data-input-container`.
     */
    protected dataInputContainer: HTMLElement;
    /**
     * The container that holds the elements which show the data in `not-edit` mode.
     * @remarks Has the CSS classes `editable-data-view` & `presentation-container`.
     */
    protected presentationContainer: HTMLElement;
    private buttonContainer: HTMLElement;
    private editButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement | undefined = undefined;
    private saveButton: HTMLButtonElement | undefined = undefined;
    //#endregion
    //#region Callbacks
    /**
     * This callback is called when the user clicks on the `edit` button.
     * The `dataInputContainer` is visible and the `presentationContainer` is hidden.
     * Fill the `dataInputContainer` with the input elements.
     */
    abstract onEnableEditCallback: (() => void);
    /**
     * This callback is called when the user clicks on the `cancel` button or 
     * after the `saveChanges`-methode is clicked.
     * The `dataInputContainer` is hidden and the `presentationContainer` is visible.
     */
    abstract onDisableEditCallback: (() => void);
    /**
     * This callback is called when the user clicks on the `save` button.
     * The `dataInputContainer` is hidden and the `presentationContainer` is visible.
     * The changes should be saved and the `presentationContainer` should be filled with the new data.
     */
    abstract onSaveCallback: (() => Promise<void>);
    /**
     * This callback is called when the user clicks on the `edit` button for the first time.
     * The `dataInputContainer` is visible and the `presentationContainer` is hidden.
     * Fill the `dataInputContainer` with the input elements.
     */
    abstract onFirstEdit: (() => void);
    /**
     * This callback is called when the component is finalized.
     * The `dataInputContainer` is hidden and the `presentationContainer` is visible.
     * Fill the `presentationContainer` with the data.
     * @remarks Don't fill the `dataInputContainer` with the input elements!
     * @remarks The configuration of the component is finished when the `onFinalize`-callback is called.
     */
    abstract onFinalize: (() => void);
    //#endregion

    constructor(component: Component) {
        this.component = component;
        this.shippingContainer = document.createElement('div');
        this.shippingContainer.classList.add('editable-data-view', 'container');
    }

    /**
     * Creates the base structure of the component.
     * @param editabilityEnabled If `true`, the component will be created to allow editing.
     * @tutorial Run this methode in the `finalize`-methode of the child class before creating your elements.
     */
    protected createBaseStructure(editabilityEnabled: boolean = this.editabilityEnabled): void {

        this.presentationContainer = document.createElement('div');
        this.presentationContainer.classList.add('editable-data-view', 'presentation-container');
        this.shippingContainer.appendChild(this.presentationContainer);
        if (editabilityEnabled && (Platform.isMobile ? Global.getInstance().settings.mobile : true)) {
            this.buttonContainer = document.createElement('div');
            this.buttonContainer.classList.add('editable-data-view', 'button-container');
            this.createEditButton();
            this.shippingContainer.appendChild(this.buttonContainer);
        }

    }

    /**
     * Creates the `edit` button and adds it to the `buttonContainer`.
     */
    private createEditButton(): void {
        this.editButton = document.createElement('button');
        this.buttonContainer.appendChild(this.editButton);
        this.editButton.classList.add('editable-data-view');
        this.editButton.classList.add('button');
        setIcon(this.editButton, 'pen');
        this.component.registerDomEvent(this.editButton, 'click', () => this.enableEditMode());
    }

    /**
     * Creates the `save` and `cancel` buttons and the `input` container and adds them to the `buttonContainer`.
     */
    private createComponentsForEdit(): void {
        this.dataInputContainer = document.createElement('div');
        this.dataInputContainer.classList.add('editable-data-view', 'data-input-container', 'hidden');
        this.shippingContainer.insertBefore(this.dataInputContainer, this.presentationContainer);

        this.cancelButton = document.createElement('button');
        this.buttonContainer.insertAfter(this.cancelButton, this.editButton);
        this.cancelButton.classList.add('editable-data-view');
        this.cancelButton.classList.add('button');
        this.cancelButton.classList.add('hidden');
        setIcon(this.cancelButton, 'x');
        this.component.registerDomEvent(this.cancelButton, 'click', () => this.disableEditMode());

        this.saveButton = document.createElement('button');
        this.buttonContainer.insertAfter(this.saveButton, this.cancelButton);
        this.saveButton.classList.add('editable-data-view');
        this.saveButton.classList.add('button');
        this.saveButton.classList.add('hidden');
        setIcon(this.saveButton, 'check');
        this.component.registerDomEvent(this.saveButton, 'click', () => this.saveChanges());
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
        if (!this.cancelButton || !this.saveButton) {
            this.createComponentsForEdit();
            this.onFirstEdit?.();
        }
        // Switch mode to Edit: hide the `edit` button and show the `save` and `cancel` buttons.
        if (this.cancelButton && this.saveButton) {
            this.presentationContainer.classList.add('hidden');
            this.dataInputContainer.classList.remove('hidden');
            this.cancelButton.classList.remove('hidden');
            this.saveButton.classList.remove('hidden');
            this.editButton.classList.add('hidden');
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
        if (this.cancelButton && this.saveButton) {
            this.presentationContainer.classList.remove('hidden');
            this.dataInputContainer.classList.add('hidden');
            this.cancelButton.classList.add('hidden');
            this.saveButton.classList.add('hidden');
            this.editButton.classList.remove('hidden');
            this.onDisableEditCallback?.();
        }
    }

    /**
     * This method is called when the user clicks on the `save` button.
     * @remarks You can call this methode to simulate a click on the `save` button.
     */
    protected async saveChanges(): Promise<void> {
        // Run the callback and disable edit mode.
        if (this.cancelButton && this.saveButton) {
            await this.onSaveCallback?.();
            this.disableEditMode();
        }
    }
}