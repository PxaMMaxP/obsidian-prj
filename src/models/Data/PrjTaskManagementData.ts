import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import type {
    IStatusType,
    IStatusType_,
} from 'src/libs/StatusType/interfaces/IStatusType';
import { Priority, Energy, HistoryEntries } from 'src/types/PrjTypes';
import { IPrjData_ } from './interfaces/IPrjData';
import { IPrjTaskManagementData } from './interfaces/IPrjTaskManagementData';
import { PrjData } from './PrjData';

/**
 * Implementation of the PrjTaskManagementModel class.
 */
@ImplementsStatic<IPrjData_<unknown>>()
export class PrjTaskManagementData
    extends PrjData<PrjTaskManagementData>
    implements IPrjTaskManagementData
{
    @Inject('IStatusType_')
    protected _IStatusType!: IStatusType_;

    protected _status: IStatusType | null | undefined;
    protected _priority: Priority | null | undefined;
    protected _energy: Energy | null | undefined;
    protected _due: string | null | undefined;
    protected _history: HistoryEntries | null | undefined;
    protected _aliases: string[] | null | undefined;

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get status(): IStatusType | null | undefined {
        return this._status;
    }

    /**
     * @inheritdoc
     */
    set status(value: unknown) {
        this._status = new this._IStatusType(value);
    }

    /**
     * @inheritdoc
     */
    @fieldConfig()
    get priority(): Priority | null | undefined {
        return this._priority;
    }

    /**
     * @inheritdoc
     */
    set priority(value: Priority | null | undefined) {
        this._priority = value;
    }

    /**
     * @inheritdoc
     */
    @fieldConfig()
    get energy(): Energy | null | undefined {
        return this._energy;
    }

    /**
     * @inheritdoc
     */
    set energy(value: Energy | null | undefined) {
        this._energy = value;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get due(): string | null | undefined {
        return this._due;
    }

    /**
     * @inheritdoc
     */
    set due(value: string | null | undefined) {
        this._due = value;
    }

    /**
     * @inheritdoc
     */
    @fieldConfig()
    get history(): HistoryEntries | null | undefined {
        return this._history;
    }

    /**
     * @inheritdoc
     */
    set history(value: HistoryEntries | null | undefined) {
        this._history = value;
    }

    /**
     * @inheritdoc
     */
    @fieldConfig()
    get aliases(): string[] | null | undefined {
        return this._aliases;
    }

    /**
     * @inheritdoc
     */
    set aliases(value: string[] | null | undefined) {
        this._aliases = value;
    }
}
