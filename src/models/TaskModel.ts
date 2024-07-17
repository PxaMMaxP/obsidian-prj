import { TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Path } from 'src/classes/Path';
import type { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { HelperGeneral } from 'src/libs/Helper/General';
import { Lifecycle } from 'src/libs/LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from 'src/libs/LifecycleManager/interfaces/ILifecycleManager';
import { Tags } from 'src/libs/Tags/Tags';
import { Status } from 'src/types/PrjTypes';
import PrjTaskData from './Data/PrjTaskData';
import { PrjTaskManagementModel } from './PrjTaskManagementModel';
// @import-me
/**
 * Represents a task.
 */
@Lifecycle
@ImplementsStatic<ILifecycleObject>()
export class TaskModel extends PrjTaskManagementModel<PrjTaskData> {
    /**
     * Initializes the model.
     */
    public static onLoad(): void {
        TaskModel.registerThisModelFactory();
    }

    /**
     * Registers the TaskModel at the PrjTaskManagementModel.
     */
    private static registerThisModelFactory(): void {
        // eslint-disable-next-line no-console
        console.debug('Registering `TaskModel` at `PrjTaskManagementModel`');

        PrjTaskManagementModel.registerModelFactory(
            'Task',
            (file: TFile) => new TaskModel(file),
        );
    }

    /**
     * The related tasks.
     * @deprecated This method is deprecated and will be removed in a future version.
     */
    public get relatedTasks(): TaskModel[] {
        // eslint-disable-next-line deprecation/deprecation
        this._relatedTasks = this._relatedTasks ?? this.getRelatedTasks();

        return this._relatedTasks;
    }

    private _relatedTasks: TaskModel[] | null | undefined = undefined;

    /**
     * Creates a new instance of the TaskModel.
     * @param file The file to create the TaskModel from.
     * @param dependencies The optional dependencies to use.
     */
    constructor(file: TFile | undefined, dependencies?: IDIContainer) {
        super(file, PrjTaskData, dependencies);
    }

    /**
     * Returns the related tasks.
     * @param status A delegate to filter the tasks by status.
     * @returns The related tasks.
     * @deprecated This method is deprecated and will be removed in a future version.
     */
    private getRelatedTasks(
        status?: (status: Status | undefined) => boolean,
    ): TaskModel[] {
        const filesWithSameTags = this._metadataCache.cache.filter((file) => {
            const fileTags = new Tags(file.metadata?.frontmatter?.tags);
            const thisTags = this.data.tags;

            return (
                fileTags.some((tag) => thisTags?.includes(tag) ?? false) &&
                file.file.basename !== this.file.basename &&
                file.metadata?.frontmatter?.type === 'Task' &&
                (status ? status(file.metadata?.frontmatter?.status) : true)
            );
        });

        const relatedTasks: TaskModel[] = [];

        filesWithSameTags.forEach((file) => {
            if (file instanceof TFile) {
                relatedTasks.push(new TaskModel(file));
            }
        });

        return relatedTasks;
    }

    /**
     * Returns the acronym for the task.
     * @returns The acronym for the task:
     * - `t` as prefix.
     * - The first three characters of the title.
     */
    public override getAcronym(): string {
        return HelperGeneral.generateAcronym(this.data.title as string, 4, 't');
    }

    /**
     * Returns the automatic filename for the task.
     * @returns The automatic filename for the task:
     */
    public override getAutomaticFilename(): string | undefined {
        if (!this.data.title && this.data.description) {
            const firstDescriptionLine = this.data.description.split('\n')[0];
            this.data.title = firstDescriptionLine.replace(/\.*$/, '');
        }
        const automaticFilename = super.getAutomaticFilename();
        const history = this.data.history?.first();

        if (!history) {
            return automaticFilename;
        }

        const date = HelperGeneral.formatDate(
            history.date,
            this._pluginSettings.dateFormat,
        );

        const newFileName = Path.sanitizeFilename(
            `${date} - ${automaticFilename}`,
        );

        return newFileName;
    }
}
