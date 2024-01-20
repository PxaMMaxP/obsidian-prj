import Translations from '../translations/translations.json';
import Global from './Global';

export default class Lng {
    /**
     * Returns a translation for the given key.
     * @param key The key to translate.
     * @returns The translation.
     * @remarks - If the translation is not found, the key is returned.
     * - Look at the `translations.json` file to see all available translations.
     */
    public static gt(key: string): string {
        const logger = Global.getInstance().logger;
        const lang = Global.getInstance().settings.language;
        const translation = Translations as Translations;
        const language = translation.find((v) => v.lang === lang);

        if (language) {
            if (language.translations.hasOwnProperty(key)) {
                return language.translations[key] as string;
            }
        }
        logger.warn(`Translation for key ${key} not found`);

        return key;
    }

    /**
     * Returns all translations for the given key.
     * @param key The key to translate.
     * @returns The translations.
     * @remarks - If the translation is not found, the key is returned.
     * - Look at the `translations.json` file to see all available translations.
     */
    public static gtAll(key: string): string[] {
        const logger = Global.getInstance().logger;
        const translations = Translations as Translations;
        const translationStrings: string[] = [];

        for (const language of translations) {
            if (language.translations.hasOwnProperty(key)) {
                translationStrings.push(language.translations[key]);
            } else {
                logger.warn(`Translation for key ${key} not found`);
                translationStrings.push(key);
            }
        }

        return translationStrings;
    }
}

interface LanguageTranslations {
    lang: string;
    translations: Record<string, string>;
}
type Translations = LanguageTranslations[];
