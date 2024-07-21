import { IComparable } from 'src/interfaces/DataType/IComparable';
import { IDataType_ } from 'src/interfaces/DataType/IDataType';
import { IEquatable } from 'src/interfaces/DataType/IEquatable';
import { IInstanceOf } from 'src/interfaces/DataType/IInstanceOf';
import { IPrimitive } from 'src/interfaces/DataType/IPrimitive';
import { IStringConvertible } from 'src/interfaces/DataType/IStringifiable';
import { IValue } from 'src/interfaces/DataType/IValue';

/**
 * Represents the status of a task.
 */
export type StatusTypes = 'Active' | 'Waiting' | 'Later' | 'Someday' | 'Done';

/**
 * Represents the static implementation of the {@link IStatusType} interface.
 */
export interface IStatusType_ extends IDataType_<IStatusType> {
    /**
     * Initializes a new instance of a IStatusType class.
     * @param status The value of the Status.
     */
    new (status: unknown): IStatusType;
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
    extends IComparable<IStatusType>,
        IEquatable,
        IStringConvertible,
        IPrimitive,
        IInstanceOf,
        IValue<StatusTypes> {
    /**
     * Gets the Status.
     * @inheritdoc
     */
    get value(): StatusTypes | undefined;
    /**
     * Sets the Status.
     * @inheritdoc
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
