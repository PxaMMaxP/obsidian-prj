import { TFile, moment } from "obsidian";
import { BaseModel } from "./BaseModel";
import IPrjModel from "../interfaces/IPrjModel";
import IPrjData from "../interfaces/IPrjData";
import IPrjTaskManagement from "../interfaces/IPrjTaskManagement";
import PrjTypes, { Status } from "src/types/PrjTypes";
import ProjectData from "src/types/ProjectData";
import TaskData from "src/types/TaskData";
import TopicData from "src/types/TopicData";
import StaticPrjTaskManagementModel from "./StaticHelper/StaticPrjTaskManagementModel";

export class PrjTaskManagementModel<T extends IPrjData & IPrjTaskManagement> extends BaseModel<T> implements IPrjModel<T> {
    /**
     * Static API for PrjTaskManagementModel
     */
    public static api = StaticPrjTaskManagementModel;

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
     * Check if the `newStatus` is valid and change the status of the model.
     * @param newStatus The new status to set.
     * @remarks - A history entry will be added if the status changes.
     * - This function will start and finish a transaction if no transaction is currently running.
     */
    public changeStatus(newStatus: unknown): void {
        const status = PrjTypes.isValidStatus(newStatus);
        if (!status) return;
        if (this.data.status !== status) {
            let internalTransaction = false;
            if (!this.isTransactionActive) {
                this.startTransaction();
                internalTransaction = true;
            }
            this.data.status = status;
            this.addHistoryEntry(status);
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



    public getUrgency(): number {
        return StaticPrjTaskManagementModel.calculateUrgency(this as (PrjTaskManagementModel<TaskData | TopicData | ProjectData>));
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


}
