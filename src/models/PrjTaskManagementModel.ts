import { TFile, moment } from "obsidian";
import { BaseModel } from "./BaseModel";
import IPrjModel from "../interfaces/IPrjModel";
import IPrjData from "../interfaces/IPrjData";
import IPrjTaskManagement from "../interfaces/IPrjTaskManagement";
import { Status } from "src/types/PrjTypes";
import ProjectData from "src/types/ProjectData";
import TaskData from "src/types/TaskData";
import TopicData from "src/types/TopicData";

export class PrjTaskManagementModel<T extends IPrjData & IPrjTaskManagement> extends BaseModel<T> implements IPrjModel<T> {
    constructor(file: TFile | undefined, ctor: new (data?: Partial<T>) => T) {
        super(file, ctor, undefined);
    }

    public get data(): Partial<T> {
        return this._data;
    }

    public set data(value: Partial<T>) {
        this._data = value;
    }

    public override toString(): string {
        let allText = this.data.title ?? "";
        allText += this.data.description ?? "";
        allText += this.data.status ?? "";
        allText += this.data.due ?? "";
        allText += this.data.tags ?? "";
        return allText;
    }

    public getCorospondingSymbol(): string {
        switch (this.data.type) {
            case 'Topic':
                return this.global.settings.prjSettings.topicSymbol;
            case 'Project':
                return this.global.settings.prjSettings.projectSymbol;
            case 'Task':
                return this.global.settings.prjSettings.taskSymbol;
            default:
                return 'x-circle';
        }
    }

    /**
     * Changes the status of the model and ad a new history entry.
     * @param newStatus The new status to set.
     * @remarks -This function will start and finish a transaction if no transaction is currently running.
     */
    public changeStatus(newStatus: Status): void {
        if (this.data.status !== newStatus) {
            let internalTransaction = false;
            if (!this.isTransactionActive) {
                this.startTransaction();
                internalTransaction = true;
            }
            this.data.status = newStatus;
            this.addHistoryEntry(newStatus);
            if (internalTransaction)
                this.finishTransaction();
        }
    }

    /**
     * Add a new history entry to the model.
     * @param status The status to add to the history. If not provided, the current status of the model will be used. 
     * @remarks - This function will not start or finish a transaction.
     * - If no status is provided and the model has no status, an error will be logged and the function will return.
     */
    private addHistoryEntry(status?: Status | undefined): void {
        if (!status) {
            if (this.data.status)
                status = this.data.status;
            else {
                this.logger.error("No status aviable to add to history");
                return;
            }
        }
        if (!this.data.history)
            this.data.history = [];
        this.data.history.push({
            status: status,
            date: moment().format("YYYY-MM-DDTHH:mm")
        });
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
            const aDate = PrjTaskManagementModel.getLastHistoryDate(a);
            const bDate = PrjTaskManagementModel.getLastHistoryDate(b);
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
            const aUrgency = PrjTaskManagementModel.calculateUrgency(a);
            const bUrgency = PrjTaskManagementModel.calculateUrgency(b);
            if (bUrgency !== aUrgency) {
                return bUrgency - aUrgency;
            }

            // Both have the same urgency, sort by status
            const aStatus = PrjTaskManagementModel.statusToNumber(a.data.status);
            const bStatus = PrjTaskManagementModel.statusToNumber(b.data.status);
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

    public getUrgency(): number {
        return PrjTaskManagementModel.calculateUrgency(this as (PrjTaskManagementModel<TaskData | TopicData | ProjectData>));
    }

    /**
     * Returns the tags of the model as an array of strings
     * @returns Array of strings containing the tags
     */
    public getTags(): string[] {
        const tags = this.data.tags;
        let formattedTags: string[] = [];

        if (tags && typeof tags === 'string') {
            formattedTags = [tags];
        }
        else if (Array.isArray(tags)) {
            formattedTags = [...tags];
        }

        return formattedTags;
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
    private static calculateUrgency(model: (PrjTaskManagementModel<TaskData | TopicData | ProjectData>)): number {
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
