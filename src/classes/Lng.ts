import Translations from '../translations/translations.json';
import Global from "./Global";

export default class Lng {
    /**
     * Returns a translation for the given key.
     * @param key The key to translate.
     * @returns The translation.
     * @remarks - If the translation is not found, the key is returned.
     * - Look at the `translations.json` file to see all available translations.
     */
    public static gt(key: string): string {
        const logger = Global.getInstance().logger
        const lang = Global.getInstance().settings.language;
        const translation = (Translations as Translations);
        const language = translation.find((v) => v.lang === lang);
        if (language) {
            if (language.translations.hasOwnProperty(key)) {
                return language.translations[key] as string;
            }
        }
        logger.warn(`Translation for key ${key} not found`);
        return key;
    }
}

interface LanguageTranslations {
    lang: string;
    translations: Record<string, string>;
}
type Translations = LanguageTranslations[];