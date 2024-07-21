import { moment } from 'obsidian';
import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { Singleton } from 'src/classes/decorators/Singleton';
import { DIContainer } from '../DependencyInjection/DIContainer';
import type { IDIContainer } from '../DependencyInjection/interfaces/IDIContainer';
import { Lifecycle } from '../LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from '../LifecycleManager/interfaces/ILifecycleObject';

export interface IHelperGeneral_ {
    generateUID(input: string, length: number, sufix: string): string;
    generateAcronym(text: string, length: number, prefix: string): string;
    sleep(ms: number): Promise<void>;
    deepClone<T>(obj: T): T;
    containsMarkdown(text: string): boolean;
    isEmoji(str: string): boolean;
}

/**
 * Represents a class for general helper methods.
 * @see {@link Singleton}
 * @see {@link Lifecycle}
 */
@Lifecycle()
@ImplementsStatic<ILifecycleObject>()
@ImplementsStatic<IHelperGeneral_>()
export class HelperGeneral {
    private static readonly _md5 = require('crypto-js/md5');

    /**
     * Create a Singleton instance of the HelperObsidian class.
     * @param dependencies The dependencies for the class.
     */
    public constructor(dependencies?: IDIContainer) {
        throw new Error('This class is not meant to be instantiated');
    }

    /**
     * This method is called when the application is unloaded.
     */
    public static beforeLoad(): void {
        DIContainer.getInstance().register('IHelperGeneral_', HelperGeneral);
    }

    /**
     * Formats a date string according to the specified format.
     * @param date - The date string to be formatted.
     * @param format - The format string specifying the desired output format.
     * @returns The formatted date string, or the original date string if it is not in a valid format.
     */
    public static formatDate(date: string, format: string): string {
        const regexDate =
            /^\d{4}-\d{2}-\d{2}(T\d{2}(:\d{2}(:\d{2}(\.\d{3})?)?)?)?$/;

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
     * Generates a UID from the given input
     * @param input The input to generate the UID from
     * @param length The length of the UID
     * @param sufix The sufix to add to the UID
     * @returns The generated UID with the given length
     * @remarks - This method uses the MD5 hash algorithm to generate the UID
     * - The UID is prefixed with a "U" to prevent the UID from starting with a number. The "U" counts to the length of the UID
     */
    public static generateUID(input: string, length = 8, sufix = 'U'): string {
        const hash = sufix + this._md5(input).toString();

        return hash.substring(0, length);
    }

    /**
     * Generates an acronym from the given text.
     * @param text The input text to generate the acronym from.
     * @param length The desired length of the acronym, default is 6.
     * @param prefix The prefix for the acronym, default is current year.
     * @returns The generated acronym with the specified prefix.
     */
    public static generateAcronym(
        text: string,
        length = 6,
        prefix = 'year',
    ): string {
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
        const words: string[] = text
            .split(' ')
            .filter((word) => word.trim().length > 0);
        let acronym = '';
        // Determine the maximum number of characters per word
        let maxChars: number = Math.floor(length / words.length);

        // Ensure at least one character per word
        if (maxChars < 1) maxChars = 1;

        // Adjust maxChars if total length is insufficient
        if (maxChars * words.length < length) maxChars++;

        // Construct the acronym from the words
        for (let i = 0; i < words.length; i++) {
            acronym += words[i].substring(
                0,
                Math.min(maxChars, words[i].length),
            );

            // Stop if desired length is reached
            if (acronym.length >= length) break;
        }

        // Limit the acronym to the desired length
        acronym = acronym.substring(0, length);

        // Combine the prefix and the acronym
        return prefixValue + acronym;
    }

    /**
     * Sleeps for the given amount of milliseconds
     * @param ms The amount of milliseconds to sleep
     * @returns A promise that resolves after the given amount of milliseconds
     */
    public static async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Deep clones any object.
     * @param obj - The object to be cloned.
     * @returns The cloned object.
     */
    public static deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') {
            // The value is not cloneable (e.g., primitive type), so return it directly
            return obj;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let clonedObj: any;

        if (Array.isArray(obj)) {
            // Handle arrays
            clonedObj = [];

            obj.forEach((val, i) => {
                clonedObj[i] = HelperGeneral.deepClone(val);
            });
        } else {
            // Handle objects
            clonedObj = {};

            Object.keys(obj).forEach((key) => {
                clonedObj[key] = HelperGeneral.deepClone(
                    (obj as { [key: string]: unknown })[key],
                );
            });
        }

        return clonedObj as T;
    }

    /**
     * Checks if the given text is possibly markdown
     * @param text The text to check
     * @returns Whether the text is possibly markdown (true or false)
     * @remarks - This method checks if the text contains any of the following symbols:
     * - `*`, `_`, `[`, `]`, `=` and `-` if there is a line break
     */
    public static containsMarkdown(text: string): boolean {
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
     * Checks if the given string is an emoji
     * @param str The string to check
     * @returns Whether the string is an emoji (true or false)
     */
    public static isEmoji(str: string): boolean {
        const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;

        return emojiRegex.test(str);
    }
}
