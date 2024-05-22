import IPrjData from '../interfaces/IPrjData';
import IPrjDocument from '../interfaces/IPrjDocument';
import { YamlKeyMap } from './YamlKeyMap';
import { FileType, FileSubType } from './PrjTypes';
import { toStringField } from 'src/classes/ToStringFieldDecorator';
import BaseData from './BaseData';

export default class DocumentData
    extends BaseData
    implements IPrjData, IPrjDocument
{
    type: FileType | null | undefined;

    subType: FileSubType | undefined;

    uid: string | null | undefined;

    @toStringField
    title: string | null | undefined;

    @toStringField
    date: string | null | undefined;

    @toStringField
    description: string | null | undefined;

    @toStringField
    sender: string | null | undefined;

    @toStringField
    recipient: string | null | undefined;

    @toStringField
    dateOfDelivery: string | null | undefined;

    hide: boolean | null | undefined;

    dontChangePdfPath: boolean | null | undefined;

    @toStringField
    file: string | null | undefined;

    @toStringField
    relatedFiles: string[] | null | undefined;

    citationTitle: string | null | undefined;

    @toStringField
    tags: string | string[] | null | undefined;

    annotationTarget: string | null | undefined;
    static yamlKeyMap: YamlKeyMap = {
        annotationTarget: 'annotation-target',
    };

    constructor(data: Partial<DocumentData>) {
        super();

        if (!data) {
            this.type = 'Metadata';

            return;
        }
        this.uid = data.uid !== undefined ? data.uid : undefined;

        this.title = data.title !== undefined ? data.title : undefined;
        this.date = data.date !== undefined ? data.date : undefined;

        this.description =
            data.description !== undefined ? data.description : undefined;
        this.sender = data.sender !== undefined ? data.sender : undefined;

        this.recipient =
            data.recipient !== undefined ? data.recipient : undefined;

        this.dateOfDelivery =
            data.dateOfDelivery !== undefined ? data.dateOfDelivery : undefined;
        this.hide = data.hide !== undefined ? data.hide : undefined;

        this.dontChangePdfPath =
            data.dontChangePdfPath !== undefined
                ? data.dontChangePdfPath
                : undefined;
        this.file = data.file !== undefined ? data.file : undefined;

        this.relatedFiles =
            data.relatedFiles !== undefined ? data.relatedFiles : undefined;

        this.citationTitle =
            data.citationTitle !== undefined ? data.citationTitle : undefined;
        this.tags = data.tags !== undefined ? data.tags : undefined;
        this.type = data.type !== undefined ? data.type : 'Metadata';
        this.subType = data.subType !== undefined ? data.subType : undefined;

        this.annotationTarget =
            data.annotationTarget !== undefined
                ? data.annotationTarget
                : undefined;
    }
}
