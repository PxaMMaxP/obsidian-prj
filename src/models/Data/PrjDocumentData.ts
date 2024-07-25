/* eslint-disable @typescript-eslint/naming-convention */
import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import { Register } from 'src/libs/DependencyInjection/decorators/Register';
import { IFileType } from 'src/libs/FileType/interfaces/IFileType';
import { YamlKeyMap } from 'src/types/YamlKeyMap';
import { IPrjData_ } from './interfaces/IPrjData';
import { IPrjDocument } from './interfaces/IPrjDocument';
import { PrjData } from './PrjData';

/**
 * Implementation of the PrjTaskManagementModel class.
 */
@Register('IPrjDocument_')
@ImplementsStatic<IPrjData_<unknown>>()
export class PrjDocumentData
    extends PrjData<PrjDocumentData>
    implements IPrjDocument
{
    protected _uid: string | null | undefined;
    protected _date: string | null | undefined;
    protected _sender: string | null | undefined;
    protected _recipient: string | null | undefined;
    protected _dateOfDelivery: string | null | undefined;
    protected _hide: boolean | null | undefined;
    protected _dontChangePdfPath: boolean | null | undefined;
    protected _file: string | null | undefined;
    protected _relatedFiles: string[] | null | undefined;
    protected _citationTitle: string | null | undefined;
    protected _annotationTarget: string | null | undefined;

    static yamlKeyMap: YamlKeyMap = {
        annotationTarget: 'annotation-target',
    };

    /**
     * @inheritdoc
     * @remarks The default value is `Metadata`.
     */
    @fieldConfig('Metadata')
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
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get uid(): string | null | undefined {
        return this._uid;
    }
    /**
     * @inheritdoc
     */
    set uid(value: string | null | undefined) {
        this._uid = value;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get date(): string | null | undefined {
        return this._date;
    }
    /**
     * @inheritdoc
     */
    set date(value: string | null | undefined) {
        this._date = value;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get sender(): string | null | undefined {
        return this._sender;
    }
    /**
     * @inheritdoc
     */
    set sender(value: string | null | undefined) {
        this._sender = value;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get recipient(): string | null | undefined {
        return this._recipient;
    }
    /**
     * @inheritdoc
     */
    set recipient(value: string | null | undefined) {
        this._recipient = value;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get dateOfDelivery(): string | null | undefined {
        return this._dateOfDelivery;
    }
    /**
     * @inheritdoc
     */
    set dateOfDelivery(value: string | null | undefined) {
        this._dateOfDelivery = value;
    }

    /**
     * @inheritdoc
     */
    @fieldConfig()
    get hide(): boolean | null | undefined {
        return this._hide;
    }
    /**
     * @inheritdoc
     */
    set hide(value: boolean | null | undefined) {
        this._hide = value;
    }

    /**
     * @inheritdoc
     */
    @fieldConfig()
    get dontChangePdfPath(): boolean | null | undefined {
        return this._dontChangePdfPath;
    }
    /**
     * @inheritdoc
     */
    set dontChangePdfPath(value: boolean | null | undefined) {
        this._dontChangePdfPath = value;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get file(): string | null | undefined {
        return this._file;
    }
    /**
     * @inheritdoc
     */
    set file(value: string | null | undefined) {
        this._file = value;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get relatedFiles(): string[] | null | undefined {
        return this._relatedFiles;
    }
    /**
     * @inheritdoc
     */
    set relatedFiles(value: string[] | null | undefined) {
        this._relatedFiles = value;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get citationTitle(): string | null | undefined {
        return this._citationTitle;
    }
    /**
     * @inheritdoc
     */
    set citationTitle(value: string | null | undefined) {
        this._citationTitle = value;
    }

    /**
     * @inheritdoc
     */
    @toStringField
    @fieldConfig()
    get annotationTarget(): string | null | undefined {
        return this._annotationTarget;
    }
    /**
     * @inheritdoc
     */
    set annotationTarget(value: string | null | undefined) {
        this._annotationTarget = value;
    }
}
