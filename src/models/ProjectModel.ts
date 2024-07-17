import { TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { Lifecycle } from 'src/libs/LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from 'src/libs/LifecycleManager/interfaces/ILifecycleManager';
import PrjProjectData from './Data/PrjProjectData';
import { PrjTaskManagementModel } from './PrjTaskManagementModel';

/**
 * Represents a Project.
 */
@Lifecycle
@ImplementsStatic<ILifecycleObject>()
export class ProjectModel extends PrjTaskManagementModel<PrjProjectData> {
    /**
     * Creates a new instance of the Project model.
     * @param file The file to create the model for.
     * @param dependencies The optional dependencies to use.
     */
    constructor(file: TFile | undefined, dependencies?: IDIContainer) {
        super(file, PrjProjectData, dependencies);
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
