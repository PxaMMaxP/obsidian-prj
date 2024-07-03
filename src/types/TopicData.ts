import { toStringField } from 'src/classes/ToStringFieldDecorator';
import { fieldConfig } from 'src/classes/FieldConfigDecorator';
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

export default class TopicData
    extends BaseData<TopicData>
    implements IPrjData, IPrjTaskManagement
{
    @fieldConfig('Topic')
    type: 'Topic' | null | undefined;

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

    constructor(data: Partial<TopicData>) {
        super(data);
    }
}
