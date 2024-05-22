import { toStringField } from 'src/classes/ToStringFieldDecorator';
import IPrjData from '../interfaces/IPrjData';
import BaseData from './BaseData';
import { FileType } from './PrjTypes';

export default class NoteData extends BaseData implements IPrjData {
    type: FileType | null | undefined;

    @toStringField
    title: string | null | undefined;

    @toStringField
    description: string | null | undefined;

    @toStringField
    date: string | null | undefined;

    @toStringField
    tags: string[] | string | null | undefined;

    constructor(data: Partial<NoteData>) {
        super();

        if (!data) {
            this.type = 'Note';

            return;
        }
        this.title = data.title !== undefined ? data.title : undefined;

        this.description =
            data.description !== undefined ? data.description : undefined;
        this.date = data.date !== undefined ? data.date : undefined;
        this.tags = data.tags !== undefined ? data.tags : undefined;
        this.type = data.type !== undefined ? data.type : 'Note';
    }
}
