import { TFile } from 'obsidian';
import ProjectData from 'src/types/ProjectData';
import { PrjTaskManagementModel } from './PrjTaskManagementModel';
import Logging from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';

export class ProjectModel extends PrjTaskManagementModel<ProjectData> {
    protected logger: ILogger = Logging.getLogger('ProjectModel');

    constructor(file: TFile | undefined) {
        super(file, ProjectData);
    }

    public static registerThisModelFactory(): void {
        // eslint-disable-next-line no-console
        console.debug('Registering `ProjectModel` at `PrjTaskManagementModel`');

        PrjTaskManagementModel.registerModelFactory(
            'Project',
            (file: TFile) => new ProjectModel(file),
        );
    }
}
