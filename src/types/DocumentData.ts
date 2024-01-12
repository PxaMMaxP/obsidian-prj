import IPrjData from "../interfaces/IPrjData";
import IPrjDocument from "../interfaces/IPrjDocument";
import { YamlKeyMap } from "./YamlKeyMap";
import { FileType, FileSubType } from "./PrjTypes";

export default class DocumentData implements IPrjData, IPrjDocument {
    type: FileType | null | undefined;
    subType: FileSubType | undefined;
    title: string | null | undefined;
    date: string | null | undefined;
    description: string | null | undefined;
    sender: string | null | undefined;
    recipient: string | null | undefined;
    dateOfDelivery: string | null | undefined;
    hide: boolean | null | undefined;
    file: string | null | undefined;
    relatedFiles: string[] | null | undefined;
    citationTitle: string | null | undefined;
    tags: string | string[] | null | undefined;
    annotationTarget: string | null | undefined;
    static yamlKeyMap: YamlKeyMap = {
        "annotationTarget": "annotation-target"
    };

    constructor(data: Partial<DocumentData>) {
        if (!data) return;
        this.title = data.title !== undefined ? data.title : undefined;
        this.date = data.date !== undefined ? data.date : undefined;
        this.description = data.description !== undefined ? data.description : undefined;
        this.sender = data.sender !== undefined ? data.sender : undefined;
        this.recipient = data.recipient !== undefined ? data.recipient : undefined;
        this.dateOfDelivery = data.dateOfDelivery !== undefined ? data.dateOfDelivery : undefined;
        this.hide = data.hide !== undefined ? data.hide : undefined;
        this.file = data.file !== undefined ? data.file : undefined;
        this.relatedFiles = data.relatedFiles !== undefined ? data.relatedFiles : undefined;
        this.citationTitle = data.citationTitle !== undefined ? data.citationTitle : undefined;
        this.tags = data.tags !== undefined ? data.tags : undefined;
        this.type = data.type !== undefined ? data.type : undefined;
        this.subType = data.subType !== undefined ? data.subType : undefined;
        this.annotationTarget = data.annotationTarget !== undefined ? data.annotationTarget : undefined;
    }
}
