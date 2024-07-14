import { moment } from 'obsidian';
import { HelperGeneral } from './Helper/General';

/**
 * Represents a helper class with various utility methods.
 */
export default class Helper {
    /**
     * Formats a date string according to the specified format.
     * @param date - The date string to be formatted.
     * @param format - The format string specifying the desired output format.
     * @returns The formatted date string, or the original date string if it is not in a valid format.
     * @deprecated Use {@link HelperGeneral.formatDate} instead.
     */
    static formatDate(date: string, format: string): string {
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
     * Checks if any of the tags in `tagsToCheck` is a substring of any tag in `tagsToBeChecked`
     * @param tagsToCheck The tags to check as substrings
     * @param tagsToBeChecked The tags to be checked against
     * @returns Whether any tag from `tagsToCheck` is a substring of any tag in `tagsToBeChecked`
     * @deprecated Will be removed in the future.
     */
    static isTagIncluded(
        tagsToCheck: string | string[],
        tagsToBeChecked: string | string[],
    ): boolean {
        const _tagsToCheck: string[] = Array.isArray(tagsToCheck)
            ? tagsToCheck
            : tagsToCheck
              ? [tagsToCheck]
              : [];

        const _tagsToBeChecked: string[] = Array.isArray(tagsToBeChecked)
            ? tagsToBeChecked
            : tagsToBeChecked
              ? [tagsToBeChecked]
              : [];

        return _tagsToCheck.some((tagToCheck) =>
            _tagsToBeChecked.some((tagToBeChecked) =>
                tagToBeChecked?.includes(tagToCheck),
            ),
        );
    }

    /**
     * Checks if any of the tags in `tagsToCheck` match exactly with any tag in `tagsToBeChecked` at the next hierarchy level.
     * For example, if `tagsToCheck` contains "Tag1" and `tagsToBeChecked` contains "Tag1/Tag2", it will return true.
     * But it will return false for "Tag1/Tag2/Tag3" as it's not directly at the next hierarchy level.
     * @param tagsToCheck The tags to check for an exact match
     * @param tagsToBeChecked The tags to be checked against
     * @returns Whether any tag from `tagsToCheck` matches exactly with any tag in `tagsToBeChecked` at the next hierarchy level
     * @deprecated Will be removed in the future.
     */
    static isTagDirectlyBelow(
        tagsToCheck: string | string[],
        tagsToBeChecked: string | string[],
    ): boolean {
        const _tagsToCheck: string[] = Array.isArray(tagsToCheck)
            ? tagsToCheck
            : tagsToCheck
              ? [tagsToCheck]
              : [];

        const _tagsToBeChecked: string[] = Array.isArray(tagsToBeChecked)
            ? tagsToBeChecked
            : tagsToBeChecked
              ? [tagsToBeChecked]
              : [];

        return _tagsToCheck.some((tagToCheck) =>
            _tagsToBeChecked.some((tagToBeChecked) => {
                const pattern = new RegExp(`^${tagToCheck}/[^/]+$`);

                return pattern.test(tagToBeChecked);
            }),
        );
    }
}
