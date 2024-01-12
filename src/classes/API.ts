import Global from "src/classes/Global";
import { StaticDocumentModel } from "src/libs/StaticModels/StaticDocumentModel";

export default class API {
    public global: Global
    public documentModel = StaticDocumentModel;

    constructor() {
        this.global = Global.getInstance();
    }
}
