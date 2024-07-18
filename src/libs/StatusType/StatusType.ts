import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { isIStringConvertible } from 'src/interfaces/IStringifiable';
import {
    IStatusType,
    IStatusType_,
    StatusTypes,
} from './interfaces/IStatusType';
import BaseComplexDataType from '../BaseComplexDataType/BaseComplexDataType';
import { Inject } from '../DependencyInjection/decorators/Inject';
import type ITranslationService from '../TranslationService/interfaces/ITranslationService';

/**
 * Represents a status type.
 */
@ImplementsStatic<IStatusType_>()
export class StatusType extends BaseComplexDataType implements IStatusType {
    @Inject('ITranslationService')
    private static _ITranslationService: ITranslationService;

    private static readonly _statusTypes: StatusTypes[] = [
        'Active',
        'Waiting',
        'Later',
        'Someday',
        'Done',
    ];

    /**
     * Gets the array of valid Status types.
     */
    public static get types(): StatusTypes[] {
        return StatusType._statusTypes;
    }

    private _value: StatusTypes | undefined;

    /**
     * @inheritdoc
     */
    get value(): StatusTypes | undefined {
        return this._value;
    }

    /**
     * @inheritdoc
     */
    set value(value: unknown) {
        this._value = StatusType.validate(value);
    }

    /**
     * Checks if the object is an {@link StatusTypes|Status Type}.
     * @param value The object to check.
     * @returns Whether the object is an {@link StatusTypes|Status Type}.
     */
    public static isValid(value: unknown): boolean {
        return this.validate(value) !== undefined;
    }

    /**
     * Validates the status type.
     * @param value The value to validate.
     * @returns The valid status type or undefined if the value is not valid.
     */
    public static validate(value: unknown): StatusTypes | undefined {
        if (
            value === null ||
            value === undefined ||
            typeof value !== 'string'
        ) {
            return undefined;
        } else if (StatusType._statusTypes.includes(value as StatusTypes)) {
            return StatusType._statusTypes.includes(value as StatusTypes)
                ? (value as StatusTypes)
                : undefined;
        }
    }

    /**
     * Gets the valid status from a translation.
     * E.g. if the translation is 'Aktiv', the valid status is 'Active'.
     * @param status The translation to check.
     * @returns The valid status or undefined if the translation is not valid.
     */
    public static getValidStatusFromTranslation(
        status: string,
    ): StatusTypes | undefined {
        let validStatus: StatusTypes | undefined;

        this._statusTypes.forEach((statusFromValidStatuses) => {
            const translation = this._ITranslationService.getAll(
                `Status${statusFromValidStatuses}`,
            );

            translation.forEach((translationFromStatus) => {
                if (translationFromStatus === status) {
                    validStatus = statusFromValidStatuses;
                }
            });
        });

        return validStatus;
    }

    /**
     * @inheritdoc
     */
    compareTo(other: IStatusType): number {
        if (isIStringConvertible(other)) {
            const thisIndex = StatusType._statusTypes.indexOf(
                this._value ?? 'Done',
            );

            const otherIndex = StatusType._statusTypes.indexOf(
                (other.toString() ?? 'Done') as StatusTypes,
            );

            if (thisIndex > otherIndex) {
                return -1;
            } else if (thisIndex < otherIndex) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return -1;
        }
    }

    /**
     * @inheritdoc
     */
    getFrontmatterObject(): unknown {
        return this.toString();
    }

    /**
     * @inheritdoc
     */
    equals(other: unknown): boolean {
        if (isIStringConvertible(other)) {
            return this._value === other.toString();
        } else {
            return this._value === other;
        }
    }

    /**
     * @inheritdoc
     */
    valueOf(): string {
        return this._value ?? '';
    }

    /**
     * @inheritdoc
     */
    toString(): string {
        return this._value ?? '';
    }
}
