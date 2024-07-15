import {
    IBaseComplexDataType,
    IBaseComplexDataType_,
} from 'src/libs/BaseComplexDataType/interfaces/IBaseComplexDataType';
import { ILifecycleObject } from 'src/libs/LifecycleManager/interfaces/ILifecycleManager';

/**
 * Represents the types used in the plugin.
 */
export type FileTypes = 'Topic' | 'Project' | 'Task' | 'Metadata' | 'Note';

/**
 * Represents the static implementation of the FileType class.
 */
export interface IFileType_ extends IBaseComplexDataType_, ILifecycleObject {
    /**
     * Initializes a new instance of the FileType class.
     * @param value The value of the file type.
     */
    new (value: unknown): IFileType;
    /**
     * Gets the array of valid file types.
     */
    get types(): FileTypes[];
    /**
     * Registers the FileType class in the DIContainer.
     * @remarks This class has no dependencies. Therefore, it is registered in the beforeInit stage.
     */
    beforeInit(): void | Promise<void>;
    /**
     * Checks if the value is a valid file type.
     * @param value The value to check.
     * @returns Whether the value is a valid file type.
     */
    isValid(value: unknown): boolean;
    /**
     * Validates the file type.
     * @param value The value to validate.
     * @param types The valid file types.
     * @returns True if the value is valid and of the correct type; otherwise, false.
     */
    isValidOf(value: unknown, types: FileTypes | FileTypes[]): boolean;
    /**
     * Validates the file type.
     * @param value The value to validate.
     * @returns The valid file type or undefined if the value is not valid.
     */
    validate(value: unknown): FileTypes | undefined;
}

/**
 * Represents the FileType class.
 */
export interface IFileType extends IBaseComplexDataType {
    /**
     * Gets the file type.
     */
    get value(): FileTypes | undefined;
    /**
     * Sets the file type.
     */
    set value(value: unknown);
    /**
     * Gets the File Type as a string.
     * @returns The File Type as string.
     */
    valueOf(): string;
    /**
     * Gets the File Type as a string.
     * @returns The File Type as string.
     */
    toString(): string;
    /**
     * Checks if the File Type is equal to another File Type.
     * @param other The other File Type to compare.
     * @returns Whether the File Type is equal to the other File Type.
     */
    equals(other: IFileType | FileTypes): boolean;
}
