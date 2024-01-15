import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";

/**
 * Interface for the logger.
 * @remarks You can attach your own logger or `console` as logger.
 */
export interface Logger {
    /**
     * Log a `trace` message.
     * @param message The trace message to log. 
     * @param optionalParams Optional parameters: strings, objects, etc.
     */
    trace(message?: unknown, ...optionalParams: unknown[]): void;
    /**
     * Log a `debug` message.
     * @param message The debug message to log.
     * @param optionalParams Optional parameters: strings, objects, etc.
     */
    debug(message?: unknown, ...optionalParams: unknown[]): void;
}

/**
 * Type for the view state.
 */
export type ViewState = "source" | "preview";

/**
 * Class for the Observer child.
 * @remarks This class is used to disconnect the observer on unload.
 */
export class ObserverChild extends MarkdownRenderChild {
    private logger: Logger | undefined;
    private onUnload: () => void;

    /**
     * Create a new instance of the observer child.
     * @param container The parent container.
     * @param onUnload The callback for the unload event.
     */
    constructor(
        container: HTMLElement,
        onUnload: () => void,
        logger?: Logger) {
        super(container);
        this.logger = logger ?? undefined;
        this.onUnload = onUnload;
    }

    /**
     * Callback for the unload event.
     */
    override onunload(): void {
        this.onUnload();
        super.onunload();
    }
}

/**
 * Class for the singleton block processor.
 * @remarks - This class is used to create a singleton like container for the block.
 * - Childs from containers with the same uid will be moved between the corosponding containers.
 * Depending on the current view state.
 * @tutorial
 * ```ts
 * //const uid = Create a unique id for the block.
 * const singletonBlockProcessor = new SingletonBlockProcessor(uid, el, ctx);
 * 
 * const singleToneBlock = singletonBlockProcessor.getSingletoneContainer();
 * el.append(singleToneBlock);
 * 
 * if (!singletonBlockProcessor.checkForSiblingBlocks()) {
 *    // If the block is not the only one in the workspace leaf,
 *    // return and do nothing in your `MarkdownCodeBlockProcessor`.
 *    return;
 * }
 * 
 * // Append your main parent container to the singletone container.
 * // This `mainContainer` container will be moved between the corosponding containers.
 * const mainContainer = document.createElement('div');
 * singleToneBlock.append(mainContainer);
 * 
 * // Work with your main container from here..
 * ```
 */
export default class SingletonBlockProcessor {
    private logger: Logger | undefined;
    private uid: string;
    private el: HTMLElement;
    private ctx: MarkdownPostProcessorContext;
    private observer: MutationObserver | undefined;
    private onUnload: () => void;
    private observerChild: ObserverChild | undefined;

    /**
     * Get the current code block view state.
     */
    public get codeBlockViewState(): ViewState | undefined {
        return this.getCodeBlockViewState();
    }

    /**
     * Get the current workspace leaf content block.
     */
    private get workspaceLeafContent(): Element | undefined {
        return this.el.closest('.workspace-leaf-content') ?? undefined;
    }

    /**
     * Get the current workspace leaf state.
     */
    private get workspaceLeafState(): string | undefined {
        return this.workspaceLeafContent?.getAttribute('data-mode') ?? undefined;
    }

    /**
     * Get all sibling blocks with the uis as id.
     */
    private get siblingBlocks(): NodeListOf<Element> | undefined {
        return this.workspaceLeafContent?.querySelectorAll(`#${this.uid}`);
    }

    /**
     * Get the source sibling block.
     */
    private get sourceSiblingBlock(): Element | undefined {
        return this.workspaceLeafContent?.querySelector(`#${this.uid}[data-mode='source']`) ?? undefined;
    }

    /**
     * Get the preview sibling block.
     */
    private get previewSiblingBlock(): Element | undefined {
        return this.workspaceLeafContent?.querySelector(`#${this.uid}[data-mode='preview']`) ?? undefined;
    }

    /**
     * Create a new instance of the singleton block processor.
     * @param uid The unique id of the block. Only works between blocks with the same id.
     * @param el The element of the block.
     * @param ctx The markdown post processor context.
     */
    constructor(
        uid: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext,
        logger?: Logger) {

        this.logger = logger ?? undefined;
        this.uid = uid;
        this.el = el;
        this.ctx = ctx;
        this.onUnload = this.onUnloadCallback.bind(this);
        this.createObserver();
    }

