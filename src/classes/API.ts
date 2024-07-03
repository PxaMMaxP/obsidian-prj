/* istanbul ignore file */

/* eslint-disable @typescript-eslint/naming-convention */
import Global from 'src/classes/Global';
import Helper from 'src/libs/Helper';
import { DocumentModel } from 'src/models/DocumentModel';
import { NoteModel } from 'src/models/NoteModel';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';

export default class API {
    public static get global(): Global {
        return Global.getInstance();
    }
    public static documentModel = DocumentModel;
    public static prjTaskManagementModel = PrjTaskManagementModel;
    public static noteModel = NoteModel;
    public static helper = Helper;
}
