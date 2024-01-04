import { Energy, FileSubType, FileType, Priority, Status } from "../types/PrjTypes";

export default interface IPrjTaskManagement {
    type: FileType | null | undefined;
    subType: FileSubType | null | undefined;
    title: string | null | undefined;
    description: string | null | undefined;
    status: Status | null | undefined;
    priority: Priority | null | undefined;
    energy: Energy | null | undefined;
    due: Date | null | undefined;
}