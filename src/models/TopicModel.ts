import { TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Logging } from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';
import { Lifecycle } from 'src/libs/LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from 'src/libs/LifecycleManager/interfaces/ILifecycleManager';
import TopicData from './Data/TopicData';
import { PrjTaskManagementModel } from './PrjTaskManagementModel';

/**
 * Represents the model for a topic.
 */
@Lifecycle
@ImplementsStatic<ILifecycleObject>()
export class TopicModel extends PrjTaskManagementModel<TopicData> {
    protected logger: ILogger = Logging.getLogger('TopicModel');

    /**
     * Initializes the model.
     */
    public static onLoad(): void {
        TopicModel.registerThisModelFactory();
    }

    /**
     * Registers the model factory for the topic model.
     */
    private static registerThisModelFactory(): void {
        // eslint-disable-next-line no-console
        console.debug('Registering `TopicModel` at `PrjTaskManagementModel`');

        PrjTaskManagementModel.registerModelFactory(
            'Topic',
            (file: TFile) => new TopicModel(file),
        );
    }

    /**
     * Creates a new instance of the topic model.
     * @param file The file to create the model for.
     */
    constructor(file: TFile | undefined) {
        super(file, TopicData);
    }
}
