import { IFormResult, FormConfiguration, Field } from "src/types/ModalFormType";
import BaseModalForm from "./BaseModalForm";
import Lng from "src/classes/Lng";
import Helper from "../Helper";
import Global from "src/classes/Global";
import PrjTypes, { } from "src/types/PrjTypes";
import { TFile } from "obsidian";
import path from "path";
import { PrjTaskManagementModel } from "src/models/PrjTaskManagementModel";
import ProjectData from "src/types/ProjectData";
import TaskData from "src/types/TaskData";
import TopicData from "src/types/TopicData";

export default class CreateNewTaskManagementModal extends BaseModalForm {
    constructor() {
        super();
    }

    public async openForm(): Promise<IFormResult | undefined> {
        if (!this.isApiAvailable()) return;
        this.logger.trace("Opening 'CreateNewTaskManagementModal' form");
        const activeFile = Helper.getActiveFile();
        const tags: string[] = BaseModalForm.getTags(activeFile);
        const form = this.constructForm();
        const result = await this.getApi().openForm(form, { values: { tags: tags } });
        this.logger.trace(`From closes with status '${result.status}' and data:`, result.data);
        return result;
    }

    public async evaluateForm(result: IFormResult): Promise<(PrjTaskManagementModel<TaskData | TopicData | ProjectData>) | undefined> {
        if (result.status !== "ok" || !result.data) return;

        (result.data.title ?? (() => { this.logger.error("No title provided"); return; })());
        (result.data.tags ?? (() => { this.logger.error("No tags provided"); return; })());

        let model: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>);
        let modelFolderPath = "";
        let templateFilePath: string | undefined;
        let acronym: string;

        switch (result.data.type) {
            case "Topic":
                model = new PrjTaskManagementModel<TopicData>(undefined, TopicData);
                templateFilePath = this.global.settings.prjSettings.topicTemplate;
                modelFolderPath = this.global.settings.prjSettings.topicFolder;
                acronym = Helper.generateAcronym(result.data.title as string);
                break;
            case "Project":
                model = new PrjTaskManagementModel<ProjectData>(undefined, ProjectData);
                templateFilePath = this.global.settings.prjSettings.projectTemplate;
                modelFolderPath = this.global.settings.prjSettings.projectFolder;
                acronym = Helper.generateAcronym(result.data.title as string);
                break;
            case "Task":
                model = new PrjTaskManagementModel<TaskData>(undefined, TaskData);
                templateFilePath = this.global.settings.prjSettings.taskTemplate;
                modelFolderPath = this.global.settings.prjSettings.taskFolder;
                acronym = Helper.generateAcronym(result.data.title as string, 3, "t");
                break;
            default:
                this.logger.error("No valid type provided");
                return;
        }

        const mainTag = {
            tag: undefined as string | undefined,
            postfix: undefined as number | undefined,
            get fullTag() {
                return this.tag + (this.postfix ? this.postfix : "");
            }
        };
        const baseTag = this.settings.baseTag;
        result.data.tags = (result.data.tags as string[]).map((tag, index) => {
            if (index === 0) {
                if (tag.startsWith(baseTag)) {
                    mainTag.tag = `${tag}/${acronym}`
                } else {
                    mainTag.tag = `${baseTag}/${tag}/${acronym}`;
                }
                while (Helper.existTag(mainTag.fullTag)) {
                    if (!mainTag.postfix) { mainTag.postfix = 0; }
                    this.logger.warn(`Tag '${mainTag.fullTag}' already exists`);
                }
                return mainTag.fullTag;
            }
            return tag;
        });

        (mainTag.tag ?? (() => { this.logger.error("No main tag provided"); return; })());

        model.data.title = result.data.title as string;
        model.data.description = result.data.description as string ?? undefined;
        model.changeStatus(result.data.status);
        model.data.priority = PrjTypes.isValidPriority(result.data.priority);
        model.data.energy = PrjTypes.isValidEnergy(result.data.energy);
        model.data.due = result.data.dueDate as string ?? undefined;

        model.data.tags = result.data.tags as string[];
        model.data.aliases = [`#${mainTag.fullTag}`];

        const modelFile = {
            filepath: `${modelFolderPath}`,
            filename: `${acronym} - ${result.data.title}`,
            postfix: undefined as number | undefined,
            extension: `.md`,
            file: undefined as TFile | undefined,
            get fullPath() {
                return path.join(this.filepath, this.filename + (this.postfix ? this.postfix : "") + this.extension);
            }
        };

        /**
         * Check if file already exists and add postfix if needed.
         */
        modelFile.file = this.app.vault.getAbstractFileByPath(modelFile.fullPath) as TFile;
        if (modelFile.file) {
            modelFile.postfix = 0;
            while (modelFile.file) {
                this.logger.warn(`File '${modelFile.fullPath}' already exists`);
                modelFile.postfix++;
                modelFile.file = this.app.vault.getAbstractFileByPath(modelFile.fullPath) as TFile;
            }
        }

