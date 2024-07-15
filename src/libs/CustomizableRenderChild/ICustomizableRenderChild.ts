/**
 * Customizable Render Child Interface.
 *
 */
export interface ICustomizableRenderChild {
    /**
     * Custom `onLoad` function.
     * This function is called when the child is loaded.
     * @remarks Calls the custom `onLoad` function if it is defined and then calls the base `onLoad` function.
     */
    onload(): void;

    /**
     * Custom `onUnload` function.
     * This function is called when the child is unloaded.
     * @remarks Calls the custom `onUnload` function if it is defined and then calls the base `onUnload` function.
     */
    onunload(): void;
}

/**
 * Customizable Render Child Constructor.
 * This interface is used to create a new instance of the {@link ICustomizableRenderChild} interface.
 * @see {@link ICustomizableRenderChild}
 */
export interface ICustomizableRenderChildConstructor {
    new (containerEl: HTMLElement): ICustomizableRenderChild;
}
