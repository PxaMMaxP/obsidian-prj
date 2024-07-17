import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import type {
    IFileType,
    IFileType_,
} from 'src/libs/FileType/interfaces/IFileType';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import type { ITags, ITags_ } from 'src/libs/Tags/interfaces/ITags';
import { FileSubType } from 'src/types/PrjTypes';
import { IPrjData, IPrjData_ } from './interfaces/IPrjData';
import PrjBaseData from './PrjBaseData';

/**
 * Represents a project data.
 */
@ImplementsStatic<IPrjData_<unknown>>()
export class PrjData<T> extends PrjBaseData<T> implements IPrjData {
    @Inject('IFileType_')
    protected _IFileType!: IFileType_;
    @Inject('ITags_')
    protected _ITags!: ITags_;

    protected _type: IFileType | null | undefined;
    protected _subType: FileSubType | null | undefined;
    protected _tags: ITags | null | undefined;
    protected _title: string | null | undefined;
    protected _description: string | null | undefined;

    /**
     * @inheritdoc
     */
    @fieldConfig()
    get type(): IFileType | null | undefined {
        return this._type as IFileType | null | undefined;
    }

    /**
     * @inheritdoc
     */
    set type(value: unknown) {
        this._type = new this._IFileType(value);
    }

    /**
     * @inheritdoc
     */
    @fieldConfig()
    get subType(): FileSubType | null | undefined {
        return this._subType;
    }

    /**
     * @inheritdoc
     */
    set subType(value: unknown) {
        this._subType = value as FileSubType | null | undefined;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get tags(): ITags | null | undefined {
        return this._tags;
    }

    /**
     * @inheritdoc
     */
    set tags(value: ITags | ITag | string | string[] | null | undefined) {
        if (this._ITags.isInstanceOf(value)) {
            this._tags = value;
        } else {
            this._tags = new this._ITags(value);
        }
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get title(): string | null | undefined {
        return this._title;
    }

    /**
     * @inheritdoc
     */
    set title(value: string | null | undefined) {
        this._title = value;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get description(): string | null | undefined {
        return this._description;
    }

    /**
     * @inheritdoc
     */
    set description(value: string | null | undefined) {
        this._description = value;
    }
}
