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

/**
 * A delegate that returns a list.
 * The list must not be new.
 */
export type NewListDelegate<ListType> = () => ListType;

/**
 * A delegate that creates an entry.
 * @param entry The entry to create.
 * @returns The created entry.
 */
export type CreateEntryDelegate<EntryType> = (entry: EntryType) => HTMLElement;

/**
 * A delegate that returns the entries of a list.
 */
export type GetEntriesDelegate<EntryType> = () => EntryType[];
