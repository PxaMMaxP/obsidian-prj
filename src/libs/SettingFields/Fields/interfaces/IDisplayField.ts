import { Component } from 'obsidian';
import { ISettingField } from '../../interfaces/ISettingField';

/**
 * A delegate that adds an entry to a list.
 * @param list The list to add the entry to.
 * @param entryToAdd The entry to add to the list.
 * @returns Whether the entry was added to the list.
 */
export type AddDelegate<EntryType, ListType> = (
    list: ListType,
    entryToAdd: EntryType,
) => boolean;

/**
 * A delegate that removes an entry from a list.
 * @param list The list to remove the entry from.
 * @param entryToRemove The entry to remove from the list.
 * @returns Whether the entry was removed from the list.
 */
export type RemoveDelegate<EntryType, ListType> = (
    list: ListType,
    entryToRemove: EntryType,
) => boolean;

/**
 * A delegate that creates a new list.
 */
export type NewListDelegate<ListType> = () => ListType;

export type CreateEntryDelegate<EntryType> = (entry: EntryType) => HTMLElement;

export type GetEntriesDelegate<EntryType> = () => EntryType[];

/**
 * Represents a display field.
 * @remarks The display field is between the info field and the input field.
 */
export interface IDisplayField<EntryType, ListType>
    extends Component,
        ISettingField {
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
 * Represents a fluent API for the display field.
 */
export interface IDisplayFieldFluentAPI<EntryType, ListType>
    extends IDisplayField<EntryType, ListType> {
    /**
     * Sets a delegate that creates a new list.
     * @param newListDelegate The delegate that creates a new list.
     * @returns The fluent API.
     */
    setList(
        newListDelegate: NewListDelegate<ListType>,
    ): IDisplayFieldFluentAPI<EntryType, ListType>;

    /**
     * Sets the classes of the list.
     * @param classes The classes of the list.
     * @returns The fluent API.
     */
    setListClasses(
        classes: string[],
    ): IDisplayFieldFluentAPI<EntryType, ListType>;

    /**
     * Sets a delegate that adds an entry to the list.
     * @param addDelegate The delegate that adds an entry to the list.
     * @returns The fluent API.
     */
    setAddDelegate(
        addDelegate: AddDelegate<EntryType, ListType>,
    ): IDisplayFieldFluentAPI<EntryType, ListType>;

    /**
     * Sets a delegate that removes an entry from the list.
     * @param removeDelegate The delegate that removes an entry from the list.
     * @returns The fluent API.
     */
    setRemoveDelegate(
        removeDelegate: RemoveDelegate<EntryType, ListType>,
    ): IDisplayFieldFluentAPI<EntryType, ListType>;

    /**
     * Sets the default entries of the list.
     * @param entries The default entries of the list.
     * @returns The fluent API.
     */
    setDefaultEntries(
        entries: GetEntriesDelegate<EntryType>,
    ): IDisplayFieldFluentAPI<EntryType, ListType>;

    /**
     * Sets a delegate that creates an entry.
     * @param createEntryDelegate The delegate that creates an entry.
     * @returns The fluent API.
     */
    setCreateEntryDelegate(
        createEntryDelegate: CreateEntryDelegate<EntryType>,
    ): IDisplayFieldFluentAPI<EntryType, ListType>;
}

export const entryObject = Symbol('ListEntry');

export interface IDisplayEntry<EntryType> extends HTMLDivElement {
    [entryObject]?: EntryType;
}
