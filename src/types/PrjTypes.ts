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