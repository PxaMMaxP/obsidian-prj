import { App, FrontMatterCache, MarkdownRenderer, TFile } from 'obsidian';
import API from 'src/classes/API';
import Lng from 'src/classes/Lng';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { IProcessorSettings } from 'src/interfaces/IProcessorSettings';
import { IPrjTaskManagementData } from 'src/models/Data/interfaces/IPrjTaskManagementData';
import PrjBaseData from 'src/models/Data/PrjBaseData';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import { Inject } from 'ts-injex';
import RedrawableBlockRenderComponent from './RedrawableBlockRenderComponent';
import CustomizableRenderChild from '../CustomizableRenderChild/CustomizableRenderChild';
import EditableDataView from '../EditableDataView/EditableDataView';
import type { IHelperObsidian } from '../Helper/interfaces/IHelperObsidian';
import { StatusTypes } from '../StatusType/interfaces/IStatusType';
import { ITags } from '../Tags/interfaces/ITags';
import { Tag } from '../Tags/Tag';
import { Tags } from '../Tags/Tags';
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
    @Inject('IApp')
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private readonly _IApp!: App;
    @Inject('IHelperObsidian')
    private readonly _IHelperObsidian!: IHelperObsidian;
    @Inject(
        'ILogger_',
        (x: ILogger_) => x.getLogger('HeaderBlockRenderComponent'),
        false,
    )
    private readonly _logger?: ILogger;
    @Inject('IMetadataCache')
    private readonly _IMetadataCache!: IMetadataCache;
    private _model:
        | PrjTaskManagementModel<IPrjTaskManagementData & PrjBaseData<unknown>>
        | undefined;

    private readonly _processorSettings: IProcessorSettings;
    private readonly _childComponent: CustomizableRenderChild;
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
    private get status(): StatusTypes | undefined {
        return this.model?.data.status?.value ?? undefined;
    }

    /**
     * Sets the status of the Prj File.
     */
    private set status(value: StatusTypes | undefined) {
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
        | PrjTaskManagementModel<IPrjTaskManagementData & PrjBaseData<unknown>>
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
            | PrjTaskManagementModel<
                  IPrjTaskManagementData & PrjBaseData<unknown>
              >
            | undefined,
    ) {
        this._model = value;
    }

    /**
     * The file in which the block is located.
     */
    private get file(): TFile | undefined {
        return this._IMetadataCache.getEntryByPath(this.path)?.file;
    }

    /**
     * The frontmatter of the Prj File.
     */
    private get frontmatter(): FrontMatterCache | undefined {
        return (
            this._IMetadataCache.getEntryByPath(this.path)?.metadata
                ?.frontmatter ?? undefined
        );
    }

    /**
     * The tags of the Prj File.
     */
    private get tags(): ITags {
        return new Tags(this.frontmatter?.tags);
    }

    /**
     * Initializes a new instance of the HeaderBlockRenderComponent.
     * @param settings The settings of the processor.
     */
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
            this._logger,
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
        this._IMetadataCache.on(
            'prj-task-management-file-changed-event',
            this.onDocumentChangedMetadata,
        );

        this._IMetadataCache.on('file-rename-event', this.onPathChanged);
    }

    /**
     * The `onUnload` function which is linked to the `onunload` event in the `CustomizableRenderChild` class.
     * @remarks This function is called when the block is unloaded and unregister the `prj-task-management-file-changed` event.
     */
    private onUnload(): void {
        this._IMetadataCache.off(
            'prj-task-management-file-changed-event',
            this.onDocumentChangedMetadata,
        );

        this._IMetadataCache.off('file-rename-event', this.onPathChanged);
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
            this._logger?.error(
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
     * @param file.oldPath The old path of the file.
     * @param file.newPath The new path of the file.
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
            this._logger?.error(
                `Error while building HeaderBlockRenderComponent: ${error}`,
            );
        }
    }

    /**
     * Creates a separator line as a DocumentFragment.
     * @returns The created separator line as a DocumentFragment.
     */
    private createSeparatorLine(): DocumentFragment {
        const separatorLineDiv = document.createElement('div');

        MarkdownRenderer.render(
            this._IApp,
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

        new EditableDataView(titleDiv, this._childComponent).addText((text) => {
            text.setValue(this.title ?? '')
                .setTitle(Lng.gt('Title'))
                .setPlaceholder(Lng.gt('Title'))
                .enableEditability()
                .setRenderMarkdown()
                .onSave((value: string) => {
                    this.title = value;

                    return Promise.resolve();
                });
        });

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
            (dropdown) => {
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
                        this.status = value as StatusTypes;
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
                    });
            },
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
            (textarea) => {
                textarea
                    .setValue(this.description ?? '')
                    .setTitle(Lng.gt('Description'))
                    .setPlaceholder(Lng.gt('Description'))
                    .enableEditability()
                    .setRenderMarkdown()
                    .onSave((value: string) => {
                        this.description = value;

                        return Promise.resolve();
                    });
            },
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

        for (const tag in tagTree) {
            const fullPath = path ? `${path}/${tag}` : tag;
            const li = document.createElement('li');

            const tagObject = new Tag(fullPath);

            const tagLink = tagObject.getObsidianLink(
                path ? tagObject.getElements().last() : tagObject.tagWithHash,
            );

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
                            this._IApp.workspace.on('active-leaf-change', () =>
                                this.onActiveFileChange.bind(this)(),
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
        const activeFile = this._IHelperObsidian.getActiveFile();

        if (activeFile && !activeFile.path.contains('Ressourcen/Panels/')) {
            this._logger?.trace('Active file changed: ', activeFile.path);

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
        this._logger?.trace('Active file changed: Debouncing');
        clearTimeout(this._activeFileDebounceTimer);

        this._activeFileDebounceTimer = setTimeout(() => {
            this.redraw();
        }, 750);
    }
}
