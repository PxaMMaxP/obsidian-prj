export default interface ILanguageTranslations {
    /**
     * The language of the translations.
     */
    lang: string;
    /**
     * The translations.
     * @remarks The key is the translation key and the value is the translation.
     */
    translations: Record<string, string>;
}
