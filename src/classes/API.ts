import Global from "src/classes/Global";
import Helper from "src/libs/Helper";
import { DocumentModel } from "src/models/DocumentModel";

export default class API {
    public global: Global
    public documentModel = DocumentModel.api;
    public helper = Helper;

    constructor() {
        this.global = Global.getInstance();
    }
}
