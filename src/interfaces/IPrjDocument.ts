import { IFileType } from 'src/libs/FileType/interfaces/IFileType';
import { FileSubType } from '../types/PrjTypes';

/**
 * @deprecated Will be removed in the future.
 */
export default interface IPrjDocument {
    type: IFileType | null | undefined;
    subType: FileSubType | null | undefined;
    title: string | null | undefined;
    date: string | null | undefined;
    description: string | null | undefined;
    sender: string | null | undefined;
    recipient: string | null | undefined;
    dateOfDelivery: string | null | undefined;
    hide: boolean | null | undefined;
    dontChangePdfPath: boolean | null | undefined;
    file: string | null | undefined;
    relatedFiles: string[] | null | undefined;
    citationTitle: string | null | undefined;
    annotationTarget: string | null | undefined;
}
