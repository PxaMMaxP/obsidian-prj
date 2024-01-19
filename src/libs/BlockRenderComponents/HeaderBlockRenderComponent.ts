import { FrontMatterCache, MarkdownRenderer, TFile } from "obsidian";
import Global from "src/classes/Global";
import Lng from "src/classes/Lng";
import { IProcessorSettings } from "src/interfaces/IProcessorSettings";
import Tags, { TagTree } from "../Tags";
import Logging from "src/classes/Logging";
import RedrawableBlockRenderComponent from "./RedrawableBlockRenderComponent";
import CustomizableRenderChild from "../CustomizableRenderChild";

/**
 * Header Block Render Component class.
 * Renders the header of the Prj File with
 * - the title,
 * - the status,
 * - the tags as a tag tree
 * - and the description.
 * @remarks This header watches the `prj-task-management-file-changed` event
 * and redraws the header when the event is fired and the file is the file in which the block is located.
 */
export default class HeaderBlockRenderComponent implements RedrawableBlockRenderComponent {
    private app = Global.getInstance().app;
    private global = Global.getInstance();
    private logger = Logging.getLogger("HeaderBlockRenderComponent");
    private metadataCache = this.global.metadataCache;

    private _processorSettings: IProcessorSettings;
    private childComponent: CustomizableRenderChild;

    private placeholder = '🗌';

    private _headerContainer: HTMLElement | undefined;

    /**
     * The path of the file in which the block is located.
     */
    private get path(): string {
        return this._processorSettings.source;
    }

    /**
     * The container of the block.
     */
    private get container(): HTMLElement {
        return this._processorSettings.container;
    }

    /**
     * The header container of this HeaderBlockRenderComponent.
     * @remarks - This container is used to append the title, status and tags.
     * - If the container is not set, the function creates a new container.
     */
    private get headerContainer(): HTMLElement {
        if (!this._headerContainer) {
            this._headerContainer = document.createElement('div');
            this._headerContainer.addClass('header-block-component');
        }
        return this._headerContainer;
    }

    /**
     * The component of this HeaderBlockRenderComponent.
     */
    private get component(): CustomizableRenderChild {
        return this.childComponent;
    }

    /**
     * The title of the Prj File.
     */
    private get title(): string {
        return this.frontmatter?.title ?? this.placeholder;
    }

    /**
     * The status of the Prj File.
     */
    private get status(): string {
        return this.frontmatter?.status ?? this.placeholder;
    }

    private get description(): string {
        return this.frontmatter?.description ?? this.placeholder;
    }

    /**
     * The frontmatter of the Prj File.
     */
    private get frontmatter(): FrontMatterCache | undefined {
        return this.metadataCache.getEntryByPath(this.path)?.metadata?.frontmatter ?? undefined;
    }

    /**
     * The tags of the Prj File.
     */
    private get tags(): Array<string> {
        return Tags.getValidTags(this.frontmatter?.tags ?? []);
    }

    constructor(settings: IProcessorSettings) {
        this._processorSettings = settings;
        this.onUnload = this.onUnload.bind(this);
        this.redraw = this.redraw.bind(this);
        this.onDocumentChangedMetadata = this.onDocumentChangedMetadata.bind(this);
        this.childComponent = new CustomizableRenderChild(
            this.container,
            () => this.onLoad(),
            () => this.onUnload(),
            this.logger);
        this.childComponent.load();
        this._processorSettings.ctx.addChild(this.childComponent);

    }

    /**
     * The `onLoad` function which is linked to the `onload` event in the `CustomizableRenderChild` class.
     * @remarks This function is called when the block is loaded and register the `prj-task-management-file-changed` event.
     */
    private onLoad(): void {
        this.metadataCache.on('prj-task-management-file-changed', this.onDocumentChangedMetadata);
    }

    /**
     * The `onUnload` function which is linked to the `onunload` event in the `CustomizableRenderChild` class.
     * @remarks This function is called when the block is unloaded and unregister the `prj-task-management-file-changed` event.
     */
    private onUnload(): void {
        this.metadataCache.off('prj-task-management-file-changed', this.onDocumentChangedMetadata);
    }

