import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import { YamlKeyMap } from 'src/types/YamlKeyMap';
import { IPrjData_ } from './interfaces/IPrjData';
import { IPrjNote } from './interfaces/IPrjNote';
import { PrjData } from './PrjData';

/**
 * Represents a note.
 */
@ImplementsStatic<IPrjData_<unknown>>()
export default class PrjNoteData
    extends PrjData<PrjNoteData>
    implements IPrjNote
{
    /**
     * @inheritdoc
     */
    protected initializeDependencies(): void {
        super.initializeDependencies();
    }

    private _date: string | null | undefined;

    static yamlKeyMap: YamlKeyMap | undefined = {};

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get date(): string | null | undefined {
        return this._date;
    }
    /**
     * @inheritdoc
     */
    set date(value: string | null | undefined) {
        this._date = value;
    }
}
