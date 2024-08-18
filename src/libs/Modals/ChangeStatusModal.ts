import { Setting } from 'obsidian';
import API from 'src/classes/API';
import Lng from 'src/classes/Lng';
import type { IApp } from 'src/interfaces/IApp';
import { ILogger_ } from 'src/interfaces/ILogger';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { IPrj } from 'src/interfaces/IPrj';
import { FileType } from 'src/libs/FileType/FileType';
import { IPrjTaskManagementData } from 'src/models/Data/interfaces/IPrjTaskManagementData';
import PrjBaseData from 'src/models/Data/PrjBaseData';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import { Inject } from 'ts-injex';
import { resolve } from 'ts-injex';
import type { IModal, IModal_ } from './CustomModal/interfaces/IModal';
import { StatusTypes } from '../StatusType/interfaces/IStatusType';

/**
 * Represents a modal to change the status of a project.
 */
export default class ChangeStatusModal {
    @Inject('IApp')
    protected readonly _IApp!: IApp;
    @Inject('IMetadataCache')
    private readonly _IMetadataCache!: IMetadataCache;
    @Inject('IModal_')
    private readonly _ICustomModal_!: IModal_;

    private readonly _customModal: IModal = new this._ICustomModal_();

    private _selectedStatus: StatusTypes;
    private _activeModel: PrjTaskManagementModel<
        IPrjTaskManagementData & PrjBaseData<unknown>
    >;

    /**
     * Creates and opens a Change Status modal.
     */
    constructor() {
        this._customModal
            .setBackgroundDimmed(true)
            .setDraggableEnabled(false)
            .setShouldOpen(this.shouldOpen.bind(this))
            .setOnOpen(this._onOpen.bind(this))
            .open();
    }

    /**
     * Checks if the active file is a project file
     * @returns True if the active file is a project file
     */
    private shouldOpen(): boolean {
        const workspace = this._IApp.workspace;
        const activeFile = workspace.getActiveFile();

        if (!activeFile) {
            return false;
        }
        const activeFileMetadata = this._IMetadataCache.getEntry(activeFile);
        const type = activeFileMetadata?.metadata.frontmatter?.type;

        if (!FileType.isValidOf(type, ['Topic', 'Project', 'Task'])) {
            return false;
        }

        const model =
            API.prjTaskManagementModel.getCorospondingModel(activeFile);

        if (!model) {
            return false;
        }
        this._activeModel = model;

        return true;
    }

    /**
     * Build the content of the change status modal
     */
    private _onOpen(): void {
        const contentEl = this._customModal.content;
        this._customModal.setTitle(Lng.gt('Change Status'));

        new Setting(contentEl)
            .setName(Lng.gt('New Status'))
            .addDropdown((cb) => {
                cb.addOption('Active', Lng.gt('StatusActive'));
                cb.addOption('Waiting', Lng.gt('StatusWaiting'));
                cb.addOption('Later', Lng.gt('StatusLater'));
                cb.addOption('Someday', Lng.gt('StatusSomeday'));
                cb.addOption('Done', Lng.gt('StatusDone'));

                cb.setValue(
                    this._activeModel.data.status?.toString() ?? 'Active',
                );

                cb.onChange((value) => {
                    this._selectedStatus = value as StatusTypes;
                });
            });

        new Setting(contentEl).addButton((btn) =>
            btn
                .setButtonText(Lng.gt('Change Status'))
                .setCta()
                .onClick(() => {
                    this._activeModel.changeStatus(this._selectedStatus);
                    this._customModal.close();
                }),
        );
    }

    /**
     * Registers the command to open the modal
     */
    public static registerCommand(): void {
        const plugin = resolve<IPrj>('IPrj');

        const logger = resolve<ILogger_>('ILogger_', false)?.getLogger(
            'ChangeStatusModal',
        );

        try {
            plugin.addCommand({
                id: 'change-prj-status',
                name: Lng.gt('Change Status'),
                callback: () => new ChangeStatusModal(),
            });
            logger?.trace("Registered 'Change Status' command successfully");
        } catch (error) {
            logger?.error("Failed to register 'Change Status' command", error);
        }
    }
}