    /**
     * Redraws the HeaderBlockRenderComponent.
     * @remarks - This function is called when the `prj-task-management-file-changed` event is fired.
     * - The function emptys the `headerContainer` and calls the `build` function.
     */
    public async redraw(): Promise<void> {
        try {
            this.headerContainer?.empty();
            await this.build();
        } catch (error) {
            this.logger.error(`Error while redrawing HeaderBlockRenderComponent: ${error}`);
        }
    }

    /**
     * The `prj-task-management-file-changed` event handler.
     * @param file The file which has changed.
     * @remarks - This function is called when the `prj-task-management-file-changed` event is fired.
     * - The function checks if the file is the file in which the block is located and calls the `redraw` function.
     */
    private onDocumentChangedMetadata(file: TFile): undefined {
        if (file.path === this.path) {
            this.redraw();
        }
    }

    /**
     * Builds the HeaderBlockRenderComponent.
     */
    public async build(): Promise<void> {
        try {
            this.headerContainer.append(this.createTitle());
            this.headerContainer.append(this.createStatus());
            this.headerContainer.append(this.createTags());
            this.headerContainer.append(this.createDescription());
            this.container.append(this.headerContainer);
        } catch (error) {
            this.logger.error(`Error while building HeaderBlockRenderComponent: ${error}`);
        }
    }

    /**
     * Creates the title of the Prj File.
     * @returns The title of the Prj File.
     */
    private createTitle(): DocumentFragment {
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('title');

        MarkdownRenderer.render(this.app, `# ${this.title}`, titleDiv, this.path, this.component);

        return this.createDocumentFragment(titleDiv);
    }

    /**
     * Creates the status of the Prj File.
     * @returns The status of the Prj File.
     */
    private createStatus(): DocumentFragment {
        const statusDiv = document.createElement('div');
        statusDiv.classList.add('status');

        MarkdownRenderer.render(this.app, `${Lng.gt("Status")}: **${this.status}**`, statusDiv, this.path, this.component);

        return this.createDocumentFragment(statusDiv);
    }

    /**
     * Creates the tags of the Prj File as a tag tree.
     * @param tagTree The tag tree to create the tags from.
     * @param path The path of the tag. On first call, this parameter is not needed.
     * @returns The tags of the Prj File as a tag tree.
     */
    private createDomList(tagTree: TagTree, path = ''): HTMLElement {
        const ul = document.createElement('ul');

        for (const tag in tagTree) {
            const fullPath = path ? `${path}/${tag}` : tag;
            const li = document.createElement('li');
            const tagLink = Tags.createObsidianTagLink(path ? tag : `#${tag}`, fullPath);
            li.appendChild(tagLink);
            const subTags = tagTree[tag];
            const hasSubTags = Object.keys(subTags).length > 0;

            if (hasSubTags) {
                li.appendChild(this.createDomList(subTags, fullPath));
            }

            ul.appendChild(li);
        }

        return ul;
    }

    /**
     * Creates the tags of the Prj File.
     * @returns The tags of the Prj File.
     */
    private createTags(): DocumentFragment {
        const tagsDiv = document.createElement('div');
        tagsDiv.classList.add('tag-tree');

        const labelDiv = document.createElement('div');
        tagsDiv.appendChild(labelDiv);
        labelDiv.classList.add('tag-label');
        labelDiv.textContent = `${Lng.gt("Tags")}:`;

        const tagTree = Tags.createTagTree(this.tags);
        const tagsList = this.createDomList(tagTree);
        tagsDiv.appendChild(tagsList);

        return this.createDocumentFragment(tagsDiv);
    }

    private createDescription(): DocumentFragment {
        const descriptionDiv = document.createElement('div');
        descriptionDiv.classList.add('description');

        MarkdownRenderer.render(this.app, `${this.description}`, descriptionDiv, this.path, this.component);

        return this.createDocumentFragment(descriptionDiv);
    }

    /**
     * Creates a document fragment with the given element as a child.
     * @param element The element to append to the document fragment.
     * @returns The document fragment with the given element as a child.
     */
    private createDocumentFragment(element: HTMLElement): DocumentFragment {
        const documentFragment = new DocumentFragment();
        documentFragment.append(element);
        return documentFragment;
    }

}
