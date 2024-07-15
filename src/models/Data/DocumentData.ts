import { fieldConfig } from 'src/classes/decorators/FieldConfigDecorator';
import { toStringField } from 'src/classes/decorators/ToStringFieldDecorator';
import IPrjDocument from 'src/interfaces/IPrjDocument';
import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { IFileType, IFileType_ } from 'src/libs/FileType/interfaces/IFileType';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags, ITags_ } from 'src/libs/Tags/interfaces/ITags';
import { IPrjData } from 'src/models/Data/interfaces/IPrjData';
import { FileSubType } from 'src/types/PrjTypes';
import { YamlKeyMap } from 'src/types/YamlKeyMap';
import BaseData from './BaseData';

/**
 * Represents the data of a document.
 * @see {@link DocumentModel} for the model class.
 */
export default class DocumentData
    extends BaseData<DocumentData>
    implements IPrjData, IPrjDocument
{
    private _iTags: ITags_;
    private _iFileType: IFileType_;

    /**
     * The type of the Document.
     */
    private _type: IFileType | null | undefined;

    /**
     * Sets the type of the Document.
     */
    @fieldConfig('Metadata')
    set type(value: unknown) {
        this._type = new this._iFileType(value);
    }

    /**
     * Gets the type of the Document.
     */
    get type(): IFileType | null | undefined {
        return this._type as IFileType | null | undefined;
    }

    /**
     * The subtype of the document.
     * @see {@link FileSubType}
     */
    @fieldConfig()
    subType: FileSubType | undefined;

    /**
     * The unique identifier of the document.
     * This value is generated by the system and should not be modified.
     */
    @fieldConfig()
    uid: string | null | undefined;

    /**
     * The title of the document.
     * @remarks This value is included in the `toString` output.
     */
    @toStringField
    @fieldConfig()
    title: string | null | undefined;

    /**
     * The date of the document.
     * @remarks This value is included in the `toString` output.
     * @remarks The date should be in the format `YYYY-MM-DD`.
     */
    @toStringField
    @fieldConfig()
    date: string | null | undefined;

    /**
     * The description of the document.
     * @remarks This value is included in the `toString` output.
     */
    @toStringField
    @fieldConfig()
    description: string | null | undefined;

    /**
     * The sender of the document.
     * @remarks This value is included in the `toString` output.
     */
    @toStringField
    @fieldConfig()
    sender: string | null | undefined;

    /**
     * The recipient of the document.
     * @remarks This value is included in the `toString` output.
     */
    @toStringField
    @fieldConfig()
    recipient: string | null | undefined;

    /**
     * The date of delivery of the document.
     * @remarks This value is included in the `toString` output.
     * @remarks The date should be in the format `YYYY-MM-DD`.
     */
    @toStringField
    @fieldConfig()
    dateOfDelivery: string | null | undefined;

    /**
     * A flag indicating if the document should be hidden in the regular view.
     */
    @fieldConfig()
    hide: boolean | null | undefined;

    /**
     * A flag indicating if the PDF path should not be changed automatically.
     */
    @fieldConfig()
    dontChangePdfPath: boolean | null | undefined;

    /**
     * The file of the document as a Obsidian Markdown link.
     * @example `[[file.ext]]`
     * @remarks This value is included in the `toString` output.
     */
    @toStringField
    @fieldConfig()
    file: string | null | undefined;

    /**
     * The related files of the document as a list of Obsidian Markdown links.
     * @example `[["file1.ext", "file2.ext"]]`
     * @remarks This value is included in the `toString` output.
     */
    @toStringField
    @fieldConfig()
    relatedFiles: string[] | null | undefined;

    /**
     * The citation title of the document for footnotes etc.
     */
    @fieldConfig()
    citationTitle: string | null | undefined;

    /**
     * The tags of the document.
     * @remarks This value is included in the `toString` output.
     */
    private _tags: ITags | null | undefined;

    /**
     * Sets the tags of the document.
     */
    @fieldConfig()
    @toStringField
    set tags(value: ITags | ITag | string | string[] | null | undefined) {
        if (this._iTags.isInstanceOf(value)) {
            this._tags = value;
        } else {
            this._tags = new this._iTags(value);
        }
    }

    /**
     * Gets the tags of the document.
     */
    get tags(): ITags | null | undefined {
        return this._tags;
    }

    /**
     * The annotation target of the document.
     * @remarks This value is used for the `Obsidian Annotator`-Plugin.
     */
    @fieldConfig()
    annotationTarget: string | null | undefined;

    /**
     * The mapping of YAML keys to the corresponding properties.
     */
    static yamlKeyMap: YamlKeyMap = {
        annotationTarget: 'annotation-target',
    };

    /**
     * Creates a new instance of the `DocumentData` class.
     * @param data - The data to use for the model.
     * - If no data is provided, the default values e.g. `undefined` are used.
     * - If only partial data is provided, the missing values are set to `undefined`.
     * @param dependencies The optional dependencies to use for the model.
     */
    constructor(data?: Partial<DocumentData>, dependencies?: IDIContainer) {
        super(data, dependencies);
    }

    /**
     * Initializes the dependencies of the class.
     */
    protected initializeDependencies(): void {
        this._iTags = this._dependencies.resolve<ITags_>('ITags_');
        this._iFileType = this._dependencies.resolve<IFileType_>('IFileType_');
    }
}
