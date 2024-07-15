import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import IPrjData from 'src/interfaces/IPrjData';
import IPrjTaskManagement from 'src/interfaces/IPrjTaskManagement';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags } from 'src/libs/Tags/interfaces/ITags';
import { Tags } from 'src/libs/Tags/Tags';
import { FileType } from 'src/types/FileType/FileType';
import {
    FileSubType,
    Status,
    Priority,
    Energy,
    HistoryEntries,
} from 'src/types/PrjTypes';
import BaseData from './BaseData';

/**
 * Represents a task.
 */
export default class TaskData
    extends BaseData<TaskData>
    implements IPrjData, IPrjTaskManagement
{
    /**
     * The type of the Task.
     */
    private _type: FileType | null | undefined;

    /**
     * Sets the type of the Task.
     */
    @fieldConfig('Task')
    set type(value: unknown) {
        this._type = new FileType(value);
    }

    /**
     * Gets the type of the Task.
     */
    get type(): FileType | null | undefined {
        return this._type?.valueOf() as FileType | null | undefined;
    }

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
    private _tags: ITags | null | undefined;

    /**
     * Sets the tags of the Task.
     */
    @fieldConfig()
    @toStringField
    set tags(value: ITags | ITag | string | string[] | null | undefined) {
        if (Tags.isInstanceOf(value)) {
            this._tags = value;
        } else {
            this._tags = new Tags(value);
        }
    }

    /**
     * Gets the tags of the Task.
     */
    get tags(): ITags | null | undefined {
        return this._tags;
    }

    @fieldConfig()
    history: HistoryEntries | null | undefined;

    @fieldConfig()
    aliases: string[] | null | undefined;

    @fieldConfig()
    sort: number | null | undefined;

    /**
     * Creates a new instance of the TaskData class.
     * @param data - The data to use for the model.
     * - If no data is provided, the default values e.g. `undefined` are used.
     * - If only partial data is provided, the missing values are set to `undefined`.
     */
    constructor(data: Partial<TaskData>) {
        super(data);
    }
}
