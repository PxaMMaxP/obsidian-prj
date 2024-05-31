import { IFormResult, FormConfiguration, Field } from 'src/types/ModalFormType';
import BaseModalForm from './BaseModalForm';
import Lng from 'src/classes/Lng';
import Helper from '../Helper';
import Global from 'src/classes/Global';
import PrjTypes from 'src/types/PrjTypes';
import { TFile } from 'obsidian';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import ProjectData from 'src/types/ProjectData';
import TaskData from 'src/types/TaskData';
import TopicData from 'src/types/TopicData';
import { Path } from 'src/classes/Path';
import Logging from 'src/classes/Logging';
import Tags from '../Tags';

export default class CreateNewTaskManagementModal extends BaseModalForm {
    constructor() {
        super();
    }

    public async openForm(): Promise<IFormResult | undefined> {
        if (!this.isApiAvailable()) return;
        this.logger.trace("Opening 'CreateNewTaskManagementModal' form");

        // Get active file to extract tags
        const activeFile = Helper.getActiveFile();
        const tags: string[] = Tags.getTagsFromFile(activeFile);

        const form = this.constructForm();

        const result = await this.getApi().openForm(form, {
            values: { tags: tags },
        });

        this.logger.trace(
            `From closes with status '${result.status}' and data:`,
            result.data,
        );

        return result;
    }

    public async evaluateForm(
        result: IFormResult,
    ): Promise<
        PrjTaskManagementModel<TaskData | TopicData | ProjectData> | undefined
    > {
        if (result.status !== 'ok' || !result.data) return;

        result.data.title ??
            (() => {
                this.logger.error('No title provided');

                return;
            })();

        result.data.tags ??
            (() => {
                this.logger.error('No tags provided');

                return;
            })();

        let model: PrjTaskManagementModel<TaskData | TopicData | ProjectData>;
        let modelFolderPath = '';
        let templateFilePath: string | undefined;
        let subTemplatePath: string | undefined;

        switch (result.data.type) {
            case 'Topic':
                model = new PrjTaskManagementModel<TopicData>(
                    undefined,
                    TopicData,
                );

                templateFilePath =
                    this.global.settings.prjSettings.topicTemplate;
                modelFolderPath = this.global.settings.prjSettings.topicFolder;
                break;
            case 'Project':
                model = new PrjTaskManagementModel<ProjectData>(
                    undefined,
                    ProjectData,
                );

                templateFilePath =
                    this.global.settings.prjSettings.projectTemplate;

                modelFolderPath =
                    this.global.settings.prjSettings.projectFolder;

                if (result.data.subtype && result.data.subtype !== '') {
                    subTemplatePath = result.data.subtype as string;
                }
                delete result.data.subtype;
                break;
            case 'Task':
                model = new PrjTaskManagementModel<TaskData>(
                    undefined,
                    TaskData,
                );

                templateFilePath =
                    this.global.settings.prjSettings.taskTemplate;
                modelFolderPath = this.global.settings.prjSettings.taskFolder;

                if (result.data.subtype && result.data.subtype !== '') {
                    subTemplatePath = result.data.subtype as string;
                }
                delete result.data.subtype;
                break;
            default:
                this.logger.error('No valid type provided');

                return;
        }

        model.data.title = result.data.title as string;
        const acronym = model.getAcronym();

        const mainTag = {
            base: undefined as string | undefined,
            tag: undefined as string | undefined,
            postfix: undefined as number | undefined,
            get fullTag() {
                return this.tag + (this.postfix ? this.postfix : '');
            },
        };
        const baseTag = this.settings.baseTag;

        result.data.tags = (result.data.tags as string[]).map((tag, index) => {
            if (index === 0) {
                if (tag.startsWith(baseTag)) {
                    mainTag.base = tag;
                    mainTag.tag = `${tag}` + (acronym ? `/${acronym}` : '');
                } else {
                    mainTag.base = tag;

                    mainTag.tag =
                        `${baseTag}/${tag}` + (acronym ? `/${acronym}` : '');
                }

                while (acronym && Helper.existTag(mainTag.fullTag)) {
                    if (!mainTag.postfix) {
                        mainTag.postfix = 0;
                    }
                    mainTag.postfix++;
                    this.logger.warn(`Tag '${mainTag.fullTag}' already exists`);
                }

                return mainTag.fullTag;
            }

            return tag;
        });

        mainTag.base &&
            result.data.type === 'Task' &&
            result.data.tags.splice(1, 0, mainTag.base);

        if (!mainTag.tag) {
            this.logger.error('No main tag provided');

            return;
        }

        model.data.description =
            (result.data.description as string) ?? undefined;
        model.changeStatus(result.data.status);
        model.data.priority = PrjTypes.isValidPriority(result.data.priority);
        model.data.energy = PrjTypes.isValidEnergy(result.data.energy);
        model.data.due = (result.data.dueDate as string) ?? undefined;

        model.data.tags = result.data.tags as string[];

        model.data.aliases = [`#${mainTag.fullTag}`];

        const modelFile = {
            filepath: `${modelFolderPath}`,
            filename: acronym
                ? `${acronym} - ${result.data.title}`
                : `${result.data.title}`,
            postfix: undefined as number | undefined,
            extension: `.md`,
            file: undefined as TFile | undefined,
            get fullPath() {
                return Path.join(
                    this.filepath,
                    this.filename +
                        (this.postfix ? this.postfix : '') +
                        this.extension,
                );
            },
        };
        modelFile.filename = Helper.sanitizeFilename(modelFile.filename);

        /**
         * Check if file already exists and add postfix if needed.
         */
        modelFile.file = this.app.vault.getAbstractFileByPath(
            modelFile.fullPath,
        ) as TFile;

        if (modelFile.file) {
            modelFile.postfix = 0;

            while (modelFile.file) {
                this.logger.warn(`File '${modelFile.fullPath}' already exists`);
                modelFile.postfix++;

                modelFile.file = this.app.vault.getAbstractFileByPath(
                    modelFile.fullPath,
                ) as TFile;
            }
        }

        /**
         * If a template is provided, use it to create the file.
         */
        let template = '';

        if (subTemplatePath) {
            const subTemplateFile =
                this.app.vault.getAbstractFileByPath(subTemplatePath);

            if (subTemplateFile && subTemplateFile instanceof TFile) {
                try {
                    template = await this.app.vault.read(subTemplateFile);
                } catch (error) {
                    this.logger.error(
                        `Error reading sub template file '${subTemplateFile.path}'`,
                        error,
                    );
                }
            }
        } else if (templateFilePath) {
            const templateFile =
                this.app.vault.getAbstractFileByPath(templateFilePath);

            if (templateFile && templateFile instanceof TFile) {
                try {
                    template = await this.app.vault.read(templateFile);
                } catch (error) {
                    this.logger.error(
                        `Error reading template file '${templateFile.path}'`,
                        error,
                    );
                }
            }
        }

        await model.createFile(
            modelFile.filepath,
            modelFile.filename,
            template,
        );

        return model;
    }

