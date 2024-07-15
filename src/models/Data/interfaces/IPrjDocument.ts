/**
 * Represents data from a document.
 */
export interface IPrjDocument {
    /**
     * Get the **date** of the document.
     */
    get date(): string | null | undefined;
    /**
     * Set the **date** of the document.
     */
    set date(value: string | null | undefined);

    /**
     * Get the **sender** of the document.
     */
    get sender(): string | null | undefined;
    /**
     * Set the **sender** of the document.
     */
    set sender(value: string | null | undefined);

    /**
     * Get the **recipient** of the document.
     */
    get recipient(): string | null | undefined;
    /**
     * Set the **recipient** of the document.
     */
    set recipient(value: string | null | undefined);

    /**
     * Get the **dateOfDelivery** of the document.
     */
    get dateOfDelivery(): string | null | undefined;
    /**
     * Set the **dateOfDelivery** of the document.
     */
    set dateOfDelivery(value: string | null | undefined);

    /**
     * Get the **hide** status of the document.
     */
    get hide(): boolean | null | undefined;
    /**
     * Set the **hide** status of the document.
     */
    set hide(value: boolean | null | undefined);

    /**
     * Get the **dontChangePdfPath** status of the document.
     */
    get dontChangePdfPath(): boolean | null | undefined;
    /**
     * Set the **dontChangePdfPath** status of the document.
     */
    set dontChangePdfPath(value: boolean | null | undefined);

    /**
     * Get the **file** path of the document.
     */
    get file(): string | null | undefined;
    /**
     * Set the **file** path of the document.
     */
    set file(value: string | null | undefined);

    /**
     * Get the **relatedFiles** of the document.
     */
    get relatedFiles(): string[] | null | undefined;
    /**
     * Set the **relatedFiles** of the document.
     */
    set relatedFiles(value: string[] | null | undefined);

    /**
     * Get the **citationTitle** of the document.
     */
    get citationTitle(): string | null | undefined;
    /**
     * Set the **citationTitle** of the document.
     */
    set citationTitle(value: string | null | undefined);

    /**
     * Get the **annotationTarget** of the document.
     */
    get annotationTarget(): string | null | undefined;
    /**
     * Set the **annotationTarget** of the document.
     */
    set annotationTarget(value: string | null | undefined);
}
