/* eslint-disable @typescript-eslint/naming-convention */
import Global from 'src/classes/Global';
import Helper from 'src/libs/Helper';
import { DocumentModel } from 'src/models/DocumentModel';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import { StaticNoteModel } from 'src/models/StaticHelper/StaticNoteModel';

export default class API {
    public static get global(): Global {
        return Global.getInstance();
    }
    public static documentModel = DocumentModel;
    public static prjTaskManagementModel = PrjTaskManagementModel;
    private static noteModel = StaticNoteModel;
    public static helper = Helper;
}
