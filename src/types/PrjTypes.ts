/* eslint-disable deprecation/deprecation */
import Lng from 'src/classes/Lng';
import { FileType as FileType_ } from '../libs/FileType/FileType';
import { FileTypes } from '../libs/FileType/interfaces/IFileType';

/**
 * Represents the types used in the app.
 * @deprecated Use {@link FileTypes} instead.
 */
export type FileType = 'Topic' | 'Project' | 'Task' | 'Metadata' | 'Note';

/**
 * Represents the subtypes of a file.
 */
export type FileSubType = null | 'Cluster' | 'Kanban';

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
export type Status = 'Active' | 'Waiting' | 'Later' | 'Someday' | 'Done';

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
export type UrgencySymbols = '🔴' | '🟠' | '🟡' | '🟢' | '🔵';

/**
 * Represents the PrjTypes class.
 */
export default class PrjTypes {
    /**
     * An array of valid file types.
     * @deprecated Use {@link FileType_.types} instead.
     */
    public static readonly fileTypes: FileType[] = [
        'Topic',
        'Project',
        'Task',
        'Metadata',
        'Note',
    ];

    /**
     * Checks if a given value is a valid file type.
     * @param fileType - The value to check.
     * @returns The valid file type or undefined if the value is not valid.
     * @deprecated Use {@link FileType_.validate} instead.
     */
    public static isValidFileType(fileType: unknown): FileType | undefined {
        if (
            fileType &&
            typeof fileType === 'string' &&
            PrjTypes.fileTypes.includes(fileType as FileType)
        ) {
            return fileType as FileType;
        }

        return undefined;
    }

    /**
     * Checks if a given file type or an array of file types is included in another given file type or an array of file types.
     * @param typesToCheck The file type or array of file types to check.
     * @param typesToBeChecked The file type or array of file types to be checked against.
     * @returns A boolean indicating whether the file type(s) to be checked are included in the file type(s) to check.
     * @deprecated Use {@link FileType_.isValidOf} instead.
     */
    public static isTypeIncluded(
        typesToCheck: FileType | FileType[],
        typesToBeChecked: FileType | FileType[],
    ): boolean {
        const _typesToCheck: FileType[] = Array.isArray(typesToCheck)
            ? typesToCheck
            : typesToCheck
              ? [typesToCheck]
              : [];

        const _typesToBeChecked: FileType[] = Array.isArray(typesToBeChecked)
            ? typesToBeChecked
            : typesToBeChecked
              ? [typesToBeChecked]
              : [];

        return _typesToCheck.some((typeToCheck) =>
            _typesToBeChecked.some(
                (typeToBeChecked) => typeToBeChecked === typeToCheck,
            ),
        );
    }

    /**
     * An array of valid file subtypes.
     */
    public static readonly fileSubTypes: FileSubType[] = [
        null,
        'Cluster',
        'Kanban',
    ];

    /**
     * Checks if a given value is a valid file subtype.
     * @param fileSubType - The value to check.
     * @returns The valid file subtype or undefined if the value is not valid.
     */
    public static isValidFileSubType(
        fileSubType: unknown,
    ): FileSubType | undefined {
        if (
            fileSubType &&
            typeof fileSubType === 'string' &&
            PrjTypes.fileSubTypes.includes(fileSubType as FileSubType)
        ) {
            return fileSubType as FileSubType;
        }

        return undefined;
    }

    /**
     * An array of valid task statuses.
     */
    public static readonly statuses: Status[] = [
        'Active',
        'Waiting',
        'Later',
        'Someday',
        'Done',
    ];

    /**
     * Checks if a given value is a valid task status.
     * @param status - The value to check.
     * @returns The valid task status or undefined if the value is not valid.
     */
    public static isValidStatus(status: unknown): Status | undefined {
        if (
            status &&
            typeof status === 'string' &&
            PrjTypes.statuses.includes(status as Status)
        ) {
            return status as Status;
        }

        return undefined;
    }

    /**
     * Returns a valid status if the given status is a valid translation.
     * @param status The status to check.
     * @returns The valid status or undefined if the status is not valid.
     */
    public static getValidStatusFromLanguage(
        status: string,
    ): Status | undefined {
        let validStatus: Status | undefined;

        this.statuses.forEach((statusFromValidStatuses) => {
            const translation = Lng.gtAll(`Status${statusFromValidStatuses}`);

            translation.forEach((translationFromStatus) => {
                if (translationFromStatus === status) {
                    validStatus = statusFromValidStatuses;
                }
            });
        });

        return validStatus;
    }

    /**
     * An array of valid task priorities.
     */
    public static readonly priorities: Priority[] = [0, 1, 2, 3];

    /**
     * Checks if a given value is a valid task priority.
     * @param priority - The value to check.
     * @returns The valid task priority or undefined if the value is not valid.
     */
    public static isValidPriority(priority: unknown): Priority | undefined {
        if (
            priority &&
            typeof priority === 'number' &&
            PrjTypes.priorities.includes(priority as Priority)
        ) {
            return priority as Priority;
        }

        return undefined;
    }

    /**
     * An array of valid task energy levels.
     */
    public static readonly energies: Energy[] = [0, 1, 2, 3];

    /**
     * Checks if a given value is a valid task energy level.
     * @param energy - The value to check.
     * @returns The valid task energy level or undefined if the value is not valid.
     */
    public static isValidEnergy(energy: unknown): Energy | undefined {
        if (
            energy &&
            typeof energy === 'number' &&
            PrjTypes.energies.includes(energy as Energy)
        ) {
            return energy as Energy;
        }

        return undefined;
    }

    /**
     * An array of valid urgency symbols.
     */
    public static readonly urgencySymbols: UrgencySymbols[] = [
        '🔴',
        '🟠',
        '🟡',
        '🟢',
        '🔵',
    ];

    /**
     * Checks if a given value is a valid urgency symbol.
     * @param urgencySymbol - The value to check.
     * @returns The valid urgency symbol or undefined if the value is not valid.
     */
    public static isValidUrgencySymbol(
        urgencySymbol: unknown,
    ): UrgencySymbols | undefined {
        if (
            urgencySymbol &&
            typeof urgencySymbol === 'string' &&
            PrjTypes.urgencySymbols.includes(urgencySymbol as UrgencySymbols)
        ) {
            return urgencySymbol as UrgencySymbols;
        }

        return undefined;
    }
}
