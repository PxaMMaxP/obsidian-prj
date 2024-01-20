import {
    Energy,
    FileSubType,
    FileType,
    HistoryEntries,
    Priority,
    Status,
} from '../types/PrjTypes';

export default interface IPrjTaskManagement {
    type: FileType | null | undefined;
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
