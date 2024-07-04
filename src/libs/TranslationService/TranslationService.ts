import { ILogger } from 'src/interfaces/ILogger';
import ILanguageTranslations from './interfaces/ILanguageTranslations';
import ITranslationService from './interfaces/ITranslationService';
import { PrjSettings } from 'src/types/PrjSettings';

export class TranslationService implements ITranslationService {
    static instance: TranslationService | undefined;
    private logger: ILogger | undefined;
    private _translations: ILanguageTranslations[];
    private _language: string;

    static getInstance(): TranslationService {
        if (!TranslationService.instance) {
            throw new Error('TranslationService not initialized');
        }

        return TranslationService.instance;
    }

    constructor(
        translations: ILanguageTranslations[],
        settings: PrjSettings,
        logger?: ILogger,
    ) {
        TranslationService.instance = this;

        this.logger = logger;
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
        this.logger?.warn(`Translation for key ${key} not found`);

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
                this.logger?.warn(
                    `Translation for key ${key} not found in language ${language.lang}`,
                );
                translationStrings.push(key);
            }
        }

        return translationStrings;
    }
}
