import { toStringField } from 'src/classes/ToStringFieldDecorator';
import BaseData from './BaseData';
import { fieldConfig } from 'src/classes/FieldConfigDecorator';
import IPrjData from 'src/interfaces/IPrjData';
import { FileType } from 'src/types/PrjTypes';

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

    @toStringField
    @fieldConfig()
    tags: string[] | string | null | undefined;

    constructor(data: Partial<NoteData>) {
        super(data);
    }
}
