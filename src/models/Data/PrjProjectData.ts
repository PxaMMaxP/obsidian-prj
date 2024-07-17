import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { IFileType } from 'src/libs/FileType/interfaces/IFileType';
import { IPrjTaskManagementData } from './interfaces/IPrjTaskManagementData';
import { PrjTaskManagementData } from './PrjTaskManagementData';

/**
 * Represents a project.
 */
export default class PrjProjectData
    extends PrjTaskManagementData
    implements IPrjTaskManagementData
{
    /**
     * @inheritdoc
     * @remarks The default value is `Project`.
     */
    @fieldConfig('Project')
    get type(): IFileType | null | undefined {
        return super.type;
    }

    /**
     * @inheritdoc
     */
    set type(value: unknown) {
        super.type = value;
    }
}
