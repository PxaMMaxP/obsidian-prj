import { TFile } from 'obsidian';
import TopicData from 'src/types/TopicData';
import { PrjTaskManagementModel } from './PrjTaskManagementModel';
import Logging from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';

export class TopicModel extends PrjTaskManagementModel<TopicData> {
    protected logger: ILogger = Logging.getLogger('TopicModel');

    constructor(file: TFile | undefined) {
        super(file, TopicData);
    }
}
