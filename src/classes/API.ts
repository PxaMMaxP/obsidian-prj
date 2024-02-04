/* eslint-disable @typescript-eslint/naming-convention */
import Global from 'src/classes/Global';
import Helper from 'src/libs/Helper';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';
import { StaticDocumentModel } from 'src/models/StaticHelper/StaticDocumentModel';
import { StaticNoteModel } from 'src/models/StaticHelper/StaticNoteModel';

export default class API {
    public static get global(): Global {
        return Global.getInstance();
    }
    public static documentModel = StaticDocumentModel;
    public static prjTaskManagementModel = PrjTaskManagementModel;
    private static noteModel = StaticNoteModel;
    public static helper = Helper;
}
