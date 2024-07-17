import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { IFileType } from 'src/libs/FileType/interfaces/IFileType';
import { IPrjTaskManagementData } from './interfaces/IPrjTaskManagementData';
import PrjBaseData from './PrjBaseData';
import { PrjTaskManagementData } from './PrjTaskManagementData';

/**
 * Represents a task.
 */
export default class PrjTaskData
    extends PrjTaskManagementData
    implements IPrjTaskManagementData
{
    /**
     * @inheritdoc
     * @remarks The default value is `Task`.
     */
    @fieldConfig('Task')
    get type(): IFileType | null | undefined {
        return super.type;
    }

    /**
     * @inheritdoc
     */
    set type(value: unknown) {
        super.type = value;
    }

    /**
     * Creates a new instance of the ProjectData class.
     * @param data - The data to use for the model.
     * - If no data is provided, the default values e.g. `undefined` are used.
     * - If only partial data is provided, the missing values are set to `undefined`.
     * @param dependencies The optional dependencies to use for the model. {@link PrjBaseData}
     */
    constructor(data: Partial<PrjTaskData>, dependencies?: IDIContainer) {
        super(data, dependencies);
    }
}
