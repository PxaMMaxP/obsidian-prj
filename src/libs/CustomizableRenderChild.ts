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
    private onUnload: (() => void) | undefined;
    private onLoad: (() => void) | undefined;

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
        this.onLoad = onLoad;
        this.onUnload = onUnload;
    }

    override onload(): void {
        this.logger?.trace('On Load');
        this.onLoad?.();
        super.onload();
    }

    override onunload(): void {
        this.logger?.trace('On Unload');
        this.onUnload?.();
        super.onunload();
    }
}
