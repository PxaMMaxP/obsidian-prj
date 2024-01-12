import IPrjData from "../interfaces/IPrjData";
import IPrjTaskManagement from "../interfaces/IPrjTaskManagement";
import { Status, Priority, Energy, FileType, FileSubType, HistoryEntries } from "./PrjTypes";

export default class TopicData implements IPrjData, IPrjTaskManagement {
    type: FileType | null | undefined;
    subType: FileSubType | null | undefined;
    title: string | null | undefined;
    description: string | null | undefined;
    status: Status | null | undefined;
    priority: Priority | null | undefined;
    energy: Energy | null | undefined;
    due: string | null | undefined;
    tags: string[] | string | null | undefined;
    history: HistoryEntries | null | undefined;

    constructor(data: Partial<TopicData>) {
        if (!data) return;
        this.title = data.title !== undefined ? data.title : undefined;
        this.description = data.description !== undefined ? data.description : undefined;
        this.status = data.status !== undefined ? data.status : undefined;
        this.priority = data.priority !== undefined ? data.priority : undefined;
        this.energy = data.energy !== undefined ? data.energy : undefined;
        this.due = data.due !== undefined ? data.due : undefined;
        this.tags = data.tags !== undefined ? data.tags : undefined;
        this.type = data.type !== undefined ? data.type : undefined;
        this.subType = data.subType !== undefined ? data.subType : undefined;
        this.history = data.history !== undefined ? data.history : undefined;
    }

}
