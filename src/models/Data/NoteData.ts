import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import IPrjData from 'src/interfaces/IPrjData';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags } from 'src/libs/Tags/interfaces/ITags';
import { Tags } from 'src/libs/Tags/Tags';
import { FileType } from 'src/types/FileType/FileType';
import BaseData from './BaseData';

/**
 * Represents a note.
 */
export default class NoteData extends BaseData<NoteData> implements IPrjData {
    /**
     * The type of the note.
     */
    private _type: FileType | null | undefined;

    /**
     * Sets the type of the note.
     */
    @fieldConfig('Note')
    set type(value: unknown) {
        this._type = new FileType(value);
    }

    /**
     * Gets the type of the note.
     */
    get type(): FileType | null | undefined {
        return this._type?.valueOf() as FileType | null | undefined;
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
        if (Tags.isInstanceOf(value)) {
            this._tags = value;
        } else {
            this._tags = new Tags(value);
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
     */
    constructor(data: Partial<NoteData>) {
        super(data);
    }
}
