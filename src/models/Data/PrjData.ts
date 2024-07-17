import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import { Inject } from 'src/libs/DependencyInjection/decorators/Inject';
import { IFileType, IFileType_ } from 'src/libs/FileType/interfaces/IFileType';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags, ITags_ } from 'src/libs/Tags/interfaces/ITags';
import { FileSubType } from 'src/types/PrjTypes';
import { YamlKeyMap } from 'src/types/YamlKeyMap';
import BaseData from './BaseData';
import { IPrjData, IPrjData_ } from './interfaces/IPrjData';

/**
 * Represents a project data.
 */
@ImplementsStatic<IPrjData_<unknown>>()
export class PrjData<T> extends BaseData<T> implements IPrjData {
    /**
     * @inheritdoc
     */
    protected initializeDependencies(): void {
        this._ITags = this._dependencies.resolve<ITags_>('ITags_');
        this._IFileType = this._dependencies.resolve<IFileType_>('IFileType_');
    }

    protected _IFileType!: IFileType_;
    protected _ITags!: ITags_;

    private _type: IFileType | null | undefined;
    private _subType: FileSubType | null | undefined;
    private _tags: ITags | null | undefined;
    private _title: string | null | undefined;
    private _description: string | null | undefined;

    static yamlKeyMap: YamlKeyMap | undefined = {};

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
