import { TFile } from 'obsidian';
import { Logging } from 'src/classes/Logging';
import { ILogger } from 'src/interfaces/ILogger';
import { YamlKeyMap } from 'src/types/YamlKeyMap';
import BaseData from './Data/BaseData';
import { FileModel } from './FileModel';

/**
 * Base class for models that are stored in files.
 * @deprecated Use the FileModel class instead.
 */
export default class BaseModel<
    T extends BaseData<unknown>,
> extends FileModel<T> {
    protected _logger: ILogger;

    /**
     * Creates a new BaseModel instance.
     * @param file The file to read and write the data from and to.
     * @param ctor The constructor of the model class.
     * @param yamlKeyMap The mapping of the YAML keys to the model properties.
     * @param logger The logger to use. Defaults to a new instance of the Logging class.
     */
    constructor(
        file: TFile | undefined,
        ctor: new (data?: Partial<T>) => T,
        yamlKeyMap: YamlKeyMap | undefined,
        logger?: ILogger,
    ) {
        super(file, ctor, yamlKeyMap);

        this._logger = logger ?? Logging.getLogger('BaseModel');
    }
}