    protected constructForm(): FormConfiguration {
        const form: FormConfiguration = {
            title: `${Lng.gt('New Topic/Project')}`,
            name: 'new task managment file',
            customClassname: '',
            fields: [],
        };

        // Type
        const type: Field = {
            name: 'type',
            label: Lng.gt('Task managment type'),
            description: Lng.gt('Task managment type description'),
            isRequired: true,
            input: {
                type: 'select',
                source: 'fixed',
                options: [
                    { value: 'Topic', label: Lng.gt('Topic') },
                    { value: 'Project', label: Lng.gt('Project') },
                ],
            },
        };
        form.fields.push(type);

        // Title
        const title: Field = {
            name: 'title',
            label: Lng.gt('Title'),
            description: Lng.gt('Title description'),
            isRequired: true,
            input: {
                type: 'text',
            },
        };
        form.fields.push(title);

        // Description
        const description: Field = {
            name: 'description',
            label: Lng.gt('Description'),
            description: Lng.gt('Document description description'),
            isRequired: false,
            input: {
                type: 'textarea',
            },
        };
        form.fields.push(description);

        // Status
        const status: Field = {
            name: 'status',
            label: Lng.gt('Status'),
            description: Lng.gt('Status description'),
            isRequired: true,
            input: {
                type: 'select',
                source: 'fixed',
                options: [
                    { label: Lng.gt('StatusActive'), value: 'Active' },
                    { label: Lng.gt('StatusWaiting'), value: 'Waiting' },
                    { label: Lng.gt('StatusLater'), value: 'Later' },
                    { label: Lng.gt('StatusSomeday'), value: 'Someday' },
                    { label: Lng.gt('StatusDone'), value: 'Done' },
                ],
            },
        };
        form.fields.push(status);

        // Priority
        const priority: Field = {
            name: 'priority',
            label: Lng.gt('Priority'),
            description: Lng.gt('Priority description'),
            isRequired: false,
            input: {
                type: 'slider',
                min: 0,
                max: 3,
            },
        };
        form.fields.push(priority);

        // Energy
        const energy: Field = {
            name: 'energy',
            label: Lng.gt('Energy'),
            description: Lng.gt('Energy description'),
            isRequired: false,
            input: {
                type: 'slider',
                min: 0,
                max: 3,
            },
        };
        form.fields.push(energy);

        // Due Date
        const dueDate: Field = {
            name: 'dueDate',
            label: Lng.gt('Due date'),
            description: Lng.gt('Due date description'),
            isRequired: false,
            input: {
                type: 'date',
            },
        };
        form.fields.push(dueDate);

        // Tags
        const tags: Field = {
            name: 'tags',
            label: Lng.gt('Tags'),
            description: Lng.gt('Tags description'),
            isRequired: false,
            input: {
                type: 'tag',
            },
        };
        form.fields.push(tags);

        // Would you like to open the type specific modal?
        /**const openTypeSpecificModal: Field = {
            name: "openTypeSpecificModal",
            label: Lng.gt("OpenTypeSpecificModal"),
            description: Lng.gt("OpenTypeSpecificModalDescription"),
            isRequired: false,
            input: {
                type: "toggle"
            }
        };
        form.fields.push(openTypeSpecificModal);**/

        // Acronym
        const acronym: Field = {
            name: 'acronym',
            label: Lng.gt('Acronym'),
            description: Lng.gt('Acronym description'),
            isRequired: false,
            input: {
                type: 'document_block',
                body:
                    'if (form.type === "Task") ' +
                    "return app.plugins.plugins.prj.api.helper.generateAcronym(form.title,3,'t');" +
                    ' else ' +
                    'return app.plugins.plugins.prj.api.helper.generateAcronym(form.title);',
            },
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

        Logging.getLogger('CreateNewTaskManagementModal').trace(
            "Registering 'CreateTaskManagementModal' commands",
        );

        global.plugin.addCommand({
            id: 'create-new-task-management-file',
            name: `${Lng.gt('New Topic/Project')}`,
            callback: async () => {
                const modal = new CreateNewTaskManagementModal();
                const result = await modal.openForm();

                if (result) {
                    const prj = await modal.evaluateForm(result);

                    if (prj) await Helper.openFile(prj.file);
                }
            },
        });
    }
}
