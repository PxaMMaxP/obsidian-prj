/**
 * Represents the types used in the app.
 */
export type FileType = "Topic" | "Project" | "Task" | "Metadata";

/**
 * Represents the subtypes of a file.
 */
export type FileSubType = null | "Cluster";

/**
 * Represents a history entry.
 */
export type HistoryEntry = {
    status: string;
    date: string;
};

/**
 * Represents a list of history entries.
 */
export type HistoryEntries = HistoryEntry[];

/**
 * Represents the status of a task.
 */
export type Status = "Active" | "Waiting" | "Later" | "Someday" | "Done";

/**
 * Represents the priority of a task.
 */
export type Priority = 0 | 1 | 2 | 3;

/**
 * Represents the energy level of a task.
 */
export type Energy = 0 | 1 | 2 | 3;

/**
 * Represents the symbols used for urgency.
 */
export type UrgencySymbols = "🔴" | "🟠" | "🟡" | "🟢" | "🔵";

/**
 * Represents the PrjTypes class.
 */
export default class PrjTypes {

    /**
     * An array of valid file types.
     */
    public static readonly fileTypes: FileType[] = ["Topic", "Project", "Task", "Metadata"];

    /**
     * An array of valid file subtypes.
     */
    public static readonly fileSubTypes: FileSubType[] = [null, "Cluster"];

    /**
     * An array of valid task statuses.
     */
    public static readonly statuses: Status[] = ["Active", "Waiting", "Later", "Someday", "Done"];

    /**
     * An array of valid task priorities.
     */
    public static readonly priorities: Priority[] = [0, 1, 2, 3];

    /**
     * An array of valid task energy levels.
     */
    public static readonly energies: Energy[] = [0, 1, 2, 3];

    /**
     * An array of valid urgency symbols.
     */
    public static readonly urgencySymbols: UrgencySymbols[] = ["🔴", "🟠", "🟡", "🟢", "🔵"];

    /**
     * Checks if a given value is a valid file type.
     * @param fileType - The value to check.
     * @returns The valid file type or undefined if the value is not valid.
     */
    public static isValidFileType(fileType: unknown): FileType | undefined {
        if (fileType && typeof fileType === 'string' && PrjTypes.fileTypes.includes(fileType as FileType)) {
            return fileType as FileType;
        }
        return undefined;
    }

    /**
     * Checks if a given value is a valid file subtype.
     * @param fileSubType - The value to check.
     * @returns The valid file subtype or undefined if the value is not valid.
     */
    public static isValidFileSubType(fileSubType: unknown): FileSubType | undefined {
        if (fileSubType && typeof fileSubType === 'string' && PrjTypes.fileSubTypes.includes(fileSubType as FileSubType)) {
            return fileSubType as FileSubType;
        }
        return undefined;
    }

    /**
     * Checks if a given value is a valid task status.
     * @param status - The value to check.
     * @returns The valid task status or undefined if the value is not valid.
     */
    public static isValidStatus(status: unknown): Status | undefined {
        if (status && typeof status === 'string' && PrjTypes.statuses.includes(status as Status)) {
            return status as Status;
        }
        return undefined;
    }

    /**
     * Checks if a given value is a valid task priority.
     * @param priority - The value to check.
     * @returns The valid task priority or undefined if the value is not valid.
     */
    public static isValidPriority(priority: unknown): Priority | undefined {
        if (priority && typeof priority === 'number' && PrjTypes.priorities.includes(priority as Priority)) {
            return priority as Priority;
        }
        return undefined;
    }

    /**
     * Checks if a given value is a valid task energy level.
     * @param energy - The value to check.
     * @returns The valid task energy level or undefined if the value is not valid.
     */
    public static isValidEnergy(energy: unknown): Energy | undefined {
        if (energy && typeof energy === 'number' && PrjTypes.energies.includes(energy as Energy)) {
            return energy as Energy;
        }
        return undefined;
    }

    /**
     * Checks if a given value is a valid urgency symbol.
     * @param urgencySymbol - The value to check.
     * @returns The valid urgency symbol or undefined if the value is not valid.
     */
    public static isValidUrgencySymbol(urgencySymbol: unknown): UrgencySymbols | undefined {
        if (urgencySymbol && typeof urgencySymbol === 'string' && PrjTypes.urgencySymbols.includes(urgencySymbol as UrgencySymbols)) {
            return urgencySymbol as UrgencySymbols;
        }
        return undefined;
    }

}