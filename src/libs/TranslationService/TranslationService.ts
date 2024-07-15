import { ILogger } from 'src/interfaces/ILogger';
import { IPrjSettings } from 'src/types/PrjSettings';
import ILanguageTranslations from './interfaces/ILanguageTranslations';
import ITranslationService from './interfaces/ITranslationService';

/**
 * A service that provides translations for the application.
 */
export class TranslationService implements ITranslationService {
    static instance: TranslationService | undefined;
    private _logger: ILogger | undefined;
    private _translations: ILanguageTranslations[];
    private _language: string;

    /**
     * Gets the instance of the TranslationService.
     * @remarks **Singleton**
     * @returns The instance of the TranslationService.
     */
    static getInstance(): TranslationService {
        if (!TranslationService.instance) {
            throw new Error('TranslationService not initialized');
        }

        return TranslationService.instance;
    }

    /**
     * Creates a new instance of the TranslationService.
     * @param translations The translations to use.
     * @param settings The settings to use.
     * @param logger The optional logger to use.
     */
    constructor(
        translations: ILanguageTranslations[],
        settings: IPrjSettings,
        logger?: ILogger,
    ) {
        TranslationService.instance = this;

        this._logger = logger;
        this._translations = translations;
        this._language = settings.language;
    }

    /**
     * Returns a translation for the given key.
     * @param key The key to translate.
     * @returns The translation.
     * @remarks - If the translation is not found, the key is returned.
     * - Look at the `translations.json` file to see all available translations.
     */
    public get(key: string): string {
        const language = this._translations.find(
            (v) => v.lang === this._language,
        );

        if (language) {
            if (language.translations.hasOwnProperty(key)) {
                return language.translations[key] as string;
            }
        }
        this._logger?.warn(`Translation for key ${key} not found`);

        return key;
    }

    /**
     * Returns all translations for the given key.
     * @param key The key to translate.
     * @returns The translations.
     * @remarks - If the translation is not found, the key is returned.
     * - Look at the `translations.json` file to see all available translations.
     */
    public getAll(key: string): string[] {
        const translationStrings: string[] = [];

        for (const language of this._translations) {
            if (language.translations.hasOwnProperty(key)) {
                translationStrings.push(language.translations[key]);
            } else {
                this._logger?.warn(
                    `Translation for key ${key} not found in language ${language.lang}`,
                );
                translationStrings.push(key);
            }
        }

        return translationStrings;
    }
}
