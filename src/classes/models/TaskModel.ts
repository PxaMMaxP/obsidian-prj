// Note: TaskModel class

import { TFile } from "obsidian";
import TaskData from "../TaskData";
import { BaseModel } from "./BaseModel";
import IPrjModel from "../interfaces/IPrjModel";

export class TaskModel extends BaseModel<TaskData> implements IPrjModel<TaskData> {

    constructor(file: TFile) {
        super(file, TaskData);
    }

    public get data(): Partial<TaskData> {
        return this._data;
    }
    public set data(value: Partial<TaskData>) {
        this._data = value;
    }
}

