import { IDIComponent } from 'src/libs/DIComponent/interfaces/IDIComponent';
import {
    ISettingColumn,
    ISettingColumnElements,
    ISettingColumnSettings,
} from './ISettingColumn';
import {
    NewListDelegate,
    AddDelegate,
    RemoveDelegate,
    GetEntriesDelegate,
    CreateEntryDelegate,
} from '../types/DisplayField';

/**
 * Instance interface for the display column.
 * @see {@link IDisplayFieldSettings}
 * @see {@link IDisplayFieldElements}
 * @see {@link IDisplayFieldFluentApi}
 * @see {@link IDisplayFieldProtected}
 */
export interface IDisplay<EntryType, ListType>
    extends IDIComponent,
        ISettingColumn {
    /**
     * Gets the entries of the list.
     */
    get entries(): ListType | undefined;

    /**
     * Adds an entry to the list.
     * @param entryToAdd The entry to add to the list.
     * @returns Whether the entry was added to the list.
     * @see {@link AddDelegate}
     */
    addEntry(entryToAdd: EntryType): boolean;

    /**
     * Removes an entry from the list.
     * @param entryToRemove The entry to remove from the list.
     * @returns Whether the entry was removed from the list.
     * @see {@link RemoveDelegate}
     */
    removeEntry(entryToRemove: EntryType): boolean;
}

/**
 * Fluent Api for the display column.
 */
export interface IDisplayFluentApi<EntryType, ListType> {
    /**
     * Sets a delegate that creates a new list.
     * @param newListDelegate The delegate that creates a new list.
     * @returns The fluent API.
     */
    setList(
        newListDelegate: NewListDelegate<ListType>,
    ): IDisplayFluentApi<EntryType, ListType>;

    /**
     * Sets the classes of the list.
     * @param classes The classes of the list.
     * @returns The fluent API.
     */
    setListClasses(classes: string[]): IDisplayFluentApi<EntryType, ListType>;

    /**
     * Sets a delegate that adds an entry to the list.
     * @param addDelegate The delegate that adds an entry to the list.
     * @returns The fluent API.
     */
    setAddDelegate(
        addDelegate: AddDelegate<EntryType, ListType>,
    ): IDisplayFluentApi<EntryType, ListType>;

    /**
     * Sets a delegate that removes an entry from the list.
     * @param removeDelegate The delegate that removes an entry from the list.
     * @returns The fluent API.
     */
    setRemoveDelegate(
        removeDelegate: RemoveDelegate<EntryType, ListType>,
    ): IDisplayFluentApi<EntryType, ListType>;

    /**
     * Sets the default entries of the list.
     * @param entries The default entries of the list.
     * @returns The fluent API.
     */
    setDefaultEntries(
        entries: GetEntriesDelegate<EntryType>,
    ): IDisplayFluentApi<EntryType, ListType>;

    /**
     * Sets a delegate that creates an entry.
     * @param createEntryDelegate The delegate that creates an entry.
     * @returns The fluent API.
     */
    setCreateEntryDelegate(
        createEntryDelegate: CreateEntryDelegate<EntryType>,
    ): IDisplayFluentApi<EntryType, ListType>;
}

/**
 * Settings for the display column.
 */
export interface IDisplayFieldSettings<EntryType, ListType>
    extends ISettingColumnSettings {
    addDelegate?: AddDelegate<EntryType, ListType>;
    removeDelegate?: RemoveDelegate<EntryType, ListType>;
    list?: ListType;
    newListDelegate?: NewListDelegate<ListType>;
    classes?: string[];
    defaultEntries?: GetEntriesDelegate<EntryType>;
    createEntryDelegate?: CreateEntryDelegate<EntryType>;
}

/**
 * Public elements of the display column.
 */
export interface IDisplayFieldElements extends ISettingColumnElements {
    listContainerEl: HTMLDivElement;
}
