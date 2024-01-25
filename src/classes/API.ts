/* eslint-disable @typescript-eslint/naming-convention */
import Global from 'src/classes/Global';
import Helper from 'src/libs/Helper';
import { StaticDocumentModel } from 'src/models/StaticHelper/StaticDocumentModel';
import { StaticNoteModel } from 'src/models/StaticHelper/StaticNoteModel';
import { StaticPrjTaskManagementModel } from 'src/models/StaticHelper/StaticPrjTaskManagementModel';

export default class API {
    public static get global(): Global {
        return Global.getInstance();
    }
    public static documentModel = StaticDocumentModel;
    public static prjTaskManagementModel = StaticPrjTaskManagementModel;
    private static noteModel = StaticNoteModel;
    public static helper = Helper;
}
