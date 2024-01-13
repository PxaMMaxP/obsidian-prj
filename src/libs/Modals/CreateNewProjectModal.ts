import { IFormResult, FormConfiguration, Field } from "src/types/ModalFormType";
import BaseModalForm from "./BaseModalForm";
import Lng from "src/classes/Lng";
import Helper from "../Helper";
import Global from "src/classes/Global";
import { ProjectModel } from "src/models/ProjectModel";
import { Priority, Status } from "src/types/PrjTypes";
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
        const tags: string[] = [];
        if (activeFile) {
            const cache = this.global.metadataCache.getEntry(activeFile);
            if (cache && cache.metadata && cache.metadata.frontmatter && cache.metadata.frontmatter.tags) {
                if (Array.isArray(cache.metadata.frontmatter.tags)) {
                    tags.push(...cache.metadata.frontmatter.tags);
                } else {
                    tags.push(cache.metadata.frontmatter.tags);
                }
            }
        }
        const form = this.constructForm();
        const result = await this.getApi().openForm(form, { values: { tags: tags } });
        this.logger.trace(`From closes with status '${result.status}' and data:`, result.data);
        return result;
    }

    public async evaluateForm(result: IFormResult): Promise<ProjectModel | undefined> {
        if (result.status !== "ok" || !result.data) return;

        if (!result.data.title || typeof result.data.title !== "string") {
            this.logger.error("No title provided");
            return;
        }
        if (!result.data.tags || !Array.isArray(result.data.tags)) {
            this.logger.error("No tags provided");
            return;
        }

        const acronym = Helper.generateAcronym(result.data.title);
        const mainTag = {
            tag: "",
            postfix: 0,
            get fullTag() {
                return this.tag + (this.postfix ? this.postfix : "");
            }
        };
        const baseTag = this.settings.baseTag;
        result.data.tags = result.data.tags.map((tag, index) => {
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

        if (!mainTag.tag) {
            this.logger.error("No main tag provided");
            return;
        }

        const project = new ProjectModel(undefined);

        // Title
        project.data.title = result.data.title;

        // Description
        if (result.data.description && typeof result.data.description === "string") {
            project.data.description = result.data.description;
        }

        // Status
        if (result.data.status && typeof result.data.status === "string") {
            project.changeStatus(result.data.status as Status);
        }

        // Priority
        if (result.data.priority && typeof result.data.priority === "number") {
            project.data.priority = result.data.priority as Priority;
        }

        // Due Date
        if (result.data.dueDate && typeof result.data.dueDate === "string") {
            project.data.due = result.data.dueDate;
        }

        // Tags & Aliases
        project.data.tags = result.data.tags;
        project.data.aliases = [`#${mainTag.fullTag}`];

        const projectFile = {
            filepath: `${this.settings.prjSettings.projectFolder}`,
            filename: `${acronym} - ${result.data.title}`,
            postfix: null as number | null,
            extension: `.md`,
            file: null as TFile | null,
            get fullPath() {
                return path.join(this.filepath, this.filename + (this.postfix ? this.postfix : "") + this.extension);
            }
        };

        projectFile.file = this.app.vault.getAbstractFileByPath(projectFile.fullPath) as TFile;
        if (projectFile.file) {
            projectFile.postfix = 0;
            while (projectFile.file) {
                this.logger.warn(`File '${projectFile.fullPath}' already exists`);
                projectFile.postfix++;
                projectFile.file = this.app.vault.getAbstractFileByPath(projectFile.fullPath) as TFile;
            }
        }

        let template = "";
        if (this.global.settings.prjSettings.projectTemplate) {
            // Read template file:
            const templateFile = this.app.vault.getAbstractFileByPath(this.global.settings.prjSettings.projectTemplate);
            if (templateFile && templateFile instanceof TFile)
                template = await this.app.vault.read(templateFile);
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
