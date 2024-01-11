import { TFile } from "obsidian";
import TopicData from "src/types/TopicData";
import { PrjTaskManagementModel } from "./PrjTaskManagementModel";

export class TopicModel extends PrjTaskManagementModel<TopicData> {

    constructor(file: TFile) {
        super(file, TopicData);
    }

}