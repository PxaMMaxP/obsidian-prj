// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Helper from "src/libs/Helper";

/**
 * File types used in the app
 * @see {@link Helper.isValidFileType} for a function to check if a string is a valid file type. Change this function if you add a new file type.
 * @see {@link Helper.isPrjTaskManagementFile} for a function to check if a file is a prj task management file. Change this function if you add a new file type.
 */
export type FileType = "Topic" | "Project" | "Task" | "Metadata";

export type FileSubType = null | "Cluster";

export type HistoryEntry = {
    status: string;
    date: string;
};
export type HistoryEntries = HistoryEntry[];

export type Status = "Active" | "Waiting" | "Later" | "Someday" | "Done";

export type Priority = 0 | 1 | 2 | 3;

export type Energy = 0 | 1 | 2 | 3;

export type UrgencySymbols = "🔴" | "🟠" | "🟡" | "🟢" | "🔵";