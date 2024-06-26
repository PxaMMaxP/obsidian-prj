import { MarkdownRenderChild } from 'obsidian';
import { ILogger } from 'src/interfaces/ILogger';

/**
 * Customizable Render Child class.
 * This class is a wrapper for the `MarkdownRenderChild` class.
 * It allows you to customize the `onLoad` and `onUnload` functions.
 * @remarks Use this as a child when you want to customize the `onLoad` and `onUnload` functions.
 */
export default class CustomizableRenderChild extends MarkdownRenderChild {
    private logger: ILogger | undefined;
    private _onUnload: (() => void) | undefined;
    private _onLoad: (() => void) | undefined;

    /**
     * Constructor of the `CustomizableRenderChild` class.
     * @param container The HTML container.
     * @param onLoad Your custom `onLoad` function. Set `undefined` if you don't want to use it.
     * @param onUnload Your custom `onUnload` function. Set `undefined` if you don't want to use it.
     * @param logger Your custom logger.
     */
    constructor(
        container: HTMLElement,
        onLoad: (() => void) | undefined,
        onUnload: (() => void) | undefined,
        logger?: ILogger,
    ) {
        super(container);
        this.logger = logger ?? undefined;
        this._onLoad = onLoad;
        this._onUnload = onUnload;
    }

    /**
     * Custom `onLoad` function.
     * This function is called when the child is loaded.
     * @remarks Calls the custom `onLoad` function if it is defined and then calls the base `onLoad` function.
     */
    override onload(): void {
        this.logger?.trace('On Load');
        this._onLoad?.();
        super.onload();
    }

    /**
     * Custom `onUnload` function.
     * This function is called when the child is unloaded.
     * @remarks Calls the custom `onUnload` function if it is defined and then calls the base `onUnload` function.
     */
    override onunload(): void {
        this.logger?.trace('On Unload');
        this._onUnload?.();
        super.onunload();
    }
}
