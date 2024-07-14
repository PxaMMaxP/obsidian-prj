/**
 * Represents a Wikilink and its parsed components.
 */
export interface IWikilink {
    /**
     * The date of the wikilink.
     * @remarks [[2021.01.01 - file.txt|Display text]] => 2021-01-01
     */
    date: Date | undefined;
    /**
     * The basename of the wikilink.
     * @remarks [[2021.01.01 - file.txt|Display text]] => 2021.01.01 - file
     */
    basename: string | undefined;
    /**
     * The extension of the wikilink. Default is 'md'.
     * @remarks [[2021.01.01 - file.txt|Display text]] => txt
     */
    extension: string | undefined;
    /**
     * The filename of the wikilink.
     * @remarks [[2021.01.01 - file.txt|Display text]] => 2021.01.01 - file.txt
     */
    filename: string | undefined;
    /**
     * The display text of the wikilink.
     * @remarks [[2021.01.01 - file.txt|Display text]] => Display text
     */
    displayText: string | undefined;
}

/**
 * Represents a match of a wikilink string.
 */
export interface IWikilinkMatch {
    filename: string | undefined;
    fileExtension: string | undefined;
    text: string | undefined;
}
