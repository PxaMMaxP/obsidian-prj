import { FrontMatterCache, MarkdownRenderer, TFile } from 'obsidian';
import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import { IProcessorSettings } from 'src/interfaces/IProcessorSettings';
import Logging from 'src/classes/Logging';
import RedrawableBlockRenderComponent from './RedrawableBlockRenderComponent';
import CustomizableRenderChild from '../CustomizableRenderChild';
import EditableDataView from '../EditableDataView/EditableDataView';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import { Status } from 'src/types/PrjTypes';
import API from 'src/classes/API';
import IPrjData from 'src/interfaces/IPrjData';
import IPrjTaskManagement from 'src/interfaces/IPrjTaskManagement';
import { Tags } from '../Tags/Tags';
import { TagFactory } from '../Tags/TagFactory';
import Tag from '../Tags/Tag';
import { TagTree } from '../Tags/types/TagTree';

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
export default class HeaderBlockRenderComponent
    implements RedrawableBlockRenderComponent
{
    private _app = Global.getInstance().app;
    private _global = Global.getInstance();
    private logger = Logging.getLogger('HeaderBlockRenderComponent');
    private _metadataCache = this._global.metadataCache;
    private _model:
        | PrjTaskManagementModel<IPrjData & IPrjTaskManagement>
        | undefined;

    private _processorSettings: IProcessorSettings;
    private _childComponent: CustomizableRenderChild;
    private _activeFileDebounceTimer: NodeJS.Timeout;

    private _headerContainer: HTMLElement | undefined;

    /**
     * The path of the file in which the block is located.
     */
    private get path(): string {
        return this._processorSettings.source;
    }

    /**
     * Sets the path value.
     *
     * @param value - The new path value.
     */
    private set path(value: string) {
        this._processorSettings.source = value;
        this._model = undefined;
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
        return this._childComponent;
    }

    /**
     * The title of the Prj File.
     */
    private get title(): string | undefined {
        return this.model?.data.title ?? undefined;
    }

    /**
     * Sets the title of the Prj File.
     */
    private set title(value: string | null | undefined) {
        if (this.model) this.model.data.title = value;
    }

    /**
     * The status of the Prj File.
     */
    private get status(): Status | undefined {
        return this.model?.data.status ?? undefined;
    }

    /**
     * Sets the status of the Prj File.
     */
    private set status(value: Status | undefined) {
        if (this.model) this.model.changeStatus(value);
    }

    /**
     * The description of the Prj File.
     */
    private get description(): string | undefined {
        return this.model?.data.description ?? undefined;
    }

    /**
     * Sets the description of the Prj File.
     */
    private set description(value: string | null | undefined) {
        if (this.model) this.model.data.description = value;
    }

    /**
     * The model of the Prj File.
     */
    private get model():
        | PrjTaskManagementModel<IPrjData & IPrjTaskManagement>
        | undefined {
        if (this._model) return this._model;

        if (!this.file) return undefined;

        this._model = API.prjTaskManagementModel.getCorospondingModel(
            this.file,
        );

        return this._model;
    }

    /**
     * Sets the model of the Prj File.
     * @remarks This function is used to set the model to undefined.
     */
    private set model(
        value:
            | PrjTaskManagementModel<IPrjData & IPrjTaskManagement>
            | undefined,
    ) {
        this._model = value;
    }

    /**
     * The file in which the block is located.
     */
    private get file(): TFile | undefined {
        return this._metadataCache.getEntryByPath(this.path)?.file;
    }

    /**
     * The frontmatter of the Prj File.
     */
    private get frontmatter(): FrontMatterCache | undefined {
        return (
            this._metadataCache.getEntryByPath(this.path)?.metadata
                ?.frontmatter ?? undefined
        );
    }

    /**
     * The tags of the Prj File.
     */
    private get tags(): Tags {
        return new Tags(
            this.frontmatter?.tags,
            this._metadataCache,
            new TagFactory(),
        );
    }

    constructor(settings: IProcessorSettings) {
        this._processorSettings = settings;
        this.onUnload = this.onUnload.bind(this);
        this.redraw = this.redraw.bind(this);

        this.onDocumentChangedMetadata =
            this.onDocumentChangedMetadata.bind(this);

        this.onPathChanged = this.onPathChanged.bind(this);

        this._childComponent = new CustomizableRenderChild(
            this.container,
            () => this.onLoad(),
            () => this.onUnload(),
            this.logger,
        );
        this._childComponent.load();
        this._processorSettings.ctx.addChild(this._childComponent);
        this.parseSettings();
    }

    /**
     * The `onLoad` function which is linked to the `onload` event in the `CustomizableRenderChild` class.
     * @remarks This function is called when the block is loaded and register the `prj-task-management-file-changed` event.
     */
    private onLoad(): void {
        this._metadataCache.on(
            'prj-task-management-file-changed-event',
            this.onDocumentChangedMetadata,
        );

        this._metadataCache.on('file-rename-event', this.onPathChanged);
    }

    /**
     * The `onUnload` function which is linked to the `onunload` event in the `CustomizableRenderChild` class.
     * @remarks This function is called when the block is unloaded and unregister the `prj-task-management-file-changed` event.
     */
    private onUnload(): void {
        this._metadataCache.off(
            'prj-task-management-file-changed-event',
            this.onDocumentChangedMetadata,
        );

        this._metadataCache.off('file-rename-event', this.onPathChanged);
    }

    /**
     * Redraws the HeaderBlockRenderComponent.
     * @remarks - This function is called when the `prj-task-management-file-changed` event is fired.
     * - The function emptys the `headerContainer`, clear the stored `model` and calls the `build` function.
     */
    public async redraw(): Promise<void> {
        try {
            this.headerContainer?.empty();
            this.model = undefined;
            await this.build();
        } catch (error) {
            this.logger.error(
                `Error while redrawing HeaderBlockRenderComponent: ${error}`,
            );
        }
    }

    /**
     * The `prj-task-management-file-changed` event handler.
     * @param file The file which has changed.
     * @remarks - This function is called when the `prj-task-management-file-changed` event is fired.
     * - The function checks if the file is the file in which the block is located and calls the `redraw` function.
     */
    private onDocumentChangedMetadata(file: TFile): void {
        if (file.path === this.path) {
            this.redraw();
        }
    }

    /**
     * The `file-rename-event` event handler.
     * @param file Contains `{ oldPath: string; newPath: string }` of the file which has changed.
     */
    private onPathChanged(file: { oldPath: string; newPath: string }): void {
        if (file.oldPath === this.path) {
            this.path = file.newPath;
            this.redraw();
        }
    }

    /**
     * Builds the HeaderBlockRenderComponent.
     */
    public async build(): Promise<void> {
        try {
            if (this.title) this.headerContainer.append(this.createTitle());

            if (this.status) this.headerContainer.append(this.createStatus());

            if (this.tags.length > 0)
                this.headerContainer.append(this.createTags());

            if (this.description)
                this.headerContainer.append(this.createDescription());

            if (this.headerContainer.childElementCount !== 0)
                this.headerContainer.append(this.createSeparatorLine());

            this.container.append(this.headerContainer);
        } catch (error) {
            this.logger.error(
                `Error while building HeaderBlockRenderComponent: ${error}`,
            );
        }
    }

    /**
     * Creates a separator line as a DocumentFragment.
     *
     * @returns The created separator line as a DocumentFragment.
     */
    private createSeparatorLine(): DocumentFragment {
        const separatorLineDiv = document.createElement('div');

        MarkdownRenderer.render(
            this._app,
            `---`,
            separatorLineDiv,
            this.path,
            this.component,
        );

        return this.createDocumentFragment(separatorLineDiv);
    }

    /**
     * Creates the title of the Prj File.
     * @returns The title of the Prj File.
     */
    private createTitle(): DocumentFragment {
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('title');

        new EditableDataView(titleDiv, this._childComponent).addText((text) =>
            text
                .setValue(this.title ?? '')
                .setTitle(Lng.gt('Title'))
                .setPlaceholder(Lng.gt('Title'))
                .enableEditability()
                .setRenderMarkdown()
                .onSave((value: string) => {
                    this.title = value;

                    return Promise.resolve();
                }),
        );

        return this.createDocumentFragment(titleDiv);
    }

    /**
     * Creates the status of the Prj File.
     * @returns The status of the Prj File.
     */
    private createStatus(): DocumentFragment {
        const statusDiv = document.createElement('div');
        statusDiv.classList.add('status');

        const statusLabel = document.createElement('p');
        statusLabel.classList.add('status-label');
        statusLabel.innerText = `${Lng.gt('Status')}: `;

        new EditableDataView(statusDiv, this._childComponent).addDropdown(
            (dropdown) =>
                dropdown
                    .setOptions([
                        { value: 'Active', text: Lng.gt('StatusActive') },
                        { value: 'Waiting', text: Lng.gt('StatusWaiting') },
                        { value: 'Later', text: Lng.gt('StatusLater') },
                        { value: 'Someday', text: Lng.gt('StatusSomeday') },
                        { value: 'Done', text: Lng.gt('StatusDone') },
                    ])
                    .setTitle(Lng.gt('Status'))
                    .setValue(this.status ?? '')
                    .onSave(async (value) => {
                        this.status = value as Status;
                    })
                    .enableEditability()
                    .setFormator((value: string) => {
                        const status = Lng.gt(`Status${value}`);

                        return { text: `${status}`, html: undefined };
                    })
                    .then((value) => {
                        // Add status label
                        value.firstChild
                            ? value.insertBefore(statusLabel, value.firstChild)
                            : value.appendChild(statusLabel);

                        // Find presentation span (.textarea-presentation)
                        // and add class cm-strong (bold)
                        const presentationSpan =
                            value.querySelector('.text-presentation');
                        presentationSpan?.addClass('cm-strong');
                    }),
        );

        return this.createDocumentFragment(statusDiv);
    }

    /**
     * Creates a document fragment for the description.
     * @returns The created document fragment.
     */
    private createDescription(): DocumentFragment {
        const descriptionDiv = document.createElement('div');
        descriptionDiv.classList.add('description');

        new EditableDataView(descriptionDiv, this._childComponent).addTextarea(
            (textarea) =>
                textarea
                    .setValue(this.description ?? '')
                    .setTitle(Lng.gt('Description'))
                    .setPlaceholder(Lng.gt('Description'))
                    .enableEditability()
                    .setRenderMarkdown()
                    .onSave((value: string) => {
                        this.description = value;

                        return Promise.resolve();
                    }),
        );

        return this.createDocumentFragment(descriptionDiv);
    }

    /**
     * Creates the tags of the Prj File as a tag tree.
     * @param tagTree The tag tree to create the tags from.
     * @param path The path of the tag. On first call, this parameter is not needed.
     * @returns The tags of the Prj File as a tag tree.
     */
    private createDomList(tagTree: TagTree, path = ''): HTMLElement {
        const ul = document.createElement('ul');

        for (const tagString in tagTree) {
            const fullTagString = path ? `${path}/${tagString}` : tagString;
            const fullTag = new Tag(fullTagString, this._metadataCache);
            const tag = new Tag(tagString, this._metadataCache);
            const li = document.createElement('li');

            const tagLink = fullTag.getObsidianLink(
                path ? fullTag.toString() : tag.tagWithHash,
            );

            li.appendChild(tagLink);
            const subTags = tagTree[tagString];
            const hasSubTags = Object.keys(subTags).length > 0;

            if (hasSubTags) {
                li.appendChild(this.createDomList(subTags, fullTagString));
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
        labelDiv.textContent = `${Lng.gt('Tags')}:`;

        const tagTree = this.tags.getTagTree();
        const tagsList = this.createDomList(tagTree);
        tagsDiv.appendChild(tagsList);

        return this.createDocumentFragment(tagsDiv);
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

    /**
     * Parses the settings of the block.
     * @remarks This function is called in the constructor.
     */
    private parseSettings(): void {
        if (
            !this._processorSettings.options ||
            this._processorSettings.options.length === 0
        )
            return;

        this._processorSettings.options.forEach((option) => {
            switch (option.label) {
                case 'watchActiveFile':
                    if (option.value === 'true') {
                        // Register event to update the header when the active file changes
                        this.component.registerEvent(
                            this._global.app.workspace.on(
                                'active-leaf-change',
                                () => this.onActiveFileChange.bind(this)(),
                            ),
                        );
                    }
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * Handles the event when the active file changes.
     * If the active file is not in the "Ressourcen/Panels/" path,
     * it updates the `path` in the instance and calls the `onActiveFileDebounce` function.
     * @private
     */
    private onActiveFileChange(): void {
        const activeFile = this._global.app.workspace.getActiveFile();

        if (activeFile && !activeFile.path.contains('Ressourcen/Panels/')) {
            this.logger.trace('Active file changed: ', activeFile.path);

            if (this.path !== activeFile.path) {
                this.path = activeFile.path;
                this.onActiveFileDebounce();
            }
        }
    }

    /**
     * Debounces the active file change event and triggers a redraw after a delay.
     */
    private onActiveFileDebounce(): void {
        this.logger.trace('Active file changed: Debouncing');
        clearTimeout(this._activeFileDebounceTimer);

        this._activeFileDebounceTimer = setTimeout(async () => {
            this.redraw();
        }, 750);
    }
}
