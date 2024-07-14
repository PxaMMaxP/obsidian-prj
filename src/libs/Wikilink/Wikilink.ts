import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import { IWikilink, IWikilink_, IWikilinkMatch } from './IWikilink';
import { DIContainer } from '../DependencyInjection/DIContainer';
import { Lifecycle } from '../LifecycleManager/decorators/Lifecycle';
import { ILifecycleObject } from '../LifecycleManager/interfaces/ILifecycleManager';

/**
 * Represents a Wikilink and its parsed components.
 * @see {@link Lifecycle}
 */
@ImplementsStatic<ILifecycleObject>()
@ImplementsStatic<IWikilink_>()
@Lifecycle
export class Wikilink implements IWikilink {
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

    /**
     * Creates an instance of Wikilink and extracts data from the provided wikilink string.
     * @param wikilink - The wikilink string to be parsed. It can be null or undefined.
     */
    constructor(wikilink: string | null | undefined) {
        this.extractDataFromLink(wikilink);
    }

    /**
     * Registers the Wikilink class with the DI
     */
    public static onLoad(): void {
        DIContainer.getInstance().register('IWikilink_', Wikilink);
    }

    /**
     * Extracts data from the provided wikilink string and populates the instance properties.
     * @param wikilink - The wikilink string to be parsed. It can be null or undefined.
     */
    private extractDataFromLink(wikilink: string | null | undefined): void {
        if (!wikilink || typeof wikilink !== 'string') {
            return;
        } else {
            const dismantledWikilink = this.dismantleWikilink(wikilink);

            if (!dismantledWikilink) {
                return;
            } else {
                this.date = this.parseDate(dismantledWikilink);
                this.basename = dismantledWikilink.filename;
                this.extension = this.parseFileExtension(dismantledWikilink);
                this.filename = `${this.basename}.${this.extension}`;
                this.displayText = dismantledWikilink.text;
            }
        }
    }

    /**
     * Dismantles the wikilink string into its components using a regular expression.
     * @param wikilink - The wikilink string to be dismantled.
     * @returns An object representing the dismantled components of the wikilink or undefined if the wikilink does not match the expected format.
     */
    private dismantleWikilink(wikilink: string): IWikilinkMatch | undefined {
        const match = wikilink.match(/\[\[(.+?)(?:\.(\w+))?(?:\|(.*))?\]\]/);

        if (!match) {
            return undefined;
        } else {
            const [, filename, fileExtension, text] = match;

            return {
                filename,
                fileExtension,
                text,
            };
        }
    }

    /**
     * Parses the date from the dismantled wikilink components.
     * @param wikilinkMatch - The object containing dismantled wikilink components.
     * @returns A Date object if a valid date is found, otherwise undefined.
     */
    private parseDate(wikilinkMatch: IWikilinkMatch): Date | undefined {
        // Expected date format is YYYY.MM.DD
        const dateMatch = wikilinkMatch.filename?.match(
            /(\d{4})\.(\d{2})\.(\d{2})/,
        );

        if (dateMatch) {
            return new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
        } else {
            return undefined;
        }
    }

    /**
     * Parses the file extension from the dismantled wikilink components.
     * @param wikilinkMatch - The object containing dismantled wikilink components.
     * @returns The file extension if found, otherwise 'md' as the default extension.
     */
    parseFileExtension(wikilinkMatch: IWikilinkMatch): string | undefined {
        return wikilinkMatch.fileExtension ?? 'md';
    }
}