        /**
         * If a template is provided, use it to create the file.
         */
        let template = "";
        if (templateFilePath) {
            const templateFile = this.app.vault.getAbstractFileByPath(templateFilePath);
            if (templateFile && templateFile instanceof TFile) {
                try {
                    template = await this.app.vault.read(templateFile);
                } catch (error) {
                    this.logger.error(`Error reading template file '${templateFile.path}'`, error);
                }
            }
        }

        const file = await this.app.vault.create(modelFile.fullPath, template);
        model.file = file;

        return model;
    }

    protected constructForm(): FormConfiguration {
        const form: FormConfiguration = {
            title: `${Lng.gt("New")} ${Lng.gt("Project")}`,
            name: "new proejct file",
            customClassname: "",
            fields: []
        };

        // Type
        const type: Field = {
            name: "type",
            label: Lng.gt("Type"),
            description: Lng.gt("TypeDescription"),
            isRequired: true,
            input: {
                type: "select",
                source: "fixed",
                options: [
                    { value: "Topic", label: Lng.gt("Topic") },
                    { value: "Project", label: Lng.gt("Project") },
                    { value: "Task", label: Lng.gt("Task") }
                ]
            }
        };
        form.fields.push(type);

        // Title
        const title: Field = {
            name: "title",
            label: Lng.gt("Titel"),
            description: Lng.gt("TitelDescription"),
            isRequired: true,
            input: {
                type: "text"
            }
        };
        form.fields.push(title);

        // Description
        const description: Field = {
            name: "description",
            label: Lng.gt("Description"),
            description: Lng.gt("DescriptionDescription"),
            isRequired: false,
            input: {
                type: "textarea"
            }
        };
        form.fields.push(description);

        // Status
        const status: Field = {
            name: "status",
            label: Lng.gt("Status"),
            description: Lng.gt("StatusDescription"),
            isRequired: true,
            input: {
                type: "select",
                "source": "fixed",
                options: [
                    { label: Lng.gt("StatusActive"), value: "Active" },
                    { label: Lng.gt("StatusWaiting"), value: "Waiting" },
                    { label: Lng.gt("StatusLater"), value: "Later" },
                    { label: Lng.gt("StatusSomeday"), value: "Someday" },
                    { label: Lng.gt("StatusDone"), value: "Done" }
                ]
            }
        };
        form.fields.push(status);

        // Priority
        const priority: Field = {
            name: "priority",
            label: Lng.gt("Priority"),
            description: Lng.gt("PriorityDescription"),
            isRequired: false,
            input: {
                type: "slider",
                min: 0,
                max: 3
            }
        };
        form.fields.push(priority);

        // Energy
        const energy: Field = {
            name: "energy",
            label: Lng.gt("Energy"),
            description: Lng.gt("EnergyDescription"),
            isRequired: false,
            input: {
                type: "slider",
                min: 0,
                max: 3
            }
        };
        form.fields.push(energy);

        // Due Date
        const dueDate: Field = {
            name: "dueDate",
            label: Lng.gt("DueDate"),
            description: Lng.gt("DueDateDescription"),
            isRequired: false,
            input: {
                type: "date"
            }
        };
        form.fields.push(dueDate);

        // Tags
        const tags: Field = {
            name: "tags",
            label: Lng.gt("Tags"),
            description: Lng.gt("TagsDescription"),
            isRequired: false,
            input: {
                type: "tag"
            }
        };
        form.fields.push(tags);

        // Acronym
        const acronym: Field = {
            name: "acronym",
            label: Lng.gt("Acronym"),
            description: Lng.gt("AcronymDescription"),
            isRequired: false,
            input: {
                type: "document_block",
                body: "if (form.type === \"Task\") return app.plugins.plugins.prj.api.helper.generateAcronym(form.title,3,'t'); else return app.plugins.plugins.prj.api.helper.generateAcronym(form.title);"
            }
        };
        form.fields.push(acronym);

        return form;
    }

    /**
     * Registers the command to open the modal
     * @remarks No cleanup needed
     */
    public static registerCommand(): void {
        const global = Global.getInstance();
        global.logger.trace("Registering 'CreateTaskManagementModal' commands");
        global.plugin.addCommand({
            id: "create-new-task-management-file",
            name: `${Lng.gt("New")} ${Lng.gt("Topic")}/${Lng.gt("Project")}/${Lng.gt("Task")}`,
            callback: async () => {
                const modal = new CreateNewTaskManagementModal();
                const result = await modal.openForm();
                if (result) {
                    const prj = await modal.evaluateForm(result);
                    if (prj)
                        await Helper.openFile(prj.file);
                }
            },
        })
    }

}