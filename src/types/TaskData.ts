import IPrjData from "../interfaces/IPrjData";
import IPrjTaskManagement from "../interfaces/IPrjTaskManagement";
import { Status, Priority, Energy, FileSubType, HistoryEntries } from "./PrjTypes";

export default class TaskData implements IPrjData, IPrjTaskManagement {
    type: "Task" | null | undefined;
    subType: FileSubType | null | undefined;
    title: string | null | undefined;
    description: string | null | undefined;
    status: Status | null | undefined;
    priority: Priority | null | undefined;
    energy: Energy | null | undefined;
    due: string | null | undefined;
    tags: string[] | string | null | undefined;
    history: HistoryEntries | null | undefined;
    aliases: string[] | null | undefined;
    sort: number | null | undefined;

    constructor(data: Partial<TaskData>) {
        if (!data) {
            this.type = "Task";
            return;
        }
        this.sort = data.sort !== undefined ? data.sort : undefined;
        this.aliases = data.aliases !== undefined ? data.aliases : undefined;
        this.title = data.title !== undefined ? data.title : undefined;
        this.description = data.description !== undefined ? data.description : undefined;
        this.status = data.status !== undefined ? data.status : undefined;
        this.priority = data.priority !== undefined ? data.priority : undefined;
        this.energy = data.energy !== undefined ? data.energy : undefined;
        this.due = data.due !== undefined ? data.due : undefined;
        this.tags = data.tags !== undefined ? data.tags : undefined;
        this.type = data.type !== undefined ? data.type : "Task";
        this.subType = data.subType !== undefined ? data.subType : undefined;
        this.history = data.history !== undefined ? data.history : undefined;
    }

}
