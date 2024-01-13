import Global from "src/classes/Global";
import Helper from "src/libs/Helper";
import { StaticDocumentModel } from "src/libs/StaticModels/StaticDocumentModel";

export default class API {
    public global: Global
    public documentModel = StaticDocumentModel;
    public helper = Helper;

    constructor() {
        this.global = Global.getInstance();
    }
}
