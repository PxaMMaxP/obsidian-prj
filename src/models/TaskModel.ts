import { TFile } from "obsidian";
import TaskData from "src/types/TaskData";
import { PrjTaskManagementModel } from "./PrjTaskManagementModel";
import API from "src/classes/API";
import ProjectData from "src/types/ProjectData";
import TopicData from "src/types/TopicData";
import Tag from "src/libs/Tag";
import { Status } from "src/types/PrjTypes";

export class TaskModel extends PrjTaskManagementModel<TaskData> {
    public get relatedTasks(): TaskModel[] {
        this._relatedTasks = this._relatedTasks ?? this.getRelatedTasks()
        return this._relatedTasks;
    }

    private _relatedTasks: TaskModel[] | null | undefined = undefined;

    constructor(file: TFile | undefined) {
        super(file, TaskData);
    }

    public override get urgency(): number {
        return API.prjTaskManagementModel.calculateUrgency(this as (PrjTaskManagementModel<TaskData | TopicData | ProjectData>));
    }

    /**private calculateUrgency(): number {
        const taskSiblings = this.getRelatedTasks((status) => status ? status !== 'Done' : false);
    }**/

    private getRelatedTasks(status?: (status: Status | undefined) => boolean): TaskModel[] {
        const filesWithSameTags = this.metadataCache.cache.filter((file) => {
            const fileTags = Tag.getValidTags(file.metadata?.frontmatter?.tags);
            const thisTags = this.tags;
            return (fileTags.some((tag) => thisTags.includes(tag)))
                && (file.file.basename !== this.file.basename)
                && (file.metadata?.frontmatter?.type === 'Task')
                && (status ? status(file.metadata?.frontmatter?.status) : true);
        });

        const relatedTasks: TaskModel[] = [];
        filesWithSameTags.forEach((file) => {
            if (file instanceof TFile) {
                relatedTasks.push(new TaskModel(file));
            }
        });

        return relatedTasks;
    }
}