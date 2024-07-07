import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import IPrjData from 'src/interfaces/IPrjData';
import { TagsDefaultDependencies } from 'src/libs/Tags/DefaultDependencies';
import Tag from 'src/libs/Tags/Tag';
import Tags from 'src/libs/Tags/Tags';
import { FileType } from 'src/types/PrjTypes';
import BaseData from './BaseData';

export default class NoteData extends BaseData<NoteData> implements IPrjData {
    @fieldConfig('Note')
    type: FileType | null | undefined;

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
    private _tags: Tags | null | undefined;

    @fieldConfig()
    set tags(value: Tags | Tag | string | string[] | null | undefined) {
        if (Tags.isInstanceOf(value)) {
            this._tags = value;
        } else {
            this._tags = new Tags(value, TagsDefaultDependencies);
        }
    }

    @toStringField
    get tags(): Tags | null | undefined {
        return this._tags;
    }

    constructor(data: Partial<NoteData>) {
        super(data);
    }
}
