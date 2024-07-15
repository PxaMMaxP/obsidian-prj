import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import IPrjData from 'src/interfaces/IPrjData';
import IPrjTaskManagement from 'src/interfaces/IPrjTaskManagement';
import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { IFileType_, IFileType } from 'src/libs/FileType/interfaces/IFileType';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags, ITags_ } from 'src/libs/Tags/interfaces/ITags';
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
    private _iTags: ITags_;
    private _iFileType: IFileType_;

    /**
     * The type of the Task.
     */
    private _type: IFileType | null | undefined;

    /**
     * Sets the type of the Task.
     */
    @fieldConfig('Task')
    set type(value: unknown) {
        this._type = new this._iFileType(value);
    }

    /**
     * Gets the type of the Task.
     */
    get type(): IFileType | null | undefined {
        return this._type as IFileType | null | undefined;
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
        if (this._iTags.isInstanceOf(value)) {
            this._tags = value;
        } else {
            this._tags = new this._iTags(value);
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

    /**
     * Creates a new instance of the TaskData class.
     * @param data - The data to use for the model.
     * - If no data is provided, the default values e.g. `undefined` are used.
     * - If only partial data is provided, the missing values are set to `undefined`.
     * @param dependencies The optional dependencies to use for the model. {@link BaseData}
     */
    constructor(data: Partial<TaskData>, dependencies?: IDIContainer) {
        super(data, dependencies);
    }

    /**
     * Initializes the dependencies of the class.
     */
    protected initializeDependencies(): void {
        this._iTags = this._dependencies.resolve<ITags_>('ITags_');
        this._iFileType = this._dependencies.resolve<IFileType_>('IFileType_');
    }
}
