import { IFormResult, FormConfiguration, Field } from "src/types/ModalFormType";
import BaseModalForm from "./BaseModalForm";
import Lng from "src/classes/Lng";
import Helper from "../Helper";
import Global from "src/classes/Global";
import { ProjectModel } from "src/models/ProjectModel";
import PrjTypes, { } from "src/types/PrjTypes";
import { TFile } from "obsidian";
import path from "path";

export default class CreateNewProjectModal extends BaseModalForm {
    constructor() {
        super();
    }

    public async openForm(): Promise<IFormResult | undefined> {
        if (!this.isApiAvailable()) return;
        this.logger.trace("Opening 'CreateNewProjectModal' form");
        const activeFile = Helper.getActiveFile();
        const tags: string[] = BaseModalForm.getTags(activeFile);
        const form = this.constructForm();
        const result = await this.getApi().openForm(form, { values: { tags: tags } });
        this.logger.trace(`From closes with status '${result.status}' and data:`, result.data);
        return result;
    }

    public async evaluateForm(result: IFormResult): Promise<ProjectModel | undefined> {
        if (result.status !== "ok" || !result.data) return;

        (result.data.title ?? (() => { this.logger.error("No title provided"); return; })());
        (result.data.tags ?? (() => { this.logger.error("No tags provided"); return; })());

        const acronym = Helper.generateAcronym(result.data.title as string);
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

        const project = new ProjectModel(undefined);

        project.data.title = result.data.title as string;
        project.data.description = result.data.description as string ?? undefined;
        project.changeStatus(result.data.status);
        project.data.priority = PrjTypes.isValidPriority(result.data.priority);
        project.data.due = result.data.dueDate as string ?? undefined;

        project.data.tags = result.data.tags as string[];
        project.data.aliases = [`#${mainTag.fullTag}`];

        const projectFile = {
            filepath: `${this.settings.prjSettings.projectFolder}`,
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
        projectFile.file = this.app.vault.getAbstractFileByPath(projectFile.fullPath) as TFile;
        if (projectFile.file) {
            projectFile.postfix = 0;
            while (projectFile.file) {
                this.logger.warn(`File '${projectFile.fullPath}' already exists`);
                projectFile.postfix++;
                projectFile.file = this.app.vault.getAbstractFileByPath(projectFile.fullPath) as TFile;
            }
        }

        /**
         * If a template is provided, use it to create the file.
         */
        let template = "";
        if (this.global.settings.prjSettings.projectTemplate) {
            const templateFile = this.app.vault.getAbstractFileByPath(this.global.settings.prjSettings.projectTemplate);
            if (templateFile && templateFile instanceof TFile) {
                try {
                    template = await this.app.vault.read(templateFile);
                } catch (error) {
                    this.logger.error(`Error reading template file '${templateFile.path}'`, error);
                }
            }
        }

        const file = await this.app.vault.create(projectFile.fullPath, template);
        project.file = file;

        return project;
    }

    protected constructForm(): FormConfiguration {
        const form: FormConfiguration = {
            title: `${Lng.gt("New")} ${Lng.gt("Project")}`,
            name: "new proejct file",
            customClassname: "",
            fields: []
        };

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
                body: "return app.plugins.plugins.prj.api.helper.generateAcronym(form.title);"
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
        global.logger.trace("Registering 'CreateNewProjectModal' commands");
        global.plugin.addCommand({
            id: "create-new-project-file",
            name: `${Lng.gt("New")} ${Lng.gt("Project")}`,
            callback: async () => {
                const modal = new CreateNewProjectModal();
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
