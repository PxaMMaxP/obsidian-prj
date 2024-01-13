import { TFile } from "obsidian";
import ProjectData from "src/types/ProjectData";
import { PrjTaskManagementModel } from "./PrjTaskManagementModel";

export class ProjectModel extends PrjTaskManagementModel<ProjectData> {

    constructor(file: TFile | undefined) {
        super(file, ProjectData);
    }

}