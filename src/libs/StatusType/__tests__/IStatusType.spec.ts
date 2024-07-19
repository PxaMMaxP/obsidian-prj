import MockLogger, { MockLogger_ } from 'src/__mocks__/ILogger.mock';
import { DIContainer } from 'src/libs/DependencyInjection/DIContainer';
import ITranslationService from 'src/libs/TranslationService/interfaces/ITranslationService';
import { IStatusType_, IStatusType } from '../interfaces/IStatusType';

/**
 * Test the IStatusType implementation.
 * @param StatusType The IStatusType implementation to test.
 * Must implement {@link IStatusType}, {@link IStatusType_}
 */
export function test_IStatusType(StatusType: IStatusType_) {
    describe('IDIContainer Implementation Tests', () => {
        let statusType: IStatusType;
        DIContainer.getInstance().register('ILogger_', MockLogger_);

        const ITranslationServiceMock: ITranslationService = {
            get: jest.fn(),
            getAll(key: string): string[] {
                switch (key) {
                    case 'StatusActive':
                        return ['Active', 'Aktiv'];
                    case 'StatusWaiting':
                        return ['Waiting', 'Wartend'];
                    case 'StatusLater':
                        return ['Later', 'Später'];
                    case 'StatusSomeday':
                        return ['Someday', 'Irgendwann'];
                    case 'StatusDone':
                        return ['Done', 'Erledigt'];
                    default:
                        return [key];
                }
            },
        };

        DIContainer.getInstance().register(
            'ITranslationService',
            ITranslationServiceMock,
        );

        beforeEach(() => {
            statusType = new StatusType('');
            MockLogger_.reset();
        });

        test('should return undefined', () => {
            expect(statusType.value).toBe(undefined);
        });

        test('should set status to valid value', () => {
            statusType.value = 'Active';
            expect(statusType.value).toBe('Active');
        });

        test('should set status to undefined if value is invalid', () => {
            statusType.value = 12;

            expect(statusType.value).toBe(undefined);

            expect(MockLogger.warn).toHaveBeenCalledWith(
                `The value is not a valid status type:`,
                12,
                `Setting the value to undefined.`,
            );
        });

        test('should return a list of valid status types', () => {
            expect(StatusType.types).toEqual([
                'Active',
                'Waiting',
                'Later',
                'Someday',
                'Done',
            ]);
        });

        test('should return the valid status type', () => {
            expect(StatusType.validate('Active')).toBe('Active');
            expect(StatusType.validate('Waiting')).toBe('Waiting');
            expect(StatusType.validate('Later')).toBe('Later');
            expect(StatusType.validate('Someday')).toBe('Someday');
            expect(StatusType.validate('Done')).toBe('Done');
        });

        test('should return undefined on invalid status', () => {
            expect(StatusType.validate('Active!')).toBe(undefined);

            expect(MockLogger.warn).toHaveBeenCalledWith(
                `The value is not a valid status type:`,
                'Active!',
                `Setting the value to undefined.`,
            );
        });

        test('should return true if value is valid', () => {
            expect(StatusType.isValid('Active')).toBe(true);
            expect(StatusType.isValid('Waiting')).toBe(true);
            expect(StatusType.isValid('Later')).toBe(true);
            expect(StatusType.isValid('Someday')).toBe(true);
            expect(StatusType.isValid('Done')).toBe(true);
        });

        test('should return false if value is invalid', () => {
            expect(StatusType.isValid('Active1')).toBe(false);
            expect(StatusType.isValid('Waiting2')).toBe(false);
            expect(StatusType.isValid('Later3')).toBe(false);
            expect(StatusType.isValid('Someday4')).toBe(false);
            expect(StatusType.isValid('Done5')).toBe(false);
        });

        test('should return true if a equal status is passed', () => {
            statusType.value = 'Active';
            expect(statusType.equals(new StatusType('Active'))).toBe(true);
        });

        test('should return false if a different status is passed', () => {
            expect(statusType.equals(new StatusType('Done'))).toBe(false);
        });

        test('should return false if a non status is passed', () => {
            expect(statusType.equals(123)).toBe(false);
        });

        test('compare should return 0 if values are equal', () => {
            const status1 = new StatusType('Active');
            const status2 = new StatusType('Active');

            expect(status1.compareTo(status2)).toBe(0);
        });

        test('compare should return -1 if value is more complete', () => {
            const status1 = new StatusType('Done');
            const status2 = new StatusType('Active');

            expect(status1.compareTo(status2)).toBe(-1);
        });

        test('compare should return 1 if value is less complete', () => {
            const status1 = new StatusType('Active');
            const status2 = new StatusType('Done');

            expect(status1.compareTo(status2)).toBe(1);
        });

        test('compare should return -1 if value is not a valid status', () => {
            const status1 = new StatusType('Active');
            const status2 = new StatusType(12);

            expect(status1.compareTo(status2)).toBe(-1);
        });

        test('compare should return -1 if value is not a valid status', () => {
            const status1 = new StatusType('Active');
            const status2 = new StatusType('');

            expect(status1.compareTo(status2)).toBe(-1);
        });

        test('compare should return -1 if value is IStringConvertible', () => {
            const status1 = new StatusType('Active');

            const status2 = {
                valueOf: undefined,
                toString: undefined,
            };

            expect(status1.compareTo(status2 as unknown as IStatusType)).toBe(
                -1,
            );
        });

        test('should return the status as string', () => {
            statusType.value = 'Active';

            expect(statusType.getFrontmatterObject()).toBe('Active');
            expect(statusType.toString()).toBe('Active');
            expect(statusType.valueOf()).toBe('Active');
        });

        test('should return the valid status from a translation', () => {
            expect(StatusType.getValidStatusFromTranslation('Aktiv')).toBe(
                'Active',
            );

            expect(StatusType.getValidStatusFromTranslation('Wartend')).toBe(
                'Waiting',
            );

            expect(StatusType.getValidStatusFromTranslation('Später')).toBe(
                'Later',
            );

            expect(StatusType.getValidStatusFromTranslation('Irgendwann')).toBe(
                'Someday',
            );

            expect(StatusType.getValidStatusFromTranslation('Erledigt')).toBe(
                'Done',
            );
        });
    });
}
