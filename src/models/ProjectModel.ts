import { TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Logging } from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';
import { Lifecycle } from 'src/libs/LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from 'src/libs/LifecycleManager/interfaces/ILifecycleManager';
import ProjectData from './Data/ProjectData';
import { PrjTaskManagementModel } from './PrjTaskManagementModel';

/**
 * Represents a Project.
 */
@Lifecycle
@ImplementsStatic<ILifecycleObject>()
export class ProjectModel extends PrjTaskManagementModel<ProjectData> {
    protected _logger: ILogger = Logging.getLogger('ProjectModel');

    /**
     * Creates a new instance of the Project model.
     * @param file The file to create the model for.
     */
    constructor(file: TFile | undefined) {
        super(file, ProjectData);
    }

    /**
     * Initializes the model.
     */
    public static onLoad(): void {
        ProjectModel.registerThisModelFactory();
    }

    /**
     * Registers the model factory for the Project model.
     */
    private static registerThisModelFactory(): void {
        // eslint-disable-next-line no-console
        console.debug('Registering `ProjectModel` at `PrjTaskManagementModel`');

        PrjTaskManagementModel.registerModelFactory(
            'Project',
            (file: TFile) => new ProjectModel(file),
        );
    }
}
