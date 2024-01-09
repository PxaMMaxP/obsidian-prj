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

    static async sleep(ms: number) {
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
}

export type WikilinkData = {
    date: Date | undefined;
    basename: string | undefined;
    extension: string | undefined;
    filename: string | undefined;
    displayText: string | undefined;
};

