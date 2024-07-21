/* istanbul ignore file */

/* eslint-disable @typescript-eslint/naming-convention */
import { HelperGeneral } from 'src/libs/Helper/General';
import { DocumentModel } from 'src/models/DocumentModel';
import { NoteModel } from 'src/models/NoteModel';
import { PrjTaskManagementModel } from 'src/models/PrjTaskManagementModel';

/**
 * Represents the API of the plugin.
 */
export default class API {
    public static documentModel = DocumentModel;
    public static prjTaskManagementModel = PrjTaskManagementModel;
    public static noteModel = NoteModel;
    public static helper = HelperGeneral;
}
