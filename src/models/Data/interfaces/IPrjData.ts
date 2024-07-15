import { IDIContainer } from 'src/libs/DependencyInjection/interfaces/IDIContainer';
import { IFileType } from 'src/libs/FileType/interfaces/IFileType';
import { ITag } from 'src/libs/Tags/interfaces/ITag';
import { ITags } from 'src/libs/Tags/interfaces/ITags';
import { FileSubType } from 'src/types/PrjTypes';

/**
 * Static interface of {@link IPrjData}.
 */
export interface IPrjData_<T> {
    /**
     * Create a new instance of {@link IPrjData}
     * as represented of project metadata.
     */
    new (data: Partial<T>, dependencies?: IDIContainer): IPrjData & T;
}

/**
 * Common interface for all project data.
 */
export interface IPrjData {
    /**
     * Get the **type** of the file.
     */
    get type(): IFileType | null | undefined;
    /**
     * Set the **type** of the file.
     */
    set type(value: unknown);

    /**
     * Get the **subType** of the file.
     */
    get subType(): FileSubType | null | undefined;

    /**
     * Set the **subType** of the file.
     */
    set subType(value: unknown);

    /**
     * Get the **tags** of the file.
     */
    get tags(): ITags | null | undefined;
    /**
     * Set the **tags** of the file.
     */
    set tags(value: ITags | ITag | string[] | string | null | undefined);

    /**
     * Get the **title** of the file.
     */
    get title(): string | null | undefined;

    /**
     * Set the **title** of the file.
     */
    set title(value: string | null | undefined);

    /**
     * Get the **description** of the file.
     */
    get description(): string | null | undefined;

    /**
     * Set the **description** of the file.
     */
    set description(value: string | null | undefined);
}
