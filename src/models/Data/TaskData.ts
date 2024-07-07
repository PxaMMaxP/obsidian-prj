import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import IPrjData from 'src/interfaces/IPrjData';
import IPrjTaskManagement from 'src/interfaces/IPrjTaskManagement';
import { TagsDefaultDependencies } from 'src/libs/Tags/DefaultDependencies';
import Tag from 'src/libs/Tags/Tag';
import Tags from 'src/libs/Tags/Tags';
import {
    FileSubType,
    Status,
    Priority,
    Energy,
    HistoryEntries,
} from 'src/types/PrjTypes';
import BaseData from './BaseData';

export default class TaskData
    extends BaseData<TaskData>
    implements IPrjData, IPrjTaskManagement
{
    @fieldConfig('Task')
    type: 'Task' | null | undefined;

    @fieldConfig()
    subType: FileSubType | null | undefined;

    @toStringField
    @fieldConfig()
    title: string | null | undefined;

    @toStringField
    @fieldConfig()
    description: string | null | undefined;

    @toStringField
    @fieldConfig()
    status: Status | null | undefined;

    @fieldConfig()
    priority: Priority | null | undefined;

    @fieldConfig()
    energy: Energy | null | undefined;

    @toStringField
    @fieldConfig()
    due: string | null | undefined;

    /**
     * The tags of the Task.
     * @remarks This value is included in the `toString` output.
     */
    private _tags: Tags | null | undefined;

    @fieldConfig()
    set tags(value: Tags | Tag | string | string[] | null | undefined) {
        if (Tags.isInstanceOf(value)) {
            this._tags = value;
        } else {
            this._tags = new Tags(value, TagsDefaultDependencies);
        }
    }

    @toStringField
    get tags(): Tags | null | undefined {
        return this._tags;
    }

    @fieldConfig()
    history: HistoryEntries | null | undefined;

    @fieldConfig()
    aliases: string[] | null | undefined;

    @fieldConfig()
    sort: number | null | undefined;

    constructor(data: Partial<TaskData>) {
        super(data);
    }
}
