import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import { ISettingRowProtected } from './ISettingRow';

/**
 * Generic static interface for a setting column.
 */
export interface ISettingColumn_<
    Type extends new (
        parent: ISettingRowProtected,
        configure?: ConstructorParameters<Type>[1],
    ) => ISettingColumn,
> {
    /**
     * @param parent The parent setting row.
     * @param configure A function that configures the setting column.
     */
    new (
        parent: ISettingRowProtected,
        configure?: ConstructorParameters<Type>[1],
    ): ISettingColumn;
}

/**
 * Generic interface for setting column.
 */
export interface ISettingColumnProtected {
    /**
     * The elements of the setting column.
     * @example
     * You can define the elements in the setting column as follows:
     * ```ts
     * interface SettingColumn extends ISettingColumnProtected {
     *     elements: {
     *         testEl: HTMLDivElement;
     *         // ...
     *     };
     * }
     * ```
     */
    get elements(): HTMLElementMap;

    /**
     * The parent setting item.
     */
    get parentSettingItem(): ISettingRowProtected;
}

/**
 * Generic interface for setting column.
 */
export interface ISettingColumn extends IDIComponent {
    /**
     * Apply the {@link SettingColumnConfigurator} to the setting item.
     */
    onload(): void;
    /**
     * Get the value of the setting column.
     */
    get value(): unknown;
}

/**
 * A function that configures a setting column.
 */
export type SettingColumnConfigurator<T> = (instance: T) => void;

export type HTMLElementMap = Readonly<Record<string, HTMLElement>>;
