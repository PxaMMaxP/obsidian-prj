import { toStringField } from 'src/classes/ToStringFieldDecorator';
import { fieldConfig } from 'src/classes/FieldConfigDecorator';
import BaseData from './BaseData';
import IPrjData from 'src/interfaces/IPrjData';
import IPrjTaskManagement from 'src/interfaces/IPrjTaskManagement';
import {
    FileSubType,
    Status,
    Priority,
    Energy,
    HistoryEntries,
} from 'src/types/PrjTypes';

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

    @toStringField
    @fieldConfig()
    tags: string[] | string | null | undefined;

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
