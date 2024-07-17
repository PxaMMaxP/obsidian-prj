import { Modal, Setting } from 'obsidian';
import API from 'src/classes/API';
import Global from 'src/classes/Global';
import Lng from 'src/classes/Lng';
import { Logging } from 'src/classes/Logging';
import { FileType } from 'src/libs/FileType/FileType';
import { IPrjTaskManagementData } from 'src/models/Data/interfaces/IPrjTaskManagementData';
import PrjBaseData from 'src/models/Data/PrjBaseData';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import { Status } from 'src/types/PrjTypes';

/**
 * Represents a modal to change the status of a project.
 */
export default class ChangeStatusModal extends Modal {
    newStatus: Status;
    model: PrjTaskManagementModel<
        IPrjTaskManagementData & PrjBaseData<unknown>
    >;
    private _metadataCache = Global.getInstance().metadataCache;

    /**
     * Creates a new instance of the modal.
     */
    constructor() {
        super(Global.getInstance().app);
    }

    /**
     * Opens the modal.
     */
    override open() {
        const workspace = this.app.workspace;
        const activeFile = workspace.getActiveFile();

        if (!activeFile) {
            return;
        }
        const activeFileMetadata = this._metadataCache.getEntry(activeFile);
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
    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: Lng.gt('Change Status') });

        new Setting(contentEl)
            .setName(Lng.gt('New Status'))
            .addDropdown((cb) => {
                cb.addOption('Active', Lng.gt('StatusActive'));
                cb.addOption('Waiting', Lng.gt('StatusWaiting'));
                cb.addOption('Later', Lng.gt('StatusLater'));
                cb.addOption('Someday', Lng.gt('StatusSomeday'));
                cb.addOption('Done', Lng.gt('StatusDone'));
                cb.setValue(this.model.data.status ?? 'Active');

                cb.onChange((value) => {
                    this.newStatus = value as Status;
                });
            });

        new Setting(contentEl).addButton((btn) =>
            btn
                .setButtonText(Lng.gt('Change Status'))
                .setCta()
                .onClick(() => {
                    this.close();
                    this.model.changeStatus(this.newStatus);
                }),
        );
    }

    /**
     * Closes the modal.
     */
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    /**
     * Registers the command to open the modal
     * @remarks No cleanup needed
     */
    public static registerCommand(): void {
        const global = Global.getInstance();
        const logger = Logging.getLogger('ChangeStatusModal');
        logger.trace("Registering 'CreateNewMetadataModal' commands");

        global.plugin.addCommand({
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
