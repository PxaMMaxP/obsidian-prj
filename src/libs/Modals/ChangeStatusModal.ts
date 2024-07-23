import { Setting } from 'obsidian';
import API from 'src/classes/API';
import Lng from 'src/classes/Lng';
import { ILogger_ } from 'src/interfaces/ILogger';
import type IMetadataCache from 'src/interfaces/IMetadataCache';
import { IPrj } from 'src/interfaces/IPrj';
import { FileType } from 'src/libs/FileType/FileType';
import { IPrjTaskManagementData } from 'src/models/Data/interfaces/IPrjTaskManagementData';
import PrjBaseData from 'src/models/Data/PrjBaseData';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import { CustomModal } from './Modal/CustomModal';
import { Inject } from '../DependencyInjection/decorators/Inject';
import { Resolve } from '../DependencyInjection/functions/Resolve';
import { StatusTypes } from '../StatusType/interfaces/IStatusType';

/**
 * Represents a modal to change the status of a project.
 */
export default class ChangeStatusModal extends CustomModal {
    newStatus: StatusTypes;
    model: PrjTaskManagementModel<
        IPrjTaskManagementData & PrjBaseData<unknown>
    >;
    @Inject('IMetadataCache')
    private readonly _IMetadataCache: IMetadataCache;

    /**
     * Creates a new instance of the modal.
     */
    constructor() {
        //super(Resolve<IApp>('IApp'));
        super();
    }

    /**
     * Opens the modal.
     */
    override open(): void {
        const workspace = this._IApp.workspace;
        const activeFile = workspace.getActiveFile();

        if (!activeFile) {
            return;
        }
        const activeFileMetadata = this._IMetadataCache.getEntry(activeFile);
        const type = activeFileMetadata?.metadata.frontmatter?.type;

        if (!FileType.isValidOf(type, ['Topic', 'Project', 'Task'])) {
            return;
        }

        const model =
            API.prjTaskManagementModel.getCorospondingModel(activeFile);

        if (!model) {
            return;
        }
        this.model = model;
        super.open();
    }

    /**
     * Initializes the modal.
     */
    onOpen(): void {
        const contentEl = this._content;
        this.setTitle(Lng.gt('Change Status'));

        new Setting(contentEl)
            .setName(Lng.gt('New Status'))
            .addDropdown((cb) => {
                cb.addOption('Active', Lng.gt('StatusActive'));
                cb.addOption('Waiting', Lng.gt('StatusWaiting'));
                cb.addOption('Later', Lng.gt('StatusLater'));
                cb.addOption('Someday', Lng.gt('StatusSomeday'));
                cb.addOption('Done', Lng.gt('StatusDone'));
                cb.setValue(this.model.data.status?.toString() ?? 'Active');

                cb.onChange((value) => {
                    this.newStatus = value as StatusTypes;
                });
            });

        new Setting(contentEl).addButton((btn) =>
            btn
                .setButtonText(Lng.gt('Change Status'))
                .setCta()
                .onClick(() => {
                    this.model.changeStatus(this.newStatus);
                    this.close();
                }),
        );
    }

    /**
     * Closes the modal.
     */
    onClose(): void {
        // const { contentEl } = this;
        // contentEl.empty();
    }

    /**
     * Registers the command to open the modal
     * @remarks No cleanup needed
     */
    public static registerCommand(): void {
        const plugin = Resolve<IPrj>('IPrj');

        const logger =
            Resolve<ILogger_>('ILogger_').getLogger('ChangeStatusModal');

        logger.trace("Registering 'CreateNewMetadataModal' commands");

        plugin.addCommand({
            id: 'change-prj-status',
            name: Lng.gt('Change Status'),
            /**
             * Opens the modal to change the status of a project.
             * @returns Nothing
             */
            callback: () => new ChangeStatusModal().open(),
        });
    }
}
