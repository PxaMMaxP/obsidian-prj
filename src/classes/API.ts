/* istanbul ignore file */

/* eslint-disable @typescript-eslint/naming-convention */
import Global from 'src/classes/Global';
import { HelperGeneral } from 'src/libs/Helper/General';
import { DocumentModel } from 'src/models/DocumentModel';
import { NoteModel } from 'src/models/NoteModel';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';

/**
 * Represents the API of the plugin.
 */
export default class API {
    /**
     * Gets the global instance for the plugin.
     */
    // eslint-disable-next-line deprecation/deprecation
    public static get global(): Global {
        // eslint-disable-next-line deprecation/deprecation
        return Global.getInstance();
    }
    public static documentModel = DocumentModel;
    public static prjTaskManagementModel = PrjTaskManagementModel;
    public static noteModel = NoteModel;
    public static helper = HelperGeneral;
}
