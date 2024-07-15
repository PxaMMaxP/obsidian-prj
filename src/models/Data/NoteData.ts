import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { IFileType, IFileType_ } from 'src/libs/FileType/interfaces/IFileType';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags, ITags_ } from 'src/libs/Tags/interfaces/ITags';
import { IPrjData } from 'src/models/Data/interfaces/IPrjData';
import BaseData from './BaseData';

/**
 * Represents a note.
 */
export default class NoteData extends BaseData<NoteData> implements IPrjData {
    private _iTags: ITags_;
    private _iFileType: IFileType_;

    /**
     * The type of the note.
     */
    private _type: IFileType | null | undefined;

    /**
     * Sets the type of the note.
     */
    @fieldConfig('Note')
    set type(value: unknown) {
        this._type = new this._iFileType(value);
    }

    /**
     * Gets the type of the note.
     */
    get type(): IFileType | null | undefined {
        return this._type as IFileType | null | undefined;
    }

    @toStringField
    @fieldConfig()
    title: string | null | undefined;

    @toStringField
    @fieldConfig()
    description: string | null | undefined;

    @toStringField
    @fieldConfig()
    date: string | null | undefined;

    /**
     * The tags of the note.
     * @remarks This value is included in the `toString` output.
     */
    private _tags: ITags | null | undefined;

    /**
     * Sets the tags of the note.
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
     * Gets the tags of the note.
     */
    get tags(): ITags | null | undefined {
        return this._tags;
    }

    /**
     * Initializes a new instance of the NoteData class.
     * @param data - The data to use for the model.
     * - If no data is provided, the default values e.g. `undefined` are used.
     * - If only partial data is provided, the missing values are set to `undefined`.
     * @param dependencies  The optional dependencies to use for the model. {@link BaseData}
     */
    constructor(data?: Partial<NoteData>, dependencies?: IDIContainer) {
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
