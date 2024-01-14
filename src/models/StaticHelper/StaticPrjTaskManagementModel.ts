import { TFile } from "obsidian";
import Global from "src/classes/Global";
import { Status } from "src/types/PrjTypes";
import ProjectData from "src/types/ProjectData";
import TaskData from "src/types/TaskData";
import TopicData from "src/types/TopicData";
import { PrjTaskManagementModel } from "../PrjTaskManagementModel";
import { ProjectModel } from "../ProjectModel";
import { TaskModel } from "../TaskModel";
import { TopicModel } from "../TopicModel";

/**
 * Represents a static helper class for managing project task models.
 */
export class StaticPrjTaskManagementModel {
    /**
     * Retrieves the corresponding model based on the file type.
     * @param file The file for which to retrieve the corresponding model.
     * @returns The corresponding model if found, otherwise undefined.
     */
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
                return undefined;
                break;
        }
    }

    /**
     * Sorts the models by urgency descending
     * @param documents Array of DocumentModels to sort
     * @remarks This function sorts the array in place
     * @see {@link statusToNumber}
     * @see {@link calculateUrgency}
     * @see {@link getLastHistoryDate}
     * @remarks The sorting is done as follows:
     * - If both are `done`, sort by last history entry
     * - If `a` or `b` is done, sort it lower
     * - Both are not done, sort by urgency
     * - Both have the same urgency, sort by status
     * - Both have the same status, sort by priority
     * - Fallback to sorting by last history entry
     * - Fallback to stop sorting
     */
    public static sortModelsByUrgency(models: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>)[]): void {
        models.sort((a, b) => {
            // If both are `done`, sort by last history entry
            const aDate = StaticPrjTaskManagementModel.getLastHistoryDate(a);
            const bDate = StaticPrjTaskManagementModel.getLastHistoryDate(b);
            if (a.data.status === 'Done' && b.data.status === 'Done') {
                if (aDate && bDate) {
                    return bDate.getTime() - aDate.getTime();
                }
            }

            // If `a` is done, sort it lower
            if (a.data.status === 'Done') {
                return 1;
            }
            // If `b` is done, sort it lower
            if (b.data.status === 'Done') {
                return -1;
            }

            // Both are not done, sort by urgency
            const aUrgency = StaticPrjTaskManagementModel.calculateUrgency(a);
            const bUrgency = StaticPrjTaskManagementModel.calculateUrgency(b);
            if (bUrgency !== aUrgency) {
                return bUrgency - aUrgency;
            }

            // Both have the same urgency, sort by status
            const aStatus = StaticPrjTaskManagementModel.statusToNumber(a.data.status);
            const bStatus = StaticPrjTaskManagementModel.statusToNumber(b.data.status);
            if (bStatus !== aStatus) {
                return bStatus - aStatus;
            }

            // Both have the same status, sort by priority
            const aPrirority = a.data.priority ?? 0;
            const bPrirority = b.data.priority ?? 0;
            if (bPrirority !== aPrirority) {
                return bPrirority - aPrirority;
            }

            // Fallback to sorting by last history entry
            if (aDate && bDate) {
                return bDate.getTime() - aDate.getTime();
            }

            // Fallback to stop sorting
            return 0;
        });
    }

    /**
    * Returns the number representation of the status.
    * @param status The status to convert.
    * @returns The number representation of the status.
    * @remarks The number representation is:
    * - `Active` = 3
    * - `Waiting` = 2
    * - `Later` = 1
    * - `Someday` = 0
    * - `undefined` = -1
    */
    private static statusToNumber(status: Status | undefined | null): number {
        switch (status) {
            case 'Active':
                return 3;
            case 'Waiting':
                return 2;
            case 'Later':
                return 1;
            case 'Someday':
                return 0;
            default:
                return -1;
        }
    }

    /**
     * Calculates the urgency of the model.
     * @param model The model to calculate the urgency for.
     * @returns The urgency of the model.
     * @remarks The urgency is calculated as follows:
     * - No `status` or `status` is 'Done' = -2
     * - No `due` or `status` is 'Someday' = -1
     * - Due date is today or in the past = 3
     * - Due date is in the next 3 days = 2
     * - Due date is in the next 7 days = 1
     * - Due date is in more the future = 0
     */
    public static calculateUrgency(model: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>)): number {
        if (!model.data.status || model.data.status === 'Done') {
            return -2;
        }
        if (!model.data.due || model.data.status === 'Someday') {
            return -1;
        }

        const dueDate = new Date(model.data.due);
        dueDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const differenceInDays = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

        let urgency = 0;

        if (differenceInDays <= 0) {
            urgency = 3;
        } else if (differenceInDays <= 3) {
            urgency = 2;
        } else if (differenceInDays <= 7) {
            urgency = 1;
        }

        return urgency;
    }

    /**
     * Returns the date of the last history entry.
     * @param model The model to get the last history entry date from.
     * @returns The date of the last history entry.
     */
    private static getLastHistoryDate(model: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>)): Date | null {
        if (model.data.history && Array.isArray(model.data.history) && model.data.history.length > 0) {
            const history = model.data.history;
            const lastEntry = history[history.length - 1];
            return new Date(lastEntry.date);
        } else {
            return null;
        }
    }
}
