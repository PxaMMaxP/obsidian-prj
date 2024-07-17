/**
 * Represents data from a note.
 */
export interface IPrjNote {
    /**
     * Get the **date** of the note.
     */
    get date(): string | null | undefined;
    /**
     * Set the **date** of the note.
     */
    set date(value: string | null | undefined);
}
