import { TFile } from "obsidian";
import Global from "src/classes/Global";
import { PrjTaskManagementModel } from "src/models/PrjTaskManagementModel";
import { ProjectModel } from "src/models/ProjectModel";
import { TaskModel } from "src/models/TaskModel";
import { TopicModel } from "src/models/TopicModel";
import ProjectData from "src/types/ProjectData";
import TaskData from "src/types/TaskData";
import TopicData from "src/types/TopicData";

export default class StaticPrjTaskManagementModel {
    public static getCorospondingModel(file: TFile): (PrjTaskManagementModel<TaskData | TopicData | ProjectData>) | undefined {
        const entry = Global.getInstance().metadataCache.getEntry(file);
        if (!entry) {
            return undefined;
        }
        const type = entry.metadata.frontmatter?.type
        if (!type) {
            return undefined;
        }
        switch (type) {
            case "Topic":
                return new TopicModel(entry.file) as PrjTaskManagementModel<TopicData>;
                break;
            case "Project":
                return new ProjectModel(entry.file) as PrjTaskManagementModel<ProjectData>;
                break;
            case "Task":
                return new TaskModel(entry.file) as PrjTaskManagementModel<TaskData>;
                break;
            default:
                break;
        }
    }
}
