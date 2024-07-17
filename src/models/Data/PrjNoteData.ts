import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import { IFileType } from 'src/libs/FileType/interfaces/IFileType';
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
    private _date: string | null | undefined;

    /**
     * @inheritdoc
     * @remarks The default value is `Note`.
     */
    @fieldConfig('Note')
    get type(): IFileType | null | undefined {
        return super.type;
    }

    /**
     * @inheritdoc
     */
    set type(value: unknown) {
        super.type = value;
    }

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