    /**
     * Callback for the unload event.
     * @remarks Disconnect the observer.
     */
    private onUnloadCallback(): void {
        this.logger?.debug(`On Unload, UID: ${this.uid}`);
        this.observer?.disconnect();
    }

    /**
     * Check if the block is the only one in the workspace leaf.
     * @returns True if the block is the only one in the workspace leaf.
     * @remarks If the block is the only one in the workspace leaf, create a new block.
     */
    public checkForSiblingBlocks(): boolean {
        const blockViewState = this.codeBlockViewState;
        const viewState = this.workspaceLeafState;
        if (blockViewState === viewState && (this.siblingBlocks && this.siblingBlocks.length == 1)) {
            return true;
        } else {
            const source = this.sourceSiblingBlock;
            const preview = this.previewSiblingBlock;
            return !this.moveChildrenToCorrespondingViewState(blockViewState, source, preview);
        }
        return true;
    }

    private createObserver(): void {
        if (!this.workspaceLeafContent) {
            return;
        }
        // If a sibling block is available, we dont need to create an observer
        // because one observer is enough for all sibling blocks.
        if (this.siblingBlocks && this.siblingBlocks.length > 0) {
            return;
        }

        // Create a observer component. To `disconnect` the observer on unload.
        this.observerChild = new ObserverChild(this.el, this.onUnload, this.logger);

        this.observer = new MutationObserver((mutations) => {
            this.logger?.trace("Observer detect changes:", mutations, `UID: ${this.uid}`);
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-mode') {
                    const newViewState = this.workspaceLeafState;
                    const source = this.sourceSiblingBlock;
                    const preview = this.previewSiblingBlock;
                    this.moveChildrenToCorrespondingViewState(newViewState, source, preview);
                }
            }
        });

        this.observer.observe(this.workspaceLeafContent, {
            attributes: true
        });

        // Add the observer component to the context.
        this.observerChild.load();
        this.ctx.addChild(this.observerChild);
    }

    /**
     * Move the corosponding child elements to the new view state.
     * @param blockViewState The current block view state. Determines the target container.
     * @param source The `source` view state container.
     * @param preview The `preview` view state container.
     * @returns True if elements are moved.
     */
    private moveChildrenToCorrespondingViewState(
        blockViewState: string | undefined,
        source: Element | undefined,
        preview: Element | undefined): boolean {

        if (blockViewState === "source" && source && preview) {
            this.logger?.debug("Move preview to source", `UID: ${this.uid}`);
            return this.moveChilds(preview, source);
        } else if (blockViewState === "preview" && source && preview) {
            this.logger?.debug("Move source to preview", `UID: ${this.uid}`);
            return this.moveChilds(source, preview);
        }
        return false;
    }

    /**
     * Move all childs from one element to another.
     * @param from Source element.
     * @param to Target element.
     * @returns True if elements are moved.
     */
    private moveChilds(from: Element, to: Element): boolean {
        let elementsMoved = false;
        while (from.firstChild) {
            if (from.firstChild.childNodes.length > 0) {
                elementsMoved = true;
                to.appendChild(from.firstChild);
            }
        }
        return elementsMoved;
    }

    /**
     * Get the singletone container for the block.
     * @returns The singletone container for the block.
     * @remarks - Use this container for all your block content.
     * - Register a component with **this** container.
     */
    public getSingletoneContainer(): HTMLElement {
        const singletoneContainer = document.createElement('div');
        singletoneContainer.id = this.uid;
        singletoneContainer.setAttribute('data-mode', this.getCodeBlockViewState(true) ?? "none");
        return singletoneContainer;
    }

    /**
     * Get the current code block view state.
     * @param logging If true, the function will log the view state.
     * @returns The current code block view state.
     */
    private getCodeBlockViewState(logging = false): ViewState | undefined {
        const sourceView = this.el.closest('.markdown-source-view');
        const readingView = this.el.closest('.markdown-reading-view');
        if (sourceView) {
            (!logging) ? this.logger?.debug(`CodeBlock View state: 'source'`, `UID: ${this.uid}`) : undefined;
            return "source";
        } else if (readingView) {
            (!logging) ? this.logger?.debug(`CodeBlock View state: 'preview'`, `UID: ${this.uid}`) : undefined;
            return "preview";
        }

        return undefined;
    }
}