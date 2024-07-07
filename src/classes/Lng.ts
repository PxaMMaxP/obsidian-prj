/* istanbul ignore file */

import Global from 'src/classes/Global';
import Logging from 'src/classes/Logging';
import { Translations } from 'src/translations/Translations';
import ITranslationService from '../libs/TranslationService/interfaces/ITranslationService';
import { TranslationService } from '../libs/TranslationService/TranslationService';

/**
 * Wrapper class for the translation service to provide a compatibility layer eg. an In-Place-Replacement.
 */
export default class Lng {
    private static _instance: ITranslationService | undefined;

    /**
     * Gets the singleton instance of the translation service.
     */
    private static get instance(): ITranslationService {
        if (!Lng._instance) {
            Lng._instance = new TranslationService(
                Translations,
                Global.getInstance().settings,
                Logging.getLogger('Lng'),
            );
        }

        return Lng._instance;
    }

    /**
     * Returns a translation for the given key.
     * @param key The key to translate.
     * @returns The translation.
     * @remarks - If the translation is not found, the key is returned.
     * - Look at the `translations.json` file to see all available translations.
     */
    public static gt(key: string): string {
        return Lng.instance.get(key);
    }

    /**
     * Returns all translations for the given key.
     * @param key The key to translate.
     * @returns The translations.
     * @remarks - If the translation is not found, the key is returned.
     * - Look at the `translations.json` file to see all available translations.
     */
    public static gtAll(key: string): string[] {
        return Lng.instance.getAll(key);
    }
}
