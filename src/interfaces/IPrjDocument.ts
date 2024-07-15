import { FileType } from 'src/libs/FileType/FileType';
import { FileSubType } from '../types/PrjTypes';

export default interface IPrjDocument {
    type: FileType | null | undefined;
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
