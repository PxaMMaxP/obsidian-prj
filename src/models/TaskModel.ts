import { TFile } from 'obsidian';
import TaskData from 'src/types/TaskData';
import { PrjTaskManagementModel } from './PrjTaskManagementModel';
import API from 'src/classes/API';
import ProjectData from 'src/types/ProjectData';
import TopicData from 'src/types/TopicData';
import Tags from 'src/libs/Tags';
import { Status } from 'src/types/PrjTypes';
import Logging from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';
import Helper from 'src/libs/Helper';

export class TaskModel extends PrjTaskManagementModel<TaskData> {
    protected logger: ILogger = Logging.getLogger('TaskModel');

    public get relatedTasks(): TaskModel[] {
        this._relatedTasks = this._relatedTasks ?? this.getRelatedTasks();

        return this._relatedTasks;
    }

    private _relatedTasks: TaskModel[] | null | undefined = undefined;

    constructor(file: TFile | undefined) {
        super(file, TaskData);
    }

    public override get urgency(): number {
        return API.prjTaskManagementModel.calculateUrgency(
            this as PrjTaskManagementModel<TaskData | TopicData | ProjectData>,
        );
    }

    /**private calculateUrgency(): number {
        const taskSiblings = this.getRelatedTasks((status) => status ? status !== 'Done' : false);
    }**/

    private getRelatedTasks(
        status?: (status: Status | undefined) => boolean,
    ): TaskModel[] {
        const filesWithSameTags = this.metadataCache.cache.filter((file) => {
            const fileTags = Tags.getValidTags(
                file.metadata?.frontmatter?.tags,
            );
            const thisTags = this.tags;

            return (
                fileTags.some((tag) => thisTags.includes(tag)) &&
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

    public override getAutomaticFilename(): string | undefined {
        const automaticFilename = super.getAutomaticFilename();
        const history = this.data.history?.first();

        if (!history) {
            return automaticFilename;
        }

        const date = Helper.formatDate(
            history.date,
            this.global.settings.dateFormat,
        );

        const newFileName = Helper.sanitizeFilename(
            `${date} - ${automaticFilename}`,
        );

        return newFileName;
    }
}
