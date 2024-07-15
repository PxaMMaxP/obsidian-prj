import { IFileType } from 'src/libs/FileType/interfaces/IFileType';
import {
    Energy,
    FileSubType,
    HistoryEntries,
    Priority,
    Status,
} from '../types/PrjTypes';

export default interface IPrjTaskManagement {
    type: IFileType | null | undefined;
    subType: FileSubType | null | undefined;
    title: string | null | undefined;
    description: string | null | undefined;
    status: Status | null | undefined;
    priority: Priority | null | undefined;
    energy: Energy | null | undefined;
    due: string | null | undefined;
    history: HistoryEntries | null | undefined;
    aliases: string[] | null | undefined;
}
