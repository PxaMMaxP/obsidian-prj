import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { isIStringConvertible } from 'src/interfaces/DataType/IStringifiable';
import type { ILogger_, ILogger } from 'src/interfaces/ILogger';
import {
    IStatusType,
    IStatusType_,
    StatusTypes,
} from './interfaces/IStatusType';
import { Inject } from '../DependencyInjection/decorators/Inject';
import { Register } from '../DependencyInjection/decorators/Register';
import type ITranslationService from '../TranslationService/interfaces/ITranslationService';

/**
 * Represents a status type.
 */
@Register('IStatusType_')
@ImplementsStatic<IStatusType_>()
export class StatusType implements IStatusType {
    @Inject('ITranslationService')
    private static readonly _ITranslationService: ITranslationService;

    /**
     * The logger to use for logging messages.
     * If not provided, no messages will be logged.
     */
    @Inject('ILogger_', (x: ILogger_) => x.getLogger('StatusType'), false)
    private static readonly _logger?: ILogger;

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
     * Initializes a new instance of a StatusType class.
     * @param value The value of the Status.
     */
    constructor(value: unknown) {
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
        let status: StatusTypes | undefined;

        if (value instanceof StatusType) {
            status = value.value;
        } else if (
            value === null ||
            value === undefined ||
            typeof value !== 'string'
        ) {
            status = undefined;
        } else if (StatusType._statusTypes.includes(value as StatusTypes)) {
            status = value as StatusTypes;
        }

        if (status === undefined) {
            this._logger?.warn(
                `The value is not a valid status type:`,
                value,
                `Setting the value to undefined.`,
            );
        }

        return status;
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
    primitiveOf(): string {
        return this._value ?? '';
    }

    /**
     * @inheritdoc
     */
    toString(): string {
        return this._value ?? '';
    }

    /**
     * Checks if the object is an instance of the type.
     * @param obj The object to check.
     * @returns Whether the object is an instance of the type.
     */
    [Symbol.hasInstance](obj: unknown): boolean {
        return obj instanceof StatusType;
    }
}
