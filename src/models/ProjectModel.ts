import { TFile } from 'obsidian';
import Logging from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';
import ProjectData from './Data/ProjectData';
import { PrjTaskManagementModel } from './PrjTaskManagementModel';

/**
 * Represents a Project.
 */
export class ProjectModel extends PrjTaskManagementModel<ProjectData> {
    protected logger: ILogger = Logging.getLogger('ProjectModel');

    /**
     * Creates a new instance of the Project model.
     * @param file The file to create the model for.
     */
    constructor(file: TFile | undefined) {
        super(file, ProjectData);
    }

    /**
     * Registers the model factory for the Project model.
     */
    public static registerThisModelFactory(): void {
        // eslint-disable-next-line no-console
        console.debug('Registering `ProjectModel` at `PrjTaskManagementModel`');

        PrjTaskManagementModel.registerModelFactory(
            'Project',
            (file: TFile) => new ProjectModel(file),
        );
    }
}
