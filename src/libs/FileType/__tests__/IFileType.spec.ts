/* istanbul ignore file */

import { DIContainer } from 'src/libs/DependencyInjection/DIContainer';
import { IFileType_, FileTypes } from '../interfaces/IFileType';

/**
 * Tests the implementation of the IFileType_/IFileType interface.
 * @param FileTypeClass The implementation of the IFileType_/IFileType interface.
 */
export function testIFileTypeImplementation(FileTypeClass: IFileType_): void {
    describe('IFileType Implementation Tests', () => {
        let validTypes: FileTypes[];
        let invalidTypes: unknown[];

        beforeAll(() => {
            validTypes = ['Topic', 'Project', 'Task', 'Metadata', 'Note'];
            invalidTypes = [null, undefined, '', 'InvalidType', 123, {}, []];
        });

        describe('Initialization', () => {
            it('should initialize with a valid file type', () => {
                validTypes.forEach((type) => {
                    const fileType = new FileTypeClass(type);
                    expect(fileType.value).toBe(type);
                });
            });

            it('should initialize with null or undefined as undefined', () => {
                [null, undefined].forEach((type) => {
                    const fileType = new FileTypeClass(type);
                    expect(fileType.value).toBeUndefined();
                });
            });
        });

        describe('Validation', () => {
            it('should validate valid file types correctly', () => {
                validTypes.forEach((type) => {
                    expect(FileTypeClass.isValid(type)).toBe(true);
                });
            });

            it('should invalidate invalid file types correctly', () => {
                invalidTypes.forEach((type) => {
                    expect(FileTypeClass.isValid(type)).toBe(false);
                });
            });

            it('should return undefined for invalid file types', () => {
                invalidTypes.forEach((type) => {
                    expect(FileTypeClass.validate(type)).toBeUndefined();
                });
            });

            it('should return correct FileType for valid file types', () => {
                validTypes.forEach((type) => {
                    expect(FileTypeClass.validate(type)).toBe(type);
                });
            });
        });

        describe('Value Handling', () => {
            it('should get and set value correctly', () => {
                const fileType = new FileTypeClass(null);

                validTypes.forEach((type) => {
                    fileType.value = type;
                    expect(fileType.value).toBe(type);
                });
            });

            it('should return undefined for invalid set values', () => {
                const fileType = new FileTypeClass('Topic');

                invalidTypes.forEach((type) => {
                    fileType.value = type;
                    expect(fileType.value).toBeUndefined();
                });
            });
        });

        describe('String Representation', () => {
            it('should return correct string representation', () => {
                validTypes.forEach((type) => {
                    const fileType = new FileTypeClass(type);
                    expect(fileType.valueOf()).toBe(type);
                    expect(fileType.toString()).toBe(type);
                });
            });

            it('should return empty string for undefined value', () => {
                const fileType = new FileTypeClass(undefined);
                expect(fileType.valueOf()).toBe('');
                expect(fileType.toString()).toBe('');
            });
        });

        describe('Equality Check', () => {
            it('should return true for equal file types', () => {
                const fileType1 = new FileTypeClass('Topic');
                const fileType2 = new FileTypeClass('Topic');
                expect(fileType1.equals(fileType2)).toBe(true);
            });

            it('should return false for different file types', () => {
                const fileType1 = new FileTypeClass('Topic');
                const fileType2 = new FileTypeClass('Project');
                expect(fileType1.equals(fileType2)).toBe(false);
            });
        });

        describe('Check getFrontmatterObject', () => {
            it('should return the same value as the valueOf method', () => {
                const fileType = new FileTypeClass('Topic');

                expect(fileType.getFrontmatterObject()).toBe(
                    fileType.valueOf(),
                );
            });
        });

        describe('isValidOf', () => {
            it('should return true for valid file types', () => {
                validTypes.forEach((type) => {
                    expect(FileTypeClass.isValidOf(type, type)).toBe(true);
                });
            });

            it('should return true for valid file types', () => {
                validTypes.forEach((type) => {
                    expect(FileTypeClass.isValidOf(type, validTypes)).toBe(
                        true,
                    );
                });
            });

            it('should return false for invalid file types', () => {
                validTypes.forEach((type) => {
                    invalidTypes.forEach((invalidType) => {
                        expect(FileTypeClass.isValidOf(invalidType, type)).toBe(
                            false,
                        );
                    });
                });
            });
        });
    });

    describe('should register the class in the DI container', () => {
        it('should register the class in the DI container', () => {
            const diContainerMock = DIContainer.getInstance();
            diContainerMock.register = jest.fn();

            FileTypeClass.beforeInit();

            expect(diContainerMock.register).toHaveBeenCalledWith(
                'IFileType_',
                FileTypeClass,
            );
        });
    });
}
