import { toStringField } from 'src/classes/ToStringFieldDecorator';
import IPrjData from '../interfaces/IPrjData';
import IPrjTaskManagement from '../interfaces/IPrjTaskManagement';
import BaseData from './BaseData';
import {
    Status,
    Priority,
    Energy,
    FileSubType,
    HistoryEntries,
} from './PrjTypes';
import { Tags } from 'src/libs/Tags/Tags';
import Global from 'src/classes/Global';
import { TagFactory } from 'src/libs/Tags/TagFactory';

export default class TaskData
    extends BaseData
    implements IPrjData, IPrjTaskManagement
{
    type: 'Task' | null | undefined;

    subType: FileSubType | null | undefined;

    @toStringField
    title: string | null | undefined;

    @toStringField
    description: string | null | undefined;

    @toStringField
    status: Status | null | undefined;

    priority: Priority | null | undefined;

    energy: Energy | null | undefined;

    @toStringField
    due: string | null | undefined;

    @toStringField
    tags: Tags | string[] | string | null | undefined;

    history: HistoryEntries | null | undefined;

    aliases: string[] | null | undefined;

    sort: number | null | undefined;

    constructor(data: Partial<TaskData>) {
        super();

        if (!data) {
            this.type = 'Task';

            return;
        }
        this.sort = data.sort !== undefined ? data.sort : undefined;
        this.aliases = data.aliases !== undefined ? data.aliases : undefined;
        this.title = data.title !== undefined ? data.title : undefined;

        this.description =
            data.description !== undefined ? data.description : undefined;
        this.status = data.status !== undefined ? data.status : undefined;
        this.priority = data.priority !== undefined ? data.priority : undefined;
        this.energy = data.energy !== undefined ? data.energy : undefined;
        this.due = data.due !== undefined ? data.due : undefined;

        if (data.tags !== undefined && data.tags !== null) {
            if (data.tags instanceof Tags) {
                this.tags = data.tags;
            } else {
                this.tags = new Tags(
                    data.tags,
                    Global.getInstance().metadataCache,
                    new TagFactory(),
                );
            }
        } else {
            this.tags = undefined;
        }

        this.type = data.type !== undefined ? data.type : 'Task';
        this.subType = data.subType !== undefined ? data.subType : undefined;
        this.history = data.history !== undefined ? data.history : undefined;
    }
}
