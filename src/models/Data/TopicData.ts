import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import IPrjData from 'src/interfaces/IPrjData';
import IPrjTaskManagement from 'src/interfaces/IPrjTaskManagement';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags } from 'src/libs/Tags/interfaces/ITags';
import { Tags } from 'src/libs/Tags/Tags';
import {
    FileSubType,
    Status,
    Priority,
    Energy,
    HistoryEntries,
} from 'src/types/PrjTypes';
import BaseData from './BaseData';

/**
 * Represents a topic.
 */
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

    /**
     * The tags of the topic.
     * @remarks This value is included in the `toString` output.
     */
    private _tags: ITags | null | undefined;

    /**
     * Sets the tags of the topic.
     */
    @fieldConfig()
    set tags(value: ITags | ITag | string | string[] | null | undefined) {
        if (Tags.isInstanceOf(value)) {
            this._tags = value;
        } else {
            this._tags = new Tags(value);
        }
    }

    /**
     * Gets the tags of the topic.
     */
    @toStringField
    get tags(): ITags | null | undefined {
        return this._tags;
    }

    @fieldConfig()
    history: HistoryEntries | null | undefined;

    @fieldConfig()
    aliases: string[] | null | undefined;

    /**
     * Creates a new instance of the TopicData class.
     * @param data - The data to use for the model.
     * - If no data is provided, the default values e.g. `undefined` are used.
     * - If only partial data is provided, the missing values are set to `undefined`.
     */
    constructor(data: Partial<TopicData>) {
        super(data);
    }
}
