// Note: TaskModel class

import { TFile } from "obsidian";
import TaskData from "../types/TaskData";
import { BaseModel } from "./BaseModel";
import IPrjModel from "../interfaces/IPrjModel";

export class TaskModel extends BaseModel<TaskData> implements IPrjModel<TaskData> {

    constructor(file: TFile) {
        super(file, TaskData, undefined);
    }

    public get data(): Partial<TaskData> {
        return this._data;
    }
    public set data(value: Partial<TaskData>) {
        this._data = value;
    }
}

