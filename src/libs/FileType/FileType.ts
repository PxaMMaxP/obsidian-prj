import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Register } from 'ts-injex';
import { IFileType, FileTypes, IFileType_ } from './interfaces/IFileType';

/**
 * Represents the types used in the app for files.
 */
@ImplementsStatic<IFileType_>()
@Register('IFileType_')
export class FileType implements IFileType {
    /**
     * An array of valid file types.
     */
    private static readonly _fileTypes: FileTypes[] = [
        'Topic',
        'Project',
        'Task',
        'Metadata',
        'Note',
    ];

    /**
     * Gets the array of valid file types.
     */
    public static get types(): FileTypes[] {
        return FileType._fileTypes;
    }

    private _value: FileTypes | undefined;

    /**
     * Gets the file type.
     */
    public get value(): FileTypes | undefined {
        return this._value;
    }

    /**
     * Sets the file type.
     */
    public set value(value: unknown) {
        this._value = FileType.validate(value);
    }

    /**
     * Checks if the value is a valid file type.
     * @param value The value to check.
     * @returns Whether the value is a valid file type.
     */
    public static isValid(value: unknown): boolean {
        return this.validate(value) !== undefined;
    }

    /**
     * Validates the file type.
     * @param value The value to validate.
     * @returns The valid file type or undefined if the value is not valid.
     */
    public static validate(value: unknown): FileTypes | undefined {
        if (
            value === null ||
            value === undefined ||
            typeof value !== 'string'
        ) {
            return undefined;
        } else if (FileType._fileTypes.includes(value as FileTypes)) {
            return FileType._fileTypes.includes(value as FileTypes)
                ? (value as FileTypes)
                : undefined;
        }
    }

    /**
     * Validates the file type.
     * @param value The value to validate.
     * @param types The valid file types.
     * @returns True if the value is valid and of the correct type; otherwise, false.
     */
    public static isValidOf(
        value: unknown,
        types: FileTypes | FileTypes[],
    ): boolean {
        if (Array.isArray(types)) {
            return types.includes(
                FileType.validate(value) ?? ('' as FileTypes),
            );
        } else {
            return FileType.validate(value) === types;
        }
    }

    /**
     * Initializes a new instance of the FileType class.
     * @param value The value of the file type.
     */
    constructor(value: unknown) {
        this.value = value;
    }

    /**
     * Gets a frontmatter compatible string.
     * @returns The File Type as string.
     */
    getFrontmatterObject(): string {
        return this._value ?? '';
    }
    /**
     * Gets the File Type as a string.
     * @returns The File Type as string.
     */
    primitiveOf(): string {
        return this._value ?? '';
    }
    /**
     * Gets the File Type as a string.
     * @returns The File Type as string.
     */
    toString(): string {
        return this._value ?? '';
    }
    /**
     * Checks if the File Type is equal to another File Type.
     * @param other The other File Type to compare.
     * @returns Whether the File Type is equal to the other File Type.
     */
    equals(other: IFileType | FileTypes): boolean {
        return this._value === other.toString();
    }

    /**
     * Checks if the object is an instance of the type.
     * @param obj The object to check.
     * @returns Whether the object is an instance of the type.
     */
    [Symbol.hasInstance](obj: unknown): boolean {
        return obj instanceof FileType;
    }
}
