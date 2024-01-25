import { TFile } from 'obsidian';
import { FileModel } from './FileModel';
import { YamlKeyMap } from 'src/types/YamlKeyMap';
import Logging from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';

export default class BaseModel<T extends object> extends FileModel<T> {
    protected logger: ILogger = Logging.getLogger('BaseModel');

    constructor(
        file: TFile | undefined,
        ctor: new (data?: Partial<T>) => T,
        yamlKeyMap: YamlKeyMap | undefined,
    ) {
        super(file, ctor, yamlKeyMap);
    }
}
