import { moment } from "obsidian";

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
     * Checks if the given string is an emoji
     * @param str The string to check
     * @returns Whether the string is an emoji (true or false)
     */
    static isEmoji(str: string) {
        const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;
        return emojiRegex.test(str);
    }
}

export type WikilinkData = {
    date: Date | undefined;
    basename: string | undefined;
    extension: string | undefined;
    filename: string | undefined;
    displayText: string | undefined;
};

