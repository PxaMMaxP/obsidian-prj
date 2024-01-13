import { TFile } from "obsidian";
import TaskData from "src/types/TaskData";
import { PrjTaskManagementModel } from "./PrjTaskManagementModel";

export class TaskModel extends PrjTaskManagementModel<TaskData> {

    constructor(file: TFile | undefined) {
        super(file, TaskData);
    }


}