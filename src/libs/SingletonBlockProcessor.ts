import { MarkdownPostProcessorContext } from 'obsidian';
import { ILogger } from 'src/interfaces/ILogger';
import CustomizableRenderChild from './CustomizableRenderChild';

/**
 * Type for the view state.
 */
export type ViewState = 'source' | 'preview';

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
 * const singleToneBlock = singletonBlockProcessor.singletoneContainer;
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
    private logger: ILogger | undefined;
    private _uid: string;
    private _el: HTMLElement;
    private _ctx: MarkdownPostProcessorContext;
    private _singletonContainer: HTMLElement | undefined;
    private _observer: MutationObserver | undefined;
    private _onUnload: () => void;
    private _observerChild: CustomizableRenderChild | undefined;

    /**
     * Get the singletone container for the block.
     * @remarks - Use this container for all your block content.
     * - Register a component with **this** container.
     */
    public get singletoneContainer(): HTMLElement {
        this._singletonContainer =
            this._singletonContainer ?? this.getSingletoneContainer();

        return this._singletonContainer;
    }

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
        return this._el.closest('.workspace-leaf-content') ?? undefined;
    }

    /**
     * Get the current workspace leaf state.
     */
    private get workspaceLeafState(): string | undefined {
        return (
            this.workspaceLeafContent?.getAttribute('data-mode') ?? undefined
        );
    }

    /**
     * Get all sibling blocks with the uis as id.
     */
    private get siblingBlocks(): NodeListOf<Element> | undefined {
        return this.workspaceLeafContent?.querySelectorAll(`#${this._uid}`);
    }

    /**
     * Get the source sibling block.
     */
    private get sourceSiblingBlock(): Element | undefined {
        return (
            this.workspaceLeafContent?.querySelector(
                `#${this._uid}[data-mode='source']`,
            ) ?? undefined
        );
    }

    /**
     * Get the preview sibling block.
     */
    private get previewSiblingBlock(): Element | undefined {
        return (
            this.workspaceLeafContent?.querySelector(
                `#${this._uid}[data-mode='preview']`,
            ) ?? undefined
        );
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
        logger?: ILogger,
    ) {
        this.logger = logger ?? undefined;
        this._uid = uid;
        this._el = el;
        this._ctx = ctx;
        this._onUnload = this.onUnloadCallback.bind(this);
        this.createObserver();
    }

    /**
     * Callback for the unload event.
     * @remarks Disconnect the observer.
     */
    private onUnloadCallback(): void {
        this.logger?.debug(`On Unload, UID: ${this._uid}`);
        this._observer?.disconnect();
    }

    /**
     * Check if the block is the only one in the workspace leaf.
     * @returns True if the block is the only one in the workspace leaf.
     * @remarks If the block is the only one in the workspace leaf, create a new block.
     */
    public checkForSiblingBlocks(): boolean {
        const blockViewState = this.codeBlockViewState;
        const viewState = this.workspaceLeafState;

        if (
            blockViewState === viewState &&
            this.siblingBlocks &&
            this.siblingBlocks.length == 1
        ) {
            return true;
        } else {
            const source = this.sourceSiblingBlock;
            const preview = this.previewSiblingBlock;

            return !this.moveChildrenToCorrespondingViewState(
                blockViewState,
                source,
                preview,
            );
        }

        return true;
    }

    private createObserver(): void {
        if (!this.workspaceLeafContent) {
            return;
        }

        // If a sibling block is available, we dont need to create an observer
        // because one observer is enough for all sibling blocks.
        if (this.siblingBlocks && this.siblingBlocks.length === 1) {
            // This test is certainly not sufficient.
            // We now check whether the other container has child elements. If not, we unload it to unload the observer.
            // After that we clone the container and append it to the parent again to use it as a new container.
            if (this.siblingBlocks[0].childNodes.length === 0) {
                const clone = this.siblingBlocks[0].cloneNode(false);
                const parent = this.siblingBlocks[0].parentElement;
                this.siblingBlocks[0].remove();
                parent?.append(clone);
            } else {
                return;
            }
        }

        // Create a observer component. To `disconnect` the observer on unload.
        this._observerChild = new CustomizableRenderChild(
            this.singletoneContainer,
            undefined,
            this._onUnload,
            this.logger,
        );

        this._observer = new MutationObserver((mutations) => {
            this.logger?.trace(
                'Observer detect changes:',
                mutations,
                `UID: ${this._uid}`,
            );

            for (const mutation of mutations) {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'data-mode'
                ) {
                    const newViewState = this.workspaceLeafState;
                    const source = this.sourceSiblingBlock;
                    const preview = this.previewSiblingBlock;

                    this.moveChildrenToCorrespondingViewState(
                        newViewState,
                        source,
                        preview,
                    );
                }
            }
        });

        this._observer.observe(this.workspaceLeafContent, {
            attributes: true,
        });

        // Add the observer component to the context.
        this._observerChild.load();
        this._ctx.addChild(this._observerChild);
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
        preview: Element | undefined,
    ): boolean {
        if (blockViewState === 'source' && source && preview) {
            this.logger?.debug('Move preview to source', `UID: ${this._uid}`);

            return this.moveChilds(preview, source);
        } else if (blockViewState === 'preview' && source && preview) {
            this.logger?.debug('Move source to preview', `UID: ${this._uid}`);

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
            const child = from.firstChild;

            if (child.childNodes.length > 0) {
                elementsMoved = true;
                to.appendChild(child);
            } else {
                this.logger?.warn('Child has no child nodes', child);
                from.removeChild(child);
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
    private getSingletoneContainer(): HTMLElement {
        const singletoneContainer = document.createElement('div');
        singletoneContainer.id = this._uid;

        singletoneContainer.setAttribute(
            'data-mode',
            this.getCodeBlockViewState(true) ?? 'none',
        );

        return singletoneContainer;
    }

    /**
     * Get the current code block view state.
     * @param logging If true, the function will log the view state.
     * @returns The current code block view state.
     */
    private getCodeBlockViewState(logging = false): ViewState | undefined {
        const sourceView = this._el.closest('.markdown-source-view');
        const readingView = this._el.closest('.markdown-reading-view');

        if (sourceView) {
            !logging
                ? this.logger?.debug(
                      `CodeBlock View state: 'source'`,
                      `UID: ${this._uid}`,
                  )
                : undefined;

            return 'source';
        } else if (readingView) {
            !logging
                ? this.logger?.debug(
                      `CodeBlock View state: 'preview'`,
                      `UID: ${this._uid}`,
                  )
                : undefined;

            return 'preview';
        }

        return undefined;
    }
}
