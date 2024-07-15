import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import { Status, Priority, Energy, HistoryEntries } from 'src/types/PrjTypes';
import { IPrjData_ } from './interfaces/IPrjData';
import { IPrjTaskManagementData } from './interfaces/IPrjTaskManagementData';
import { PrjData } from './PrjData';

/**
 * Implementation of the PrjTaskManagementModel class.
 */
@ImplementsStatic<IPrjData_<unknown>>()
export class PrjTaskManagementModel
    extends PrjData<PrjTaskManagementModel>
    implements IPrjTaskManagementData
{
    /**
     * @inheritdoc
     */
    protected initializeDependencies(): void {
        super.initializeDependencies();
    }

    private _status: Status | null | undefined;
    private _priority: Priority | null | undefined;
    private _energy: Energy | null | undefined;
    private _due: string | null | undefined;
    private _history: HistoryEntries | null | undefined;
    private _aliases: string[] | null | undefined;

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get status(): Status | null | undefined {
        return this._status;
    }

    /**
     * @inheritdoc
     */
    set status(value: Status | null | undefined) {
        this._status = value;
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
