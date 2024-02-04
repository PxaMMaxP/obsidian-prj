import { Modal, Setting } from 'obsidian';
import Lng from 'src/classes/Lng';
import { Status } from 'src/types/PrjTypes';
import Helper from '../Helper';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import Global from 'src/classes/Global';
import API from 'src/classes/API';
import Logging from 'src/classes/Logging';
import IPrjData from 'src/interfaces/IPrjData';
import IPrjTaskManagement from 'src/interfaces/IPrjTaskManagement';

export default class ChangeStatusModal extends Modal {
    newStatus: Status;
    model: PrjTaskManagementModel<IPrjData & IPrjTaskManagement>;

    constructor() {
        super(Global.getInstance().app);
    }

    override open() {
        const workspace = this.app.workspace;
        const activeFile = workspace.getActiveFile();

        if (!activeFile) {
            return;
        } else if (!Helper.isPrjTaskManagementFile(activeFile)) {
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
            callback: () => new ChangeStatusModal().open(),
        });
    }
}
