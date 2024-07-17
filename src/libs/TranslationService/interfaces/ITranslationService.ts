import { ILogger } from 'src/interfaces/ILogger';
import { IPrjSettings } from 'src/types/PrjSettings';
import ILanguageTranslations from './ILanguageTranslations';

/**
 * Represents a static interface for {@link ITranslationService}.
 */
export interface ITranslationService_ {
    /**
     * Gets the singleton instance of the translation service.
     */
    new (
        translations: ILanguageTranslations[],
        settings?: IPrjSettings,
        logger?: ILogger,
    ): ITranslationService;
    /**
     * Gets the singleton instance of the translation service.
     */
    getInstance(): ITranslationService;
}

/**
 * Represents a interface for the translation service.
 * @see {@link ITranslationService_}
 */
export default interface ITranslationService {
    /**
     * Returns a translation for the given key.
     * @param key The key to translate.
     * @returns The translation.
     * @remarks - If the translation is not found, the key is returned.
     * - Look at the `translations.json` file to see all available translations.
     */
    get(key: string): string;

    /**
     * Returns all translations for the given key.
     * @param key The key to translate.
     * @returns The translations.
     * @remarks - If the translation is not found, the key is returned.
     * - Look at the `translations.json` file to see all available translations.
     */
    getAll(key: string): string[];
}
