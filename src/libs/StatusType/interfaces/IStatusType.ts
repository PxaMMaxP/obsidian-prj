import { IComparable } from 'src/interfaces/IComparable';
import { IEquatable } from 'src/interfaces/IEquatable';
import { IStringConvertible } from 'src/interfaces/IStringifiable';
import {
    IBaseComplexDataType,
    IBaseComplexDataType_,
} from 'src/libs/BaseComplexDataType/interfaces/IBaseComplexDataType';

/**
 * Represents the status of a task.
 */
export type StatusTypes = 'Active' | 'Waiting' | 'Later' | 'Someday' | 'Done';

/**
 * Represents the static implementation of the {@link IStatusType} interface.
 */
export interface IStatusType_ extends IBaseComplexDataType_ {
    /**
     * Initializes a new instance of a IStatusType class.
     * @param value The value of the Status.
     */
    new (value: unknown): IStatusType;
    /**
     * Gets the array of valid Status types.
     */
    get types(): StatusTypes[];
    /**
     * Checks if the object is an {@link StatusTypes|Status Type}.
     * @param value The object to check.
     * @returns Whether the object is an {@link StatusTypes|Status Type}.
     */
    isValid(value: unknown): boolean;
    /**
     * Validates the status type.
     * @param value The value to validate.
     * @returns The valid status type or undefined if the value is not valid.
     */
    validate(value: unknown): StatusTypes | undefined;
    /**
     * Gets the valid status from a translation.
     * E.g. if the translation is 'Aktiv', the valid status is 'Active'.
     * @param status The translation to check.
     * @returns The valid status or undefined if the translation is not valid.
     */
    getValidStatusFromTranslation(status: string): StatusTypes | undefined;
}

/**
 * Represents the status of a task.
 */
export interface IStatusType
    extends IBaseComplexDataType,
        IComparable<IStatusType>,
        IEquatable,
        IStringConvertible {
    /**
     * Gets the Status.
     */
    get value(): StatusTypes | undefined;
    /**
     * Sets the Status.
     */
    set value(value: unknown);

    /**
     * Compares this object to another object.
     * @param other The other object to compare.
     * @returns A number indicating the order of the objects.
     * E.g. -1 if the Status is more complete than the other Status,
     * 0 if they are equal, and 1 if the Status is less complete than the other Status.
     */
    compareTo(other: IStatusType): number;
}

/**
 * Checks if the object is an {@link IStatusType}.
 * @param obj The object to check.
 * @returns Whether the object is an {@link IStatusType}.
 */
export function isIStatusType(obj: unknown): obj is IStatusType {
    return (
        obj != null &&
        typeof obj === 'object' &&
        typeof (obj as IStatusType).value !== 'undefined' &&
        typeof (obj as IStatusType).compareTo === 'function'
    );
}
