import { TFile, moment } from "obsidian";
import Global from "src/classes/Global";
import { FileType } from "src/types/PrjTypes";

export default class Helper {
    private static md5 = require('crypto-js/md5');

    /**
     * Extracts the date, filename, file extension and display text from a wikilink
     * @param wikilink Wikilink to extract the data from, eg. [[2021.01.01 - file.txt|Display text]]
     * @returns {WikilinkData} Object containing the date, filename, file extension and display text
     * 
     */
    static extractDataFromWikilink(wikilink: string | null | undefined): WikilinkData {
        if (wikilink && typeof wikilink === 'string') {
            const dismantledLinkMatch = wikilink.match(/\[\[(.+?)(?:\.(\w+))?(?:\|(.*))?\]\]/);
            let date = undefined;

            if (!dismantledLinkMatch) {
                return {
                    date: undefined,
                    basename: undefined,
                    extension: undefined,
                    filename: undefined,
                    displayText: undefined
                };
            } else {
                // Expected date format is YYYY.MM.DD
                const dateMatch = dismantledLinkMatch[1].match(/(\d{4})\.(\d{2})\.(\d{2})/);
                if (dateMatch) {
                    date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
                }
                // If no file extension is given, use "md" as default. Links without a file extension are always markdown files.
                if (!dismantledLinkMatch[2]) {
                    dismantledLinkMatch[2] = "md"
                }
                return {
                    date: date,
                    basename: dismantledLinkMatch[1],
                    extension: dismantledLinkMatch[2],
                    filename: `${dismantledLinkMatch[1]}.${dismantledLinkMatch[2]}`,
                    displayText: dismantledLinkMatch[3]
                };
            }
        } else {
            return {
                date: undefined,
                basename: undefined,
                extension: undefined,
                filename: undefined,
                displayText: undefined
            };
        }
    }

    /**
     * Generates a UID from the given input
     * @param input The input to generate the UID from
     * @param length The length of the UID
     * @returns The generated UID with the given length
     * @remarks - This method uses the MD5 hash algorithm to generate the UID
     * - The UID is prefixed with a "U" to prevent the UID from starting with a number. The "U" counts to the length of the UID
     */
    static generateUID(input: string, length = 8): string {
        const hash = 'U' + this.md5(input).toString();
        return hash.substring(0, length);
    }

    static formatDate(date: string, format: string): string {
        const regexDate = /^\d{4}-\d{2}-\d{2}$/;
        if (!regexDate.test(date)) {
            return date;
        }
        const formatedDate = moment(date).format(format);
        if (formatedDate === 'Invalid date') {
            return date;
        }
        return formatedDate;
    }

    /**
     * Sleeps for the given amount of milliseconds
     * @param ms The amount of milliseconds to sleep
     * @returns A promise that resolves after the given amount of milliseconds
     */
    static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Checks if the given text is possibly markdown
     * @param text The text to check
     * @returns Whether the text is possibly markdown (true or false)
     * @remarks - This method checks if the text contains any of the following symbols:
     * - `*`, `_`, `[`, `]`, `=` and `-` if there is a line break
     */
    static isPossiblyMarkdown(text: string): boolean {
        let regexMarkdownSymbols;
        const regexLineBreak = /\r?\n/;
        const lineBreak = regexLineBreak.test(text);
        if (lineBreak) {
            // If there is a line break, we need to check for the list symbol
            regexMarkdownSymbols = /[*_\-[\]=]/;
        } else {
            // If there is no line break, we do not need to check for the list symbol
            regexMarkdownSymbols = /[*_[\]=]/;

        }
        return regexMarkdownSymbols.test(text);
    }

    /**
     * Checks if any of the tags in `tagsToCheck` is a substring of any tag in `tagsToBeChecked`
     * @param tagsToCheck The tags to check as substrings
     * @param tagsToBeChecked The tags to be checked against
     * @returns Whether any tag from `tagsToCheck` is a substring of any tag in `tagsToBeChecked`
     */
    static isTagIncluded(tagsToCheck: string | string[], tagsToBeChecked: string | string[]): boolean {
        const _tagsToCheck: string[] = Array.isArray(tagsToCheck) ?
            tagsToCheck : (tagsToCheck ? [tagsToCheck] : []);
        const _tagsToBeChecked: string[] = Array.isArray(tagsToBeChecked) ?
            tagsToBeChecked : (tagsToBeChecked ? [tagsToBeChecked] : []);

        return _tagsToCheck.some(tagToCheck =>
            _tagsToBeChecked.some(tagToBeChecked =>
                tagToBeChecked?.includes(tagToCheck)
            )
        );
    }

