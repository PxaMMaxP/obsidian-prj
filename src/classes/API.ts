import Global from 'src/classes/Global';
import Helper from 'src/libs/Helper';
import { StaticDocumentModel } from 'src/models/StaticHelper/StaticDocumentModel';
import { StaticPrjTaskManagementModel } from 'src/models/StaticHelper/StaticPrjTaskManagementModel';

export default class API {
    public static get global(): Global {
        return Global.getInstance();
    }
    public static documentModel = StaticDocumentModel;
    public static prjTaskManagementModel = StaticPrjTaskManagementModel;
    public static helper = Helper;
}
