import { Modal, Setting } from "obsidian";
import Lng from "src/classes/Lng";
import { Status } from "src/types/PrjTypes";
import Helper from "../Helper";
import { PrjTaskManagementModel } from "src/models/PrjTaskManagementModel";
import ProjectData from "src/types/ProjectData";
import TaskData from "src/types/TaskData";
import TopicData from "src/types/TopicData";
import Global from "src/classes/Global";

export default class ChangeStatusModal extends Modal {
    newStatus: Status;
    model: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>);
    onSubmit: (newStatus: Status, file: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>)) => void;

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
        const model = PrjTaskManagementModel.api.getCorospondingModel(activeFile);
        if (!model) {
            return;
        }
        this.model = model;
        super.open();
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: Lng.gt("Change Status") });

        new Setting(contentEl)
            .setName(Lng.gt("New Status"))
            .addDropdown((cb) => {
                cb.addOption("Active", Lng.gt("StatusActive"));
                cb.addOption("Waiting", Lng.gt("StatusWaiting"));
                cb.addOption("Later", Lng.gt("StatusLater"));
                cb.addOption("Someday", Lng.gt("StatusSomeday"));
                cb.addOption("Done", Lng.gt("StatusDone"));
                cb.setValue(this.model.data.status ?? "Active");
                cb.onChange((value) => {
                    this.newStatus = value as Status;
                });
            });

        new Setting(contentEl)
            .addButton((btn) =>
                btn.setButtonText(Lng.gt("Change"))
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.model.changeStatus(this.newStatus);
                    }));
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
        global.logger.trace("Registering 'CreateNewMetadataModal' commands");
        global.plugin.addCommand({
            id: "change-prj-status",
            name: Lng.gt("Change Status"),
            callback: () => new ChangeStatusModal().open()
        });
    }
}