    /**
     * Checks if the given file type is valid.
     * @param fileType The file type to check.
     * @returns Whether the file type is valid (true or false).
     */
    static isValidFileType(fileType: string): boolean {
        return ["Topic", "Project", "Task", "Metadata"].includes(fileType);
    }

    /**
     * Checks if the given file is a valid PrjTaskManagement file (Topic, Project or Task).
     * @param file The file to check.
     * @returns Whether the file is a valid PrjTaskManagement file (true or false).
     */
    static isPrjTaskManagementFile(file: TFile): boolean {
        const metadata = Global.getInstance().metadataCache.getEntry(file);
        if (!metadata) {
            return false;
        }
        const type = metadata.metadata.frontmatter?.type as FileType | undefined | null;
        if (!type) {
            return false;
        }
        return ["Topic", "Project", "Task"].includes(type);
    }

    /**
     * Checks if the given string is an emoji
     * @param str The string to check
     * @returns Whether the string is an emoji (true or false)
     */
    static isEmoji(str: string) {
        const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;
        return emojiRegex.test(str);
    }

    /**
     * Generates an acronym from the given text.
     * @param text The input text to generate the acronym from.
     * @param length The desired length of the acronym, default is 6.
     * @param prefix The prefix for the acronym, default is current year.
     * @returns The generated acronym with the specified prefix.
     */
    static generateAcronym(text: string, length = 6, prefix = 'year'): string {
        // Return an empty string if text is not provided
        if (!text) {
            return '';
        }

        // Determine the prefix based on the input or date
        let prefixValue = '';
        if (prefix === 'year') {
            // Extract the last two digits of the current year
            const currentYear: number = new Date().getFullYear();
            prefixValue = currentYear.toString().substring(2);
        } else if (prefix === 'month') {
            // Format the current month as a two-digit number
            const currentMonth: number = new Date().getMonth() + 1;
            prefixValue = currentMonth.toString().padStart(2, '0');
        } else if (prefix) {
            // Use the provided prefix if it's not related to date
            prefixValue = prefix;
        }

        // Split the text into words and filter out empty words
        const words: string[] = text.split(' ').filter(word => word.trim().length > 0);
        let acronym = '';
        // Determine the maximum number of characters per word
        let maxChars: number = Math.floor(length / words.length);
        // Ensure at least one character per word
        if (maxChars < 1) maxChars = 1;
        // Adjust maxChars if total length is insufficient
        if (maxChars * words.length < length) maxChars++;

        // Construct the acronym from the words
        for (let i = 0; i < words.length; i++) {
            acronym += words[i].substring(0, Math.min(maxChars, words[i].length));
            // Stop if desired length is reached
            if (acronym.length >= length) break;
        }

        // Limit the acronym to the desired length
        acronym = acronym.substring(0, length);
        // Combine the prefix and the acronym
        return prefixValue + acronym;
    }

    static getActiveFile(): TFile | undefined {
        const workspace = Global.getInstance().app.workspace;
        const activeFile = workspace.getActiveFile();
        if (!activeFile) {
            return undefined;
        }
        return activeFile;
    }

    static existTag(tag: string): boolean {
        const metadataCache = Global.getInstance().metadataCache.cache;
        const tagFound = metadataCache.find((value) => {
            const tags = value.metadata?.frontmatter?.tags;
            if (!tags) {
                return false;
            }
            if (Array.isArray(tags)) {
                return tags.includes(tag);
            } else {
                return tags === tag;
            }
        });
        return tagFound !== undefined;
    }
}

export type WikilinkData = {
    date: Date | undefined;
    basename: string | undefined;
    extension: string | undefined;
    filename: string | undefined;
    displayText: string | undefined;
};

