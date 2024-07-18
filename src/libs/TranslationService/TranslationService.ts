import { ImplementsStatic } from 'src/classes/decorators/ImplementsStatic';
import type { ILogger, ILogger_ } from 'src/interfaces/ILogger';
import { Translations } from 'src/translations/Translations';
import type { IPrjSettings } from 'src/types/PrjSettings';
import ILanguageTranslations from './interfaces/ILanguageTranslations';
import ITranslationService, {
    ITranslationService_,
} from './interfaces/ITranslationService';
import { Inject } from '../DependencyInjection/decorators/Inject';
import { RegisterInstance } from '../DependencyInjection/decorators/RegisterInstance';

/**
 * A service that provides translations for the application.
 */
@ImplementsStatic<ITranslationService_>()
@RegisterInstance('ITranslationService', (x) => new x(Translations))
export class TranslationService implements ITranslationService {
    static instance: TranslationService | undefined;
    @Inject('IPrjSettings', (x: IPrjSettings) => x.language)
    private _language!: IPrjSettings['language'];
    @Inject(
        'ILogger_',
        (x: ILogger_) => x.getLogger('TranslationService'),
        false,
    )
    private _logger?: ILogger;
    private _translations: ILanguageTranslations[];

    /**
     * Gets the singleton instance of the translation service.
     * @returns The instance of the TranslationService.
     */
    static getInstance(): TranslationService {
        if (!TranslationService.instance) {
            throw new Error('TranslationService not initialized');
        }

        return TranslationService.instance;
    }

    /**
     * Gets the singleton instance of the translation service..
     * @param translations The translations to use.
     */
    constructor(translations: ILanguageTranslations[]) {
        if (TranslationService.instance) {
            return TranslationService.instance;
        }
        TranslationService.instance = this;

        this._translations = translations;
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
