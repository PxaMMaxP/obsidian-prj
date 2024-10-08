import { TFile } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Lifecycle } from 'src/libs/LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from 'src/libs/LifecycleManager/interfaces/ILifecycleObject';
import type { ITSinjex } from 'ts-injex';
import PrjTopicData from './Data/PrjTopicData';
import { PrjTaskManagementModel } from './PrjTaskManagementModel';

/**
 * Represents the model for a topic.
 */
@Lifecycle()
@ImplementsStatic<ILifecycleObject>()
export class TopicModel extends PrjTaskManagementModel<PrjTopicData> {
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
     * @param dependencies The optional dependencies to use.
     */
    constructor(file: TFile | undefined, dependencies?: ITSinjex) {
        super(file, PrjTopicData, dependencies);
    }
}
