import { TFile } from 'obsidian';
import { PrjTaskManagementModel } from './PrjTaskManagementModel';
import Logging from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';
import TopicData from './Data/TopicData';

export class TopicModel extends PrjTaskManagementModel<TopicData> {
    protected logger: ILogger = Logging.getLogger('TopicModel');

    public static registerThisModelFactory(): void {
        // eslint-disable-next-line no-console
        console.debug('Registering `TopicModel` at `PrjTaskManagementModel`');

        PrjTaskManagementModel.registerModelFactory(
            'Topic',
            (file: TFile) => new TopicModel(file),
        );
    }

    constructor(file: TFile | undefined) {
        super(file, TopicData);
    }
}
