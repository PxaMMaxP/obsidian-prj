import IPrjData from "../interfaces/IPrjData";
import { FileType } from "./PrjTypes";

export default class NoteData implements IPrjData {
    type: FileType | null | undefined;
    title: string | null | undefined;
    description: string | null | undefined;
    date: string | null | undefined;
    tags: string[] | string | null | undefined;

    constructor(data: Partial<NoteData>) {
        if (!data) {
            this.type = "Note";
            return;
        }
        this.title = data.title !== undefined ? data.title : undefined;
        this.description = data.description !== undefined ? data.description : undefined;
        this.date = data.date !== undefined ? data.date : undefined;
        this.tags = data.tags !== undefined ? data.tags : undefined;
        this.type = data.type !== undefined ? data.type : "Note";
    }


}
